# Utilisation des tables pour les abonnements

## Table `profiles` - Source de vérité principale ✅

La table `profiles` est **la source de vérité** pour vérifier l'accès et le statut d'abonnement.

### Champs utilisés :
- `subscription_expires_at` : Date d'expiration de l'abonnement (TIMESTAMPTZ)
- `is_premium` : Booléen indiquant si l'utilisateur a un abonnement actif
- `subscription_tier` : Niveau d'abonnement ('free', 'pro', 'premium')

### Utilisation :
- ✅ **Vérification du statut** : `checkSubscriptionStatus()` lit depuis `profiles`
- ✅ **Contrôle d'accès** : Le layout du dashboard vérifie `is_premium` et `subscription_expires_at`
- ✅ **Mise à jour lors de l'activation** : `activateSubscription()` met à jour `profiles`
- ✅ **Mise à jour lors de l'expiration** : `checkSubscriptionStatus()` met à jour `profiles` si expiré

### Exemple de requête :
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_expires_at, is_premium, subscription_tier')
  .eq('id', userId)
  .single()

// Vérifier si l'abonnement est actif
const isActive = profile?.subscription_expires_at 
  && new Date(profile.subscription_expires_at) > new Date()
```

---

## Table `subscriptions` - Table complémentaire (historique) 📊

La table `subscriptions` est utilisée pour **l'historique et l'intégration avec Stripe**.

### Champs utilisés :
- `user_id` : ID de l'utilisateur
- `stripe_subscription_id` : ID de l'abonnement Stripe (si applicable)
- `plan` : Plan d'abonnement ('free', 'pro', 'premium')
- `status` : Statut de l'abonnement ('active', 'canceled', etc.)
- `current_period_start` : Début de la période actuelle
- `current_period_end` : Fin de la période actuelle

### Utilisation :
- ✅ **Création/mise à jour lors de l'activation** : `activateSubscription()` crée/met à jour l'entrée
- ❌ **PAS utilisée pour la vérification d'accès** : On ne lit pas depuis `subscriptions` pour vérifier l'accès
- ✅ **Historique** : Pour garder un historique des abonnements
- ✅ **Intégration Stripe** : Pour synchroniser avec Stripe

### Exemple de requête :
```typescript
// Créer/mettre à jour l'entrée dans subscriptions
const subscriptionData = {
  user_id: userId,
  plan: 'pro',
  status: 'active',
  current_period_start: new Date().toISOString(),
  current_period_end: expiresAt.toISOString(),
}
```

---

## Résumé

| Action | Table utilisée | Pourquoi |
|--------|----------------|----------|
| **Vérifier l'accès** | `profiles` | Source de vérité, plus rapide, toujours à jour |
| **Activer un abonnement** | `profiles` + `subscriptions` | Mise à jour des deux pour cohérence |
| **Vérifier l'expiration** | `profiles` | Lecture depuis `subscription_expires_at` |
| **Historique** | `subscriptions` | Pour garder un historique détaillé |
| **Intégration Stripe** | `subscriptions` | Pour synchroniser avec Stripe |

---

## ⚠️ Important

**Pour la vérification d'accès et le contrôle, utilisez TOUJOURS la table `profiles` :**

```typescript
// ✅ CORRECT - Utiliser profiles
const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_expires_at, is_premium')
  .eq('id', userId)
  .single()

const isActive = profile?.subscription_expires_at 
  && new Date(profile.subscription_expires_at) > new Date()

// ❌ INCORRECT - Ne pas utiliser subscriptions pour la vérification
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('status')
  .eq('user_id', userId)
  .single()
```

---

## Logique actuelle dans le code

1. **`checkSubscriptionStatus()`** : Lit depuis `profiles` uniquement
2. **`activateSubscription()`** : Met à jour `profiles` ET `subscriptions`
3. **Dashboard Layout** : Vérifie `isActive` depuis `useSubscription()` qui lit `profiles`
4. **Expiration** : Met à jour `profiles` automatiquement si expiré

**Conclusion : Utilisez `profiles` pour tout ce qui concerne la vérification d'accès et le contrôle.**
