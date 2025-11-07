# Résolution des problèmes de cache

## Problème
Si le système d'abonnement fonctionne dans un navigateur mais pas dans un autre, c'est probablement un problème de cache.

## Solutions

### 1. Vider le cache du navigateur

#### Chrome/Edge
1. Appuyez sur `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
2. Sélectionnez "Toutes les périodes"
3. Cochez :
   - ✅ Images et fichiers en cache
   - ✅ Cookies et autres données de sites
   - ✅ Données de sites en cache
4. Cliquez sur "Effacer les données"

#### Firefox
1. Appuyez sur `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
2. Sélectionnez "Tout"
3. Cochez :
   - ✅ Cache
   - ✅ Cookies
   - ✅ Données de sites
4. Cliquez sur "Effacer maintenant"

#### Safari
1. Menu Safari > Réglages > Avancé
2. Cochez "Afficher le menu Développement"
3. Menu Développement > Vider les caches
4. Menu Safari > Effacer l'historique > Tout l'historique

### 2. Vider le localStorage et sessionStorage

Ouvrez la console (F12) et exécutez :

```javascript
// Vider localStorage
localStorage.clear()

// Vider sessionStorage
sessionStorage.clear()

// Recharger la page
window.location.reload()
```

### 3. Mode navigation privée

Testez dans une fenêtre de navigation privée :
- **Chrome/Edge** : `Ctrl+Shift+N` (Windows) ou `Cmd+Shift+N` (Mac)
- **Firefox** : `Ctrl+Shift+P` (Windows) ou `Cmd+Shift+P` (Mac)
- **Safari** : `Cmd+Shift+N`

### 4. Hard Refresh (Rechargement forcé)

- **Windows** : `Ctrl+F5` ou `Ctrl+Shift+R`
- **Mac** : `Cmd+Shift+R`

### 5. Vider le cache Next.js

Si vous êtes en développement, arrêtez le serveur et supprimez le cache Next.js :

```bash
# Arrêter le serveur (Ctrl+C)

# Supprimer le cache Next.js
rm -rf .next

# Redémarrer le serveur
npm run dev
# ou
yarn dev
```

### 6. Vérifier les cookies de session

Dans la console (F12), vérifiez les cookies :

```javascript
// Voir tous les cookies
document.cookie

// Voir le localStorage
localStorage

// Voir le sessionStorage
sessionStorage
```

### 7. Désactiver le cache dans DevTools

1. Ouvrez DevTools (F12)
2. Allez dans l'onglet "Network"
3. Cochez "Disable cache"
4. Gardez DevTools ouvert pendant vos tests

### 8. Vérifier la version du code

Assurez-vous que le code est bien à jour :

```bash
# Vérifier les modifications
git status

# Si nécessaire, recharger les dépendances
npm install
# ou
yarn install
```

## Vérification après nettoyage

1. Videz le cache (étapes 1-2)
2. Rechargez la page en mode hard refresh (`Ctrl+F5` ou `Cmd+Shift+R`)
3. Connectez-vous avec `ms97970707@gmail.com`
4. Vérifiez les logs dans la console :
   - `🔐 Dashboard Layout - État complet:` devrait montrer les bonnes valeurs
   - `⚠️ ATTENTION - subscription_expires_at est NULL` si pas d'abonnement
   - `🚫 BLOCAGE - Accès refusé` si l'accès doit être bloqué

## Si le problème persiste

1. Vérifiez que vous êtes sur la bonne URL (pas une ancienne version)
2. Vérifiez que le code est bien déployé (si en production)
3. Vérifiez les logs du serveur pour des erreurs
4. Testez dans un navigateur complètement différent

## Prévention

Pour éviter les problèmes de cache en développement :

1. Utilisez toujours le mode hard refresh (`Ctrl+F5`)
2. Désactivez le cache dans DevTools pendant le développement
3. Utilisez le mode navigation privée pour tester
4. Videz régulièrement le cache pendant le développement
