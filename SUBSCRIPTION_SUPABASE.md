# Système d'abonnement avec Supabase Auth

## Architecture

### Gestion des utilisateurs

Les utilisateurs sont gérés par **Supabase Auth** (`auth.users`) :

1. **Création d'utilisateur** : Quand un utilisateur s'inscrit via `supabase.auth.signUp()`, il est créé dans `auth.users`
2. **Création automatique du profil** : Un trigger PostgreSQL (`on_auth_user_created`) crée automatiquement un profil dans la table `profiles`
3. **Relation** : La table `profiles` référence `auth.users(id)` avec une foreign key

### Tables impliquées

- **`auth.users`** : Gestion des utilisateurs par Supabase Auth
- **`profiles`** : Profils utilisateurs avec informations d'abonnement
- **`subscriptions`** : Détails des abonnements
- **`payment_history`** : Historique des paiements

## Fonctionnement du système d'abonnement

### 1. Activation d'abonnement

Quand un utilisateur paie (en espèces ou via Stripe) :

1. L'administrateur ou le système appelle `activateSubscription(userId, 1, 'cash' | 'stripe', amount)`
2. Le service met à jour :
   - `profiles.subscription_expires_at` = NOW() + 1 mois
   - `profiles.is_premium` = true
   - `profiles.subscription_tier` = 'pro'
3. Crée/actualise l'entrée dans `subscriptions`
4. Enregistre le paiement dans `payment_history`

### 2. Vérification d'accès

À chaque chargement du profil utilisateur :

1. `checkSubscriptionStatus(userId)` est appelé
2. Vérifie si `subscription_expires_at > NOW()`
3. Si expiré, met automatiquement à jour :
   - `profiles.is_premium` = false
   - `profiles.subscription_tier` = 'free'

### 3. Protection des routes

Le composant `SubscriptionGuard` vérifie l'abonnement avant d'afficher le contenu premium.

## Interface admin pour paiements en espèces

### Page : `/admin/subscriptions`

**Fonctionnalités** :
- Recherche d'utilisateurs par email ou nom
- Recherche dans la table `profiles` (créés automatiquement depuis `auth.users`)
- Activation manuelle d'abonnement de 1 mois
- Enregistrement du paiement avec `status = 'succeeded'` et `description = 'Paiement en espèces'`

**Utilisation** :
1. Se connecter en tant qu'administrateur (`account_type = 'admin'`)
2. Aller sur `/admin/subscriptions`
3. Rechercher un utilisateur par email ou nom
4. Cliquer sur l'utilisateur dans les résultats
5. Entrer le montant du paiement
6. Cliquer sur "Activer l'abonnement (1 mois)"

## Vérifications importantes

### 1. Trigger de création de profil

Assurez-vous que le trigger `on_auth_user_created` existe :

```sql
-- Vérifier que le trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Si absent, exécuter fix_auto_profile.sql
```

### 2. Policies RLS

Vérifiez que les policies RLS permettent :
- Aux administrateurs de lire/modifier les profils
- Aux utilisateurs de lire leur propre profil
- Aux administrateurs d'insérer dans `subscriptions` et `payment_history`

### 3. Profils manquants

Si un utilisateur existe dans `auth.users` mais pas dans `profiles` :

```sql
-- Créer les profils manquants
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
SELECT 
  u.id, 
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

## Requêtes SQL utiles

### Voir tous les utilisateurs avec leur statut d'abonnement

```sql
SELECT 
  p.email,
  p.full_name,
  p.is_premium,
  p.subscription_tier,
  p.subscription_expires_at,
  CASE 
    WHEN p.subscription_expires_at IS NULL THEN 'Aucun abonnement'
    WHEN p.subscription_expires_at > NOW() THEN 'Actif'
    ELSE 'Expiré'
  END as statut_abonnement,
  CASE 
    WHEN p.subscription_expires_at IS NOT NULL 
    THEN EXTRACT(DAY FROM (p.subscription_expires_at - NOW()))
    ELSE NULL
  END as jours_restants
FROM profiles p
ORDER BY p.created_at DESC;
```

### Voir les paiements récents

```sql
SELECT 
  ph.*,
  p.email,
  p.full_name
FROM payment_history ph
JOIN profiles p ON ph.user_id = p.id
ORDER BY ph.created_at DESC
LIMIT 20;
```

### Vérifier les abonnements actifs

```sql
SELECT 
  p.email,
  p.subscription_expires_at,
  s.status,
  s.current_period_end
FROM profiles p
LEFT JOIN subscriptions s ON p.id = s.user_id
WHERE p.is_premium = true
  AND p.subscription_expires_at > NOW();
```

## Notes importantes

1. **Les utilisateurs sont gérés par Supabase Auth** : Ne créez pas d'utilisateurs directement dans `profiles`. Utilisez `supabase.auth.signUp()`.

2. **Les profils sont créés automatiquement** : Le trigger `on_auth_user_created` crée automatiquement un profil quand un utilisateur s'inscrit.

3. **L'ID du profil = ID de l'utilisateur** : `profiles.id` référence directement `auth.users.id`.

4. **Vérification automatique** : L'expiration de l'abonnement est vérifiée automatiquement à chaque chargement du profil.

5. **Paiements en espèces** : Les paiements en espèces sont enregistrés dans `payment_history` avec `stripe_payment_intent_id = NULL` et `description = 'Paiement en espèces'`.
