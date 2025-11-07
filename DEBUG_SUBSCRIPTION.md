# Guide de débogage - Système d'abonnement

## Comment vérifier les logs

### 1. Ouvrir la console du navigateur

1. **Chrome/Edge** : Appuyez sur `F12` ou `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. **Firefox** : Appuyez sur `F12` ou `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
3. **Safari** : Activez d'abord le menu Développeur dans les préférences, puis `Cmd+Option+C`

### 2. Vérifier les filtres de la console

Assurez-vous que :
- Les filtres "Info", "Warnings", "Errors" sont activés
- Aucun filtre de texte n'est appliqué qui masquerait les logs
- La console n'est pas vidée automatiquement

### 3. Logs à rechercher

Quand vous vous connectez et allez sur `/dashboard`, vous devriez voir ces logs dans l'ordre :

#### A. AuthContext (chargement du profil)
```
👤 AuthContext - loadProfile appelé: { userId: "..." }
✅ AuthContext - Profil chargé: { id: "...", email: "...", is_premium: false, subscription_expires_at: null, account_type: "individual" }
🔍 AuthContext - Vérification abonnement...
🔍 Vérification abonnement: { userId: "...", expiresAt: null, ... }
⚠️ Pas de date d'expiration - Abonnement inactif
📊 Calcul statut: { isExpired: true, daysRemaining: 0, isActive: false }
📊 AuthContext - Statut abonnement: { isActive: false, ... }
✅ AuthContext - loadProfile terminé
```

#### B. useSubscription Hook
```
🔧 useSubscription - Hook initialisé: { hasProfile: true, profileId: "..." }
🔄 useSubscription - useEffect déclenché: { hasProfile: true, profileId: "..." }
🔄 useSubscription - Chargement statut: { hasProfile: true, profileId: "..." }
🔍 Vérification abonnement: { userId: "...", expiresAt: null, ... }
⚠️ Pas de date d'expiration - Abonnement inactif
📊 useSubscription - Statut abonnement: { userId: "...", status: { isActive: false, ... } }
```

#### C. DashboardLayout
```
🚀 DashboardLayout - Composant rendu
👤 DashboardLayout - Auth: { hasUser: true, hasProfile: true, loading: false }
📊 DashboardLayout - Subscription: { isActive: false, subscriptionLoading: false, isExpired: true }
📍 DashboardLayout - Route: { pathname: "/dashboard" }
🔐 Dashboard Layout - État: { hasUser: true, hasProfile: true, isAdmin: false, isActive: false, isExpired: true, subscriptionLoading: false, pathname: "/dashboard" }
🚫 Accès refusé - Pas d'abonnement actif: { isActive: false, pathname: "/dashboard", isPublicRoute: false, subscriptionLoading: false, isAdmin: false }
🚫 BLOCAGE - Accès refusé: { subscriptionLoading: false, hasProfile: true, profileId: "...", isActive: false, isPublicRoute: false, isAdmin: false, pathname: "/dashboard" }
```

## Si vous ne voyez AUCUN log

### Vérifications à faire :

1. **Vérifier que la console est bien ouverte**
   - La console doit être visible dans le navigateur
   - Vérifiez que vous êtes sur l'onglet "Console" et non "Network" ou "Elements"

2. **Vérifier les filtres**
   - Cliquez sur l'icône de filtre dans la console
   - Assurez-vous que "Info", "Warnings", "Errors" sont tous activés
   - Vérifiez qu'aucun filtre de texte n'est appliqué

3. **Vérifier les erreurs de compilation**
   - Regardez s'il y a des erreurs en rouge dans la console
   - Vérifiez l'onglet "Console" pour les erreurs TypeScript/JavaScript
   - Vérifiez l'onglet "Network" pour les erreurs de requêtes

4. **Vérifier que le code se charge**
   - Ouvrez l'onglet "Network" dans la console
   - Rechargez la page (F5)
   - Vérifiez que les fichiers JavaScript se chargent correctement
   - Cherchez des erreurs 404 ou 500

5. **Vérifier la base de données**
   - Allez dans Supabase Dashboard
   - Vérifiez que la table `profiles` existe
   - Vérifiez que l'utilisateur "test" a bien un profil dans `profiles`
   - Vérifiez que `subscription_expires_at` est bien `NULL` pour cet utilisateur

## Test rapide

Pour tester si les logs fonctionnent, ajoutez ceci dans la console du navigateur :

```javascript
console.log('TEST - Les logs fonctionnent !')
```

Si vous voyez ce message, les logs fonctionnent. Si vous ne le voyez pas, il y a un problème avec la console.

## Vérification manuelle de l'abonnement

Exécutez cette requête SQL dans Supabase pour vérifier l'utilisateur "test" :

```sql
SELECT 
  id,
  email,
  is_premium,
  subscription_tier,
  subscription_expires_at,
  account_type
FROM profiles
WHERE email = 'email_utilisateur_test@example.com';
```

Vérifiez que :
- `is_premium` = `false`
- `subscription_tier` = `'free'`
- `subscription_expires_at` = `NULL`
- `account_type` = `'individual'` (pas `'admin'`)

## Si les logs s'affichent mais l'accès n'est pas bloqué

Vérifiez dans les logs :
1. `isActive` doit être `false`
2. `isAdmin` doit être `false`
3. `isPublicRoute` doit être `false` pour `/dashboard`
4. `subscriptionLoading` doit être `false`

Si toutes ces conditions sont remplies mais que l'accès n'est pas bloqué, il y a un problème dans la logique de blocage.
