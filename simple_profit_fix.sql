-- =========================================
-- FIX SIMPLE : Calcul de profit simplifié
-- =========================================

-- 1. Supprimer les triggers existants
DROP TRIGGER IF EXISTS calculate_trade_metrics_trigger ON trades;
DROP TRIGGER IF EXISTS update_strategy_stats_trigger ON trades;

-- 2. Fonction simplifiée qui calcule UNIQUEMENT la durée
CREATE OR REPLACE FUNCTION calculate_trade_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculer uniquement la durée du trade
    IF NEW.status = 'closed' AND NEW.exit_time IS NOT NULL THEN
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.exit_time - NEW.entry_time)) / 60;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recréer le trigger (uniquement pour la durée)
CREATE TRIGGER calculate_trade_metrics_trigger 
    BEFORE INSERT OR UPDATE ON trades
    FOR EACH ROW 
    EXECUTE FUNCTION calculate_trade_metrics();

-- 4. IMPORTANT : Les profits doivent être fournis directement
-- Ne pas essayer de les calculer automatiquement

-- 5. Corriger les données existantes manuellement
-- Pour les trades où le profit est aberrant, remettez-le à NULL
UPDATE trades
SET net_profit = NULL, gross_profit = NULL
WHERE ABS(net_profit) > 100000;  -- Supprimer les valeurs aberrantes

-- 6. Vérification
SELECT 
    id,
    symbol,
    trade_type,
    lot_size,
    entry_price,
    exit_price,
    net_profit,
    status
FROM trades
WHERE user_id = auth.uid()
ORDER BY entry_time DESC;

