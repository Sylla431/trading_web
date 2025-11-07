# Guide de test - Système d'abonnement mensuel

## Prérequis

1. Avoir un compte administrateur dans la base de données
2. Avoir au moins un compte utilisateur de test
3. Vérifier que les tables `subscriptions` et `payment_history` existent dans Supabase

## Tests à effectuer

### 1. Test de l'activation manuelle (Paiement en espèces)

#### Étapes :
1. **Se connecter en tant qu'administrateur**
   - Aller sur `/admin/subscriptions`
   - Vérifier que la page s'affiche correctement

2. **Rechercher un utilisateur**
   - Entrer l'email d'un utilisateur de test dans le champ de recherche
   - Cliquer sur "Rechercher"
   - Vérifier que l'utilisateur apparaît dans les résultats avec son statut actuel

3. **Activer un abonnement**
   - Cliquer sur un utilisateur dans les résultats
   - Vérifier que le formulaire d'activation s'affiche
   - Entrer un montant (ex: 29.99)
   - Cliquer sur "Activer l'abonnement (1 mois)"
   - Vérifier le message de succès

4. **Vérifier en base de données**
   ```sql
   -- Vérifier le profil
   SELECT id, email, is_premium, subscription_tier, subscription_expires_at 
   FROM profiles 
   WHERE email = 'email_utilisateur@test.com';
   
   -- Vérifier l'abonnement
   SELECT * FROM subscriptions WHERE user_id = 'user_id';
   
   -- Vérifier le paiement
   SELECT * FROM payment_history WHERE user_id = 'user_id' ORDER BY created_at DESC;
   ```

5. **Vérifications attendues** :
   - ✅ `is_premium` = `true`
   - ✅ `subscription_tier` = `'pro'`
   - ✅ `subscription_expires_at` = date actuelle + 1 mois
   - ✅ Une entrée dans `subscriptions` avec `status = 'active'`
   - ✅ Une entrée dans `payment_history` avec `status = 'succeeded'` et `description = 'Paiement en espèces'`

### 2. Test de la page utilisateur d'abonnement

#### Étapes :
1. **Se connecter avec l'utilisateur de test**
   - Aller sur `/dashboard/subscription`
   - Vérifier que la page s'affiche

2. **Vérifier le statut actif**
   - Si l'abonnement est actif, vérifier :
     - ✅ Badge "Actif" affiché
     - ✅ Date d'expiration affichée
     - ✅ Nombre de jours restants affiché
     - ✅ Historique des paiements affiché (si présent)

3. **Tester l'activation depuis la page utilisateur**
   - Si l'abonnement n'est pas actif, cliquer sur "Activer l'abonnement"
   - Vérifier que l'abonnement est activé
   - Vérifier que la page se recharge et affiche le nouveau statut

### 3. Test de la vérification automatique d'expiration

#### Étapes :
1. **Créer un abonnement qui expire bientôt** (pour test rapide)
   ```sql
   -- Mettre à jour l'expiration à 1 minute dans le futur
   UPDATE profiles 
   SET subscription_expires_at = NOW() + INTERVAL '1 minute'
   WHERE email = 'email_utilisateur@test.com';
   ```

2. **Attendre 2 minutes**

3. **Se reconnecter ou recharger la page**
   - Vérifier que `is_premium` est automatiquement mis à `false`
   - Vérifier que `subscription_tier` est mis à `'free'`

4. **Vérifier via le hook useSubscription**
   - Dans la console du navigateur, vérifier les logs
   - Vérifier que `isActive` = `false` et `isExpired` = `true`

### 4. Test du composant SubscriptionGuard

#### Étapes :
1. **Créer une page de test protégée**
   ```tsx
   // src/app/dashboard/test-premium/page.tsx
   'use client'
   import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard'
   
   export default function TestPremiumPage() {
     return (
       <SubscriptionGuard>
         <div>Contenu premium protégé</div>
       </SubscriptionGuard>
     )
   }
   ```

2. **Tester avec un utilisateur sans abonnement**
   - Aller sur `/dashboard/test-premium`
   - Vérifier que le message "Abonnement requis" s'affiche
   - Vérifier que le bouton "Gérer l'abonnement" redirige vers `/dashboard/subscription`

3. **Tester avec un utilisateur avec abonnement actif**
   - Activer un abonnement pour l'utilisateur
   - Aller sur `/dashboard/test-premium`
   - Vérifier que le contenu "Contenu premium protégé" s'affiche

### 5. Test du contexte d'authentification

#### Étapes :
1. **Vérifier hasActiveSubscription dans le contexte**
   - Se connecter avec un utilisateur ayant un abonnement actif
   - Dans la console du navigateur :
     ```javascript
     // Dans un composant React
     const { hasActiveSubscription } = useAuth()
     console.log('hasActiveSubscription:', hasActiveSubscription)
     ```
   - Vérifier que `hasActiveSubscription` = `true`

2. **Tester avec un utilisateur sans abonnement**
   - Se connecter avec un utilisateur sans abonnement
   - Vérifier que `hasActiveSubscription` = `false`

### 6. Test de prolongation d'abonnement

#### Étapes :
1. **Activer un abonnement pour un utilisateur**
   - Noter la date d'expiration initiale

2. **Prolonger l'abonnement** (via code ou directement en base)
   ```typescript
   // Dans la console ou via une fonction de test
   import { extendSubscription } from '@/lib/services/subscription'
   await extendSubscription(userId, 1) // Ajouter 1 mois
   ```

3. **Vérifier en base de données**
   ```sql
   SELECT subscription_expires_at FROM profiles WHERE id = 'user_id';
   ```
   - Vérifier que la date d'expiration a été prolongée d'1 mois

### 7. Test des cas limites

#### Test 1 : Utilisateur avec abonnement expiré
- Créer un utilisateur avec `subscription_expires_at` dans le passé
- Se connecter
- Vérifier que l'abonnement est automatiquement désactivé

#### Test 2 : Utilisateur sans date d'expiration
- Créer un utilisateur avec `subscription_expires_at = NULL`
- Se connecter
- Vérifier que `isActive` = `false`

#### Test 3 : Double activation
- Activer un abonnement pour un utilisateur
- Activer à nouveau immédiatement
- Vérifier que la date d'expiration est mise à jour (pas doublée)

## Checklist de validation

- [ ] L'activation manuelle fonctionne depuis `/admin/subscriptions`
- [ ] Le paiement est enregistré dans `payment_history`
- [ ] Le profil est mis à jour correctement (`is_premium`, `subscription_tier`, `subscription_expires_at`)
- [ ] L'entrée dans `subscriptions` est créée/mise à jour
- [ ] La page `/dashboard/subscription` affiche correctement le statut
- [ ] Le nombre de jours restants est calculé correctement
- [ ] L'historique des paiements s'affiche
- [ ] La vérification automatique d'expiration fonctionne
- [ ] Le composant `SubscriptionGuard` bloque l'accès si l'abonnement a expiré
- [ ] Le contexte `hasActiveSubscription` est correct
- [ ] La prolongation d'abonnement fonctionne

## Commandes SQL utiles pour les tests

```sql
-- Voir tous les abonnements actifs
SELECT p.email, p.is_premium, p.subscription_tier, p.subscription_expires_at,
       s.status, s.current_period_end
FROM profiles p
LEFT JOIN subscriptions s ON p.id = s.user_id
WHERE p.is_premium = true;

-- Voir les paiements récents
SELECT ph.*, p.email
FROM payment_history ph
JOIN profiles p ON ph.user_id = p.id
ORDER BY ph.created_at DESC
LIMIT 10;

-- Simuler l'expiration d'un abonnement (pour test)
UPDATE profiles 
SET subscription_expires_at = NOW() - INTERVAL '1 day'
WHERE email = 'email_utilisateur@test.com';

-- Réinitialiser un abonnement (pour test)
UPDATE profiles 
SET is_premium = false, 
    subscription_tier = 'free', 
    subscription_expires_at = NULL
WHERE email = 'email_utilisateur@test.com';
```

## Problèmes courants et solutions

### Problème : L'abonnement ne s'active pas
- **Solution** : Vérifier les policies RLS sur les tables `profiles`, `subscriptions`, et `payment_history`
- Vérifier que l'utilisateur a les permissions nécessaires

### Problème : La vérification d'expiration ne fonctionne pas
- **Solution** : Vérifier que `checkSubscriptionStatus` est appelé dans `loadProfile`
- Vérifier les logs de la console pour les erreurs

### Problème : Le composant SubscriptionGuard ne bloque pas
- **Solution** : Vérifier que `useSubscription` retourne correctement `isActive = false`
- Vérifier que le composant est bien utilisé autour du contenu à protéger

## Notes

- Les tests doivent être effectués dans un environnement de développement
- Utiliser des données de test, pas des données de production
- Vérifier les logs de la console et les erreurs réseau
- Tester avec différents rôles d'utilisateur (admin, utilisateur normal)
