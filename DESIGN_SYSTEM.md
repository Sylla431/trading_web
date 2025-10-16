# 🎨 Design System - TradingJournal

## 🌟 Vue d'ensemble

Design moderne avec **glassmorphism**, **cards flottantes** et **sidebar flottant**.

## 🎨 Palette de couleurs

### Couleur primaire - Vert émeraude
- **Primary**: `#10b981` (Emerald 500)
- **Primary Light**: `#34d399` (Emerald 400)  
- **Primary Dark**: `#059669` (Emerald 600)

### Couleurs de trading
- **Profit**: `#10b981` 🟢 (Vert émeraude)
- **Loss**: `#ef4444` 🔴 (Rouge)
- **Warning**: `#f59e0b` 🟡 (Orange)

### Couleurs de fond

#### Mode sombre (par défaut)
- **Background**: Gradient `#0f172a` → `#1e293b`
- **Card**: `rgba(30, 41, 59, 0.7)` avec backdrop-blur
- **Border**: `rgba(71, 85, 105, 0.3)`

#### Mode clair
- **Background**: Gradient `#f8fafc` → `#e2e8f0`
- **Card**: `#ffffff`
- **Border**: `#e2e8f0`

## 📦 Composants

### Cards flottantes
```tsx
<Card className="...">
  // Contenu
</Card>
```

**Caractéristiques** :
- ✅ Bordures arrondies (`rounded-2xl`)
- ✅ Effet glassmorphism (`backdrop-blur-xl`)
- ✅ Ombres portées (`shadow-2xl`)
- ✅ Hover effect (ombre plus prononcée)
- ✅ Semi-transparence (`bg-card/80`)

### Sidebar flottant

**Design** :
- 📍 Position: `fixed left-4 top-4 bottom-4`
- 📐 Largeur: `w-64` (256px)
- 🎨 Background: Glassmorphism avec `backdrop-blur-xl`
- 🔘 Bordures: `rounded-3xl`
- ✨ Avatar: Gradient circulaire

**Navigation** :
- Item actif: Gradient vert avec ombre
- Item hover: Background secondaire
- Transitions fluides

### Boutons

#### Variants

**Default** (Primary)
```tsx
<Button>Action</Button>
```
- Gradient vert émeraude
- Ombre colorée
- Effet scale au hover

**Outline**
```tsx
<Button variant="outline">Action</Button>
```
- Bordure 2px
- Background glassmorphism
- Hover avec changement de background

**Ghost**
```tsx
<Button variant="ghost">Action</Button>
```
- Transparent
- Hover subtil

**Destructive**
```tsx
<Button variant="destructive">Supprimer</Button>
```
- Rouge
- Ombre rouge
- Effet scale

#### Sizes
- `sm`: Petit (h-9)
- `default`: Normal (h-10)
- `lg`: Grand (h-12)
- `icon`: Carré (h-10 w-10)

### Inputs

**Design moderne** :
```tsx
<Input placeholder="Email..." />
```

**Caractéristiques** :
- ✅ Hauteur: `h-11`
- ✅ Bordure: `border-2 border-border/50`
- ✅ Background: Glassmorphism
- ✅ Focus: Bordure verte + ombre colorée
- ✅ Hover: Bordure verte atténuée
- ✅ Transitions fluides

## 🎯 Effets visuels

### Glassmorphism
Utilisé pour créer un effet de verre dépoli moderne :
```css
bg-card/80 backdrop-blur-xl
```

### Shadows (Ombres)
Hiérarchie des ombres :
- Card: `shadow-2xl shadow-black/10`
- Hover card: `shadow-3xl shadow-black/20`
- Button: `shadow-lg shadow-primary/30`
- Sidebar: `shadow-2xl shadow-black/20`

### Gradients
```css
/* Logo et titres */
bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent

/* Buttons */
bg-gradient-to-r from-primary to-emerald-400

/* Avatar */
bg-gradient-to-br from-primary to-emerald-400

/* Background */
background: linear-gradient(to bottom right, #0f172a, #1e293b)
```

### Animations
Toutes les transitions utilisent :
```css
transition-all duration-200
```

Effets :
- **Hover scale**: `hover:scale-105`
- **Hover shadow**: Augmentation de l'ombre
- **Focus ring**: Anneau coloré

## 🔤 Typographie

### Fonts
- **Sans**: Geist Sans (variable)
- **Mono**: Geist Mono (variable)

### Hiérarchie
- **H1**: `text-3xl font-bold`
- **H2**: `text-2xl font-bold`
- **H3**: `text-xl font-semibold`
- **Body**: `text-sm` ou `text-base`
- **Small**: `text-xs`

## 📏 Espacements

### Radius
- `rounded-lg`: 0.5rem (buttons small)
- `rounded-xl`: 0.75rem (buttons, inputs, nav items)
- `rounded-2xl`: 1rem (cards)
- `rounded-3xl`: 1.5rem (sidebar)

### Padding
- Cards: `p-6`
- Sidebar: `p-4`
- Nav items: `px-4 py-3`
- Buttons: `px-5 py-2`

### Gaps
- Nav items: `space-y-2`
- Icon + text: `gap-3`
- Button content: `gap-2`

## 🎭 États interactifs

### Hover
Tous les éléments cliquables ont un état hover :
- Cards: Ombre plus prononcée
- Buttons: Scale + ombre renforcée
- Nav items: Background + changement couleur
- Inputs: Bordure verte atténuée

### Focus
Les inputs et buttons ont un focus ring :
```css
focus-visible:ring-2 focus-visible:ring-primary
```

### Active
Les nav items actifs ont :
- Gradient vert
- Texte blanc
- Ombre colorée

### Disabled
```css
disabled:opacity-50 disabled:pointer-events-none
```

## 📱 Responsive

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px (sidebar devient visible)
- `xl`: 1280px

### Mobile
- Sidebar caché par défaut
- Bouton menu hamburger
- Overlay au clic
- Cards en colonne unique

### Desktop
- Sidebar toujours visible et flottant
- Margin left pour le contenu principal
- Grid multi-colonnes pour les cards

## 🌙 Mode sombre

Par défaut, l'application est en **mode sombre**.

Le thème s'adapte automatiquement à la préférence système avec `prefers-color-scheme: dark`.

### Personnalisation
Pour forcer un thème :
```tsx
<ThemeProvider defaultTheme="dark">
```

## 🎨 Utilisation

### Créer une card flottante
```tsx
<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu
  </CardContent>
</Card>
```

### Créer un bouton avec gradient
```tsx
<Button>
  <Icon className="w-4 h-4" />
  Action
</Button>
```

### Input avec label
```tsx
<div className="space-y-2">
  <Label>Email</Label>
  <Input type="email" placeholder="vous@example.com" />
</div>
```

## 🚀 Performance

### Optimisations
- ✅ Backdrop-blur activé uniquement où nécessaire
- ✅ Transitions CSS natives (GPU accelerated)
- ✅ Animations légères (scale, opacity)
- ✅ Lazy loading des composants lourds

### Accessibilité
- ✅ Focus visible sur tous les éléments interactifs
- ✅ Contraste suffisant (WCAG AA)
- ✅ Aria labels où nécessaire
- ✅ Navigation au clavier

## 💡 Bonnes pratiques

### À faire ✅
- Utiliser les composants UI fournis
- Respecter la palette de couleurs
- Appliquer les transitions
- Tester en mode sombre ET clair
- Vérifier le responsive

### À éviter ❌
- Ajouter des couleurs custom sans raison
- Utiliser des bordures non arrondies
- Oublier les états hover/focus
- Mélanger différents styles de radius
- Ignorer le glassmorphism des cards

## 🎯 Exemples

### Dashboard Stats Card
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total trades</CardTitle>
    <BarChart3 className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">150</div>
    <p className="text-xs text-muted-foreground">+10 ce mois-ci</p>
  </CardContent>
</Card>
```

### Profit/Loss Badge
```tsx
<span className={cn(
  "px-3 py-1 rounded-lg text-sm font-medium",
  profit >= 0 
    ? "bg-profit/10 text-profit" 
    : "bg-loss/10 text-loss"
)}>
  {profit >= 0 ? '+' : ''}{profit.toFixed(2)} $
</span>
```

---

**Design créé avec ❤️ pour TradingJournal**

