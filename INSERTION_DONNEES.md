# 📊 Guide d'insertion de données de test

## 🎯 Vue d'ensemble

Le fichier `seed_data.sql` contient **des données réalistes** pour tester votre application :

- ✅ 12 instruments de trading
- ✅ 4 stratégies de trading
- ✅ 20 trades (15 gagnants + 5 perdants)
- ✅ 2 trades ouverts
- ✅ 1 plan de trading
- ✅ 5 entrées de journal
- ✅ 3 objectifs
- ✅ 5 événements calendrier
- ✅ 3 notifications

## 🚀 Comment utiliser le script

### Méthode 1 : Via l'interface Supabase (RECOMMANDÉ)

#### Étape 1 : Obtenir votre ID utilisateur

1. Créez un compte dans votre application (`/register`)
2. Allez dans **Supabase** > **SQL Editor**
3. Exécutez cette requête :

```sql
SELECT id, email FROM auth.users;
```

4. **Copiez votre ID** (format : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

#### Étape 2 : Préparer le script

1. Ouvrez le fichier `seed_data.sql`
2. **Utilisez Find & Replace** (Ctrl+F ou Cmd+F)
3. Recherchez : `YOUR_USER_ID`
4. Remplacez par : `votre-id-copié-à-l-étape-1`
5. Cliquez sur "Replace All"

#### Étape 3 : Exécuter le script

1. Dans **Supabase** > **SQL Editor**
2. Créez une **New query**
3. Copiez tout le contenu de `seed_data.sql` (modifié)
4. Cliquez sur **Run**
5. ✅ Attendez le message de succès

### Méthode 2 : Insertion manuelle par parties

Si le script complet ne fonctionne pas, exécutez partie par partie :

#### 1. Instruments (déjà fait normalement)
```sql
-- Partie INSTRUMENTS du script
INSERT INTO instruments ...
```

#### 2. Stratégies
```sql
-- Remplacez YOUR_USER_ID par votre ID
INSERT INTO trading_strategies (user_id, name, ...) VALUES
('votre-id-ici', 'Breakout', ...);
```

#### 3. Trades
```sql
-- Remplacez YOUR_USER_ID
INSERT INTO trades (user_id, symbol, ...) VALUES
('votre-id-ici', 'EURUSD', ...);
```

#### 4. Plan de trading
```sql
INSERT INTO trading_plans (user_id, title, ...) VALUES
('votre-id-ici', 'Plan Principal 2025', ...);
```

#### 5. Journal
```sql
INSERT INTO journal_entries (user_id, entry_date, ...) VALUES
('votre-id-ici', CURRENT_DATE - INTERVAL '7 days', ...);
```

#### 6. Objectifs
```sql
INSERT INTO goals (user_id, title, ...) VALUES
('votre-id-ici', 'Profit mensuel', ...);
```

#### 7. Calendrier
```sql
INSERT INTO calendar_events (user_id, title, ...) VALUES
('votre-id-ici', 'FOMC Meeting', ...);
```

#### 8. Notifications
```sql
INSERT INTO notifications (user_id, title, ...) VALUES
('votre-id-ici', 'Objectif atteint !', ...);
```

## 📊 Données incluses

### Trades (20 au total)

**Gagnants** (15) :
- EURUSD : 4 trades (+350, +557, +688, +297 $)
- GBPUSD : 3 trades (+208, +343, +293 $)
- BTCUSD : 3 trades (+150, +180, +200 $)
- XAUUSD : 3 trades (+750, +1200, +410 $)
- USDJPY : 1 trade (+276 $)
- SPX500 : 1 trade (+100 $)

**Perdants** (5) :
- EURUSD : -182 $
- GBPUSD : -167 $
- USDJPY : -125 $
- BTCUSD : -50 $
- XAUUSD : -508 $

**Total net** : ~+3,700 $ 📈

### Statistiques résultantes

Avec ces données, vous aurez :
- **Win Rate** : 75% (15/20)
- **Profit Factor** : ~3.6
- **Meilleur trade** : +1,200 $
- **Pire trade** : -508 $
- **Période** : 30 derniers jours

### Stratégies (4)

1. **Breakout** 💚 (Vert)
2. **Scalping** 💙 (Bleu)
3. **Swing Trading** 💜 (Violet)
4. **Mean Reversion** 🧡 (Orange)

### Journal (5 entrées)

Différents états d'esprit :
- Excellent (discipline 10/10)
- Bon (discipline 8-9/10)
- Neutre (discipline 7/10)
- Mauvais (discipline 4/10)

### Objectifs (3)

- 💰 Profit mensuel : 2000$ (72% atteint)
- 🎯 Win rate : 60% (objectif dépassé à 65%)
- 📊 Discipline : 8/10 (à 7.5)

## ✅ Vérification

Après l'insertion, vérifiez que tout fonctionne :

### 1. Dashboard
```
/dashboard
```
Vous devriez voir :
- 20 trades totaux
- 75% de win rate
- ~+3,700 $ de profit net
- Profit Factor ~3.6

### 2. Page Trades
```
/dashboard/trades
```
- Liste de 20 trades
- 2 trades ouverts (status: open)
- Filtres fonctionnels

### 3. Page Analytics
```
/dashboard/analytics
```
- Courbe de capital ascendante
- Distribution gains/pertes
- Statistiques détaillées

### 4. Requête de vérification

Dans Supabase SQL Editor :

```sql
-- Vérifier les trades insérés
SELECT 
    COUNT(*) as total_trades,
    COUNT(*) FILTER (WHERE status = 'closed') as closed_trades,
    COUNT(*) FILTER (WHERE status = 'open') as open_trades,
    SUM(net_profit) FILTER (WHERE status = 'closed') as total_profit
FROM trades
WHERE user_id = 'YOUR_USER_ID';
```

Résultat attendu :
- total_trades: 22
- closed_trades: 20
- open_trades: 2
- total_profit: ~3,700

## 🔧 Dépannage

### Erreur : "insert or update on table violates foreign key constraint"

**Cause** : L'ID utilisateur n'existe pas

**Solution** :
1. Vérifiez que vous êtes connecté
2. Vérifiez votre ID avec : `SELECT id FROM auth.users;`
3. Assurez-vous d'avoir remplacé ALL les 'YOUR_USER_ID'

### Erreur : "duplicate key value violates unique constraint"

**Cause** : Vous avez déjà exécuté le script

**Solution** : C'est normal, ignorez ou supprimez les données existantes :

```sql
-- Supprimer vos données de test
DELETE FROM notifications WHERE user_id = 'YOUR_USER_ID';
DELETE FROM calendar_events WHERE user_id = 'YOUR_USER_ID';
DELETE FROM goals WHERE user_id = 'YOUR_USER_ID';
DELETE FROM journal_entries WHERE user_id = 'YOUR_USER_ID';
DELETE FROM trading_plans WHERE user_id = 'YOUR_USER_ID';
DELETE FROM trades WHERE user_id = 'YOUR_USER_ID';
DELETE FROM trading_strategies WHERE user_id = 'YOUR_USER_ID';
```

Puis réexécutez le script d'insertion.

## 💡 Personnalisation

### Ajouter plus de trades

Copiez et modifiez une ligne existante :

```sql
INSERT INTO trades (user_id, symbol, trade_type, lot_size, entry_price, exit_price, entry_time, exit_time, commission, net_profit, status, strategy_name) VALUES
('YOUR_USER_ID', 'EURUSD', 'long', 1.0, 1.0900, 1.0950, NOW() - INTERVAL '1 day', NOW(), 10, 490, 'closed', 'Breakout');
```

### Modifier les dates

Changez `NOW() - INTERVAL 'X days'` :
- `NOW()` = maintenant
- `NOW() - INTERVAL '1 day'` = hier
- `NOW() - INTERVAL '7 days'` = il y a 7 jours
- `NOW() + INTERVAL '3 days'` = dans 3 jours

## 🎉 Résultat

Après l'insertion, votre application sera **remplie de données réalistes** et vous pourrez :

- 📊 Voir de vrais graphiques avec courbe de capital
- 📈 Analyser des statistiques réelles
- 🎯 Visualiser la progression vers vos objectifs
- 📓 Consulter l'historique du journal
- 📅 Voir les événements à venir

**Votre journal de trading prendra vie ! 🚀**

---

**Note** : Ces données sont fictives et à but de démonstration uniquement.

