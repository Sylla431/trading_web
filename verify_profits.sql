-- =========================================
-- VÉRIFICATION ET CORRECTION DES PROFITS
-- =========================================

-- 1. Vérifier les trades sans profit calculé
SELECT 
    id,
    symbol,
    trade_type,
    entry_price,
    exit_price,
    lot_size,
    position_size,
    net_profit,
    status
FROM trades
WHERE status = 'closed' 
  AND exit_price IS NOT NULL 
  AND (net_profit IS NULL OR net_profit = 0)
ORDER BY entry_time DESC;

-- 2. Recalculer manuellement les profits si nécessaire
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
            ((exit_price - entry_price) * COALESCE(position_size, lot_size * 100000)) - COALESCE(commission, 0) - COALESCE(swap, 0)
        ELSE 
            ((entry_price - exit_price) * COALESCE(position_size, lot_size * 100000)) - COALESCE(commission, 0) - COALESCE(swap, 0)
    END,
    duration_minutes = EXTRACT(EPOCH FROM (exit_time - entry_time)) / 60
WHERE status = 'closed' 
  AND exit_price IS NOT NULL;

-- 3. Vérifier les résultats
SELECT 
    COUNT(*) as total_trades,
    COUNT(*) FILTER (WHERE net_profit > 0) as winning_trades,
    COUNT(*) FILTER (WHERE net_profit < 0) as losing_trades,
    ROUND(SUM(net_profit)::numeric, 2) as total_profit,
    ROUND(AVG(net_profit)::numeric, 2) as avg_profit,
    ROUND((COUNT(*) FILTER (WHERE net_profit > 0)::numeric / NULLIF(COUNT(*), 0) * 100), 2) as win_rate
FROM trades
WHERE status = 'closed' AND user_id = 'YOUR_USER_ID';

-- 4. Voir le détail par trade
SELECT 
    symbol,
    trade_type,
    entry_price,
    exit_price,
    lot_size,
    ROUND(net_profit::numeric, 2) as profit,
    status,
    TO_CHAR(entry_time, 'DD Mon YYYY') as date
FROM trades
WHERE user_id = 'YOUR_USER_ID'
ORDER BY entry_time DESC
LIMIT 10;

