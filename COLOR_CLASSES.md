# 🎨 Classes CSS adaptatives pour le thème

## Classes créées

Pour que les couleurs s'adaptent automatiquement entre mode sombre et clair, utilisez ces classes :

### Trading (Long/Short)

```css
/* Long (Achat) - Vert */
.trade-long          → Texte vert
.trade-long-bg       → Background vert transparent
.trade-long-border   → Bordure verte

/* Short (Vente) - Rouge */
.trade-short         → Texte rouge
.trade-short-bg      → Background rouge transparent
.trade-short-border  → Bordure rouge
```

### Profit/Loss

```css
/* Profit - Vert */
.profit-text         → Texte vert
.profit-bg           → Background vert transparent
.profit-border       → Bordure verte

/* Loss - Rouge */
.loss-text           → Texte rouge
.loss-bg             → Background rouge transparent
.loss-border         → Bordure rouge
```

## Adaptation automatique

### Mode Sombre
- Vert : `#10b981` (émeraude vif)
- Rouge : `#ef4444` (rouge vif)

### Mode Clair
- Vert : `#059669` (émeraude foncé - meilleur contraste)
- Rouge : `#dc2626` (rouge foncé - meilleur contraste)

## Utilisation

### Avant (hardcodé)
```tsx
<div className="text-green-500 bg-green-500/10">
  Long
</div>
```

### Maintenant (adaptatif)
```tsx
<div className="trade-long trade-long-bg">
  Long
</div>
```

**Résultat** : S'adapte automatiquement au mode sombre/clair ! ✅

## À remplacer partout

- `text-green-500` → `trade-long` ou `profit-text`
- `text-red-500` → `trade-short` ou `loss-text`
- `bg-green-500/10` → `trade-long-bg` ou `profit-bg`
- `bg-red-500/10` → `trade-short-bg` ou `loss-bg`
- `border-green-500/20` → `trade-long-border` ou `profit-border`
- `border-red-500/20` → `trade-short-border` ou `loss-border`

