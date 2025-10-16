# 🎨 Système de changement de couleurs de thème

## ✨ Vue d'ensemble

L'application dispose maintenant d'un **système complet de changement de couleurs** avec 7 palettes prédéfinies.

## 🌈 Palettes disponibles

### 1. Émeraude (Par défaut) 💚
- **Primary**: `#10b981`
- **Light**: `#34d399`
- **Dark**: `#059669`
- Usage: Couleur équilibrée et professionnelle pour le trading

### 2. Bleu 💙
- **Primary**: `#3b82f6`
- **Light**: `#60a5fa`
- **Dark**: `#2563eb`
- Usage: Couleur classique et sérieuse

### 3. Violet 💜
- **Primary**: `#8b5cf6`
- **Light**: `#a78bfa`
- **Dark**: `#7c3aed`
- Usage: Couleur créative et moderne

### 4. Orange 🧡
- **Primary**: `#f97316`
- **Light**: `#fb923c`
- **Dark**: `#ea580c`
- Usage: Couleur énergique et dynamique

### 5. Rose 💗
- **Primary**: `#f43f5e`
- **Light**: `#fb7185`
- **Dark**: `#e11d48`
- Usage: Couleur vive et attrayante

### 6. Cyan 🩵
- **Primary**: `#06b6d4`
- **Light**: `#22d3ee`
- **Dark**: `#0891b2`
- Usage: Couleur fraîche et technologique

### 7. Ambre 🟡
- **Primary**: `#f59e0b`
- **Light**: `#fbbf24`
- **Dark**: `#d97706`
- Usage: Couleur chaleureuse et positive

## 🔧 Fonctionnalités

### ✅ Implémenté

1. **Sélecteur dans la Sidebar**
   - Icône palette en bas de la sidebar
   - Ouverture d'un menu avec 7 pastilles colorées
   - Changement instantané au clic

2. **Page de paramètres complète**
   - Section "Apparence" avec ThemeSwitcher
   - Cards avec aperçu de chaque couleur
   - Nom explicite pour chaque palette
   - Aperçu en temps réel des 3 nuances

3. **Sauvegarde automatique**
   - Enregistrement dans `localStorage`
   - Persistance entre les sessions
   - Chargement automatique au démarrage

4. **Application dynamique**
   - Variables CSS `--color-primary` modifiées en direct
   - Transitions fluides
   - Pas de rechargement nécessaire

## 📁 Architecture

### Fichiers créés/modifiés

```
src/
├── contexts/
│   └── ThemeContext.tsx          ✨ Nouveau - Context pour la gestion des couleurs
├── components/
│   ├── shared/
│   │   └── ThemeSwitcher.tsx     ✨ Nouveau - Composant sélecteur complet
│   └── layout/
│       └── Sidebar.tsx            ✏️ Modifié - Ajout du sélecteur rapide
├── app/
│   ├── layout.tsx                 ✏️ Modifié - Ajout du ThemeProvider
│   ├── globals.css                ✏️ Modifié - Variables CSS dynamiques
│   └── dashboard/
│       └── settings/
│           └── page.tsx           ✨ Nouveau - Page de paramètres
```

### Context ThemeContext

```tsx
// Utilisation dans un composant
import { useTheme } from '@/contexts/ThemeContext'

const { colorTheme, setColorTheme } = useTheme()

// Changer la couleur
setColorTheme('blue')
```

### Palettes disponibles

```tsx
type ColorTheme = 'emerald' | 'blue' | 'violet' | 'orange' | 'rose' | 'cyan' | 'amber'
```

## 🎯 Utilisation

### Changer de couleur via la Sidebar

1. Cliquez sur le bouton **"Couleur"** avec l'icône palette
2. Un menu s'ouvre avec 7 pastilles colorées
3. Cliquez sur une pastille
4. La couleur change instantanément

### Changer de couleur via les Paramètres

1. Allez dans **Paramètres** (icône Settings dans la sidebar)
2. Section **"Apparence"**
3. Sélectionnez une carte de couleur
4. Visualisez l'aperçu avec les 3 nuances

## 🔮 Variables CSS

Les couleurs sont appliquées via les variables CSS :

```css
:root {
  --color-primary: var(--color-primary, #10b981);
  --color-ring: var(--color-primary, #10b981);
  --color-profit: var(--color-primary, #10b981);
}
```

Ces variables sont modifiées dynamiquement via JavaScript :

```tsx
document.documentElement.style.setProperty('--color-primary', colors.primary)
```

## 💡 Comment ça marche

### 1. Sélection de la couleur

```tsx
// L'utilisateur clique sur une couleur
setColorTheme('blue')
```

### 2. Sauvegarde

```tsx
// Enregistrement dans localStorage
localStorage.setItem('color-theme', 'blue')
```

### 3. Application

```tsx
// Modification des variables CSS
const colors = colorThemes['blue']
document.documentElement.style.setProperty('--color-primary', '#3b82f6')
document.documentElement.style.setProperty('--color-primary-light', '#60a5fa')
document.documentElement.style.setProperty('--color-primary-dark', '#2563eb')
```

### 4. Résultat

Tous les composants qui utilisent `--color-primary` changent instantanément :
- Boutons
- Links actifs dans la navigation
- Avatars
- Ombres colorées
- Badges de profit
- Focus rings
- Etc.

## 🎨 Éléments affectés

Quand vous changez de couleur, ces éléments changent automatiquement :

### Navigation
- ✅ Items actifs (gradient)
- ✅ Hover effects
- ✅ Avatar de l'utilisateur

### Boutons
- ✅ Boutons primaires (gradient)
- ✅ Ombres colorées
- ✅ Focus rings

### Dashboard
- ✅ Badges de profit
- ✅ Icônes
- ✅ Graphiques (couleur primaire)

### Forms
- ✅ Focus sur les inputs
- ✅ Bordures actives
- ✅ Checkboxes

## 🚀 Extensibilité

### Ajouter une nouvelle couleur

1. Ouvrir `src/contexts/ThemeContext.tsx`

2. Ajouter la couleur dans `colorThemes`:

```tsx
const colorThemes = {
  // ...existantes
  indigo: {
    primary: '#6366f1',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',
  },
}
```

3. Ajouter le type:

```tsx
type ColorTheme = '...' | 'indigo'
```

4. Ajouter le label dans `ThemeSwitcher.tsx`:

```tsx
const themeLabels: Record<ColorTheme, string> = {
  // ...existants
  indigo: 'Indigo',
}
```

C'est tout ! La nouvelle couleur apparaîtra automatiquement.

## 🎯 Bonnes pratiques

### ✅ À faire

- Utiliser les variables CSS pour les couleurs principales
- Tester chaque nouvelle couleur avec tous les composants
- Garder une bonne lisibilité (contraste suffisant)

### ❌ À éviter

- Ne pas ajouter de couleurs trop similaires
- Ne pas modifier directement les couleurs dans les composants
- Ne pas oublier de tester en mode sombre ET clair

## 📱 Responsive

Le sélecteur de couleurs fonctionne sur tous les écrans :

- **Desktop** : Grid 2 colonnes dans les paramètres, grid 4 colonnes dans la sidebar
- **Mobile** : Grids adaptées, scrolling si nécessaire

## 🔒 Persistance

Les préférences de couleur sont sauvegardées dans `localStorage` :

```typescript
localStorage.getItem('color-theme') // Lecture
localStorage.setItem('color-theme', 'blue') // Écriture
```

La couleur est rechargée automatiquement au prochain démarrage.

## 🎉 Résultat

Votre application dispose maintenant d'un système complet et professionnel de changement de couleurs qui :

- ✅ Offre 7 palettes magnifiques
- ✅ Change instantanément
- ✅ Persiste entre les sessions
- ✅ S'intègre parfaitement au design
- ✅ Est facilement extensible

**Profitez de votre interface personnalisable ! 🎨**

