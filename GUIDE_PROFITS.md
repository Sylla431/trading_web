# 💰 Guide des Profits - Dépannage

## 🎯 Problème : Les profits ne s'affichent pas

### Causes possibles

1. ❌ **Dashboard utilise des données en dur** (CORRIGÉ ✅)
2. ❌ **Profil utilisateur manquant**
3. ❌ **Trades sans profits calculés**
4. ❌ **Trigger de calcul désactivé**

## ✅ Solutions appliquées

### 1. Dashboard corrigé

Le dashboard charge maintenant **les vraies données** depuis Supabase :

```tsx
const { trades, loading, fetchTrades } = useTrades()
const stats = useTradeStats(trades)
```

**Fonctionnalités ajoutées** :
- ✅ Chargement des trades réels
- ✅ Calcul automatique des statistiques
- ✅ Bouton "Actualiser" pour recharger
- ✅ Affichage des 5 derniers trades
- ✅ Indicateur de chargement

### 2. Calcul automatique des profits

Le trigger SQL `calculate_trade_metrics()` calcule automatiquement :
- ✅ `gross_profit` (profit brut)
- ✅ `net_profit` (profit net après commissions)
- ✅ `duration_minutes` (durée du trade)

### 3. Script de vérification

Fichier `verify_profits.sql` pour :
- 🔍 Vérifier les trades sans profit
- 🔧 Recalculer manuellement si nécessaire
- 📊 Afficher les statistiques
- 📋 Lister les derniers trades

## 🚀 Comment utiliser

### Étape 1 : Exécuter le fix du trigger (si nécessaire)

Si les profits ne se calculent toujours pas automatiquement :

```sql
-- Dans Supabase SQL Editor
-- Copier depuis DATABASE_SCHEMA.sql, lignes 555-579
CREATE OR REPLACE FUNCTION calculate_trade_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'closed' AND NEW.exit_price IS NOT NULL THEN
        -- Calculer la durée
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.exit_time - NEW.entry_time)) / 60;
        
        -- Calculer le profit/perte brut
        IF NEW.trade_type = 'long' THEN
            NEW.gross_profit = (NEW.exit_price - NEW.entry_price) * COALESCE(NEW.position_size, NEW.lot_size * 100000);
        ELSE
            NEW.gross_profit = (NEW.entry_price - NEW.exit_price) * COALESCE(NEW.position_size, NEW.lot_size * 100000);
        END IF;
        
        -- Calculer le profit net
        NEW.net_profit = NEW.gross_profit - COALESCE(NEW.commission, 0) - COALESCE(NEW.swap, 0);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
DROP TRIGGER IF EXISTS calculate_trade_metrics_trigger ON trades;
CREATE TRIGGER calculate_trade_metrics_trigger 
    BEFORE INSERT OR UPDATE ON trades
    FOR EACH ROW 
    EXECUTE FUNCTION calculate_trade_metrics();
```

### Étape 2 : Recalculer les profits existants

Si vous avez des trades déjà insérés sans profits :

```sql
-- Exécutez verify_profits.sql, section 2
UPDATE trades
SET 
    position_size = COALESCE(position_size, lot_size * 100000),
    gross_profit = CASE 
        WHEN trade_type = 'long' THEN 
            (exit_price - entry_price) * COALESCE(position_size, lot_size * 100000)
        ELSE 
            (entry_price - exit_price) * COALESCE(position_size, lot_size * 100000)
    END,
    net_profit = CASE 
        WHEN trade_type = 'long' THEN 
            ((exit_price - entry_price) * COALESCE(position_size, lot_size * 100000)) 
            - COALESCE(commission, 0) - COALESCE(swap, 0)
        ELSE 
            ((entry_price - exit_price) * COALESCE(position_size, lot_size * 100000)) 
            - COALESCE(commission, 0) - COALESCE(swap, 0)
    END
WHERE status = 'closed' AND exit_price IS NOT NULL;
```

### Étape 3 : Actualiser l'application

Dans l'application :
1. Cliquez sur le bouton **"Actualiser"** ↻ en haut à droite
2. Ou rechargez la page (F5)
3. Les vraies stats devraient s'afficher ! 📊

## 📊 Vérification des statistiques

### Dans Supabase

```sql
-- Remplacez YOUR_USER_ID
SELECT 
    COUNT(*) as "Total trades",
    COUNT(*) FILTER (WHERE net_profit > 0) as "Gagnants",
    COUNT(*) FILTER (WHERE net_profit < 0) as "Perdants",
    ROUND(SUM(net_profit)::numeric, 2) as "Profit total",
    ROUND((COUNT(*) FILTER (WHERE net_profit > 0)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as "Win rate %"
FROM trades
WHERE status = 'closed' 
  AND user_id = 'YOUR_USER_ID';
```

### Dans l'application

Vérifiez que le dashboard affiche :
- ✅ Total trades > 0
- ✅ Win rate calculé
- ✅ Profit net affiché
- ✅ Profit Factor calculé
- ✅ Liste des 5 derniers trades

## 🔧 Si ça ne marche toujours pas

### Problème 1 : Les données ne chargent pas

**Solution** : Vérifiez les RLS policies

```sql
-- Vérifier que vous pouvez voir vos trades
SELECT COUNT(*) FROM trades WHERE user_id = auth.uid();
```

Si le résultat est 0 alors que vous avez des trades :

```sql
-- Recréer les policies
DROP POLICY IF EXISTS "Users can view own trades" ON trades;
CREATE POLICY "Users can view own trades" ON trades
    FOR SELECT USING (auth.uid() = user_id);
```

### Problème 2 : Hook ne se déclenche pas

Dans `useTrades.ts`, le hook charge les données au montage du composant.

**Solution** : Ajoutez ce code dans votre composant :

```tsx
useEffect(() => {
  fetchTrades() // Force le rechargement
}, [])
```

### Problème 3 : Cache navigateur

**Solution** : 
1. Ouvrez DevTools (F12)
2. Onglet Network
3. Cochez "Disable cache"
4. Rechargez (Ctrl+R ou Cmd+R)

## 📝 Checklist de dépannage

- [ ] Profil créé dans `profiles` ?
- [ ] Trades insérés avec succès ?
- [ ] Trigger `calculate_trade_metrics` existe ?
- [ ] RLS policies activées ?
- [ ] Application relancée (`npm run dev`) ?
- [ ] Page rechargée (F5) ?
- [ ] Bouton "Actualiser" cliqué ?

## 🎉 Après la correction

Vous devriez voir :
- 📊 **Dashboard** avec vraies stats
- 💰 **Profits** calculés et affichés
- 📈 **Win rate** correct
- 🎯 **Profit Factor** calculé
- 📋 **5 derniers trades** listés

## 💡 Pour l'avenir

### Automatisation complète

Avec le trigger dans `fix_auto_profile.sql` :
- ✅ Profil créé automatiquement
- ✅ Pas d'erreur d'insertion
- ✅ Données cohérentes

### Debugging

Si vous ajoutez un trade et qu'il n'apparaît pas :
1. Cliquez sur **"Actualiser"** ↻
2. Vérifiez dans Supabase : `SELECT * FROM trades ORDER BY created_at DESC LIMIT 5`
3. Vérifiez les RLS policies

---

**Vos profits devraient maintenant s'afficher correctement ! 💰✨**

