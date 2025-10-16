-- =========================================
-- FIX : CORRECTION DU CALCUL DES PROFITS
-- =========================================

-- Supprimer l'ancien trigger défectueux
DROP TRIGGER IF EXISTS calculate_trade_metrics_trigger ON trades;
DROP TRIGGER IF EXISTS update_strategy_stats_trigger ON trades;

-- Fonction corrigée pour calculer les profits correctement
CREATE OR REPLACE FUNCTION calculate_trade_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'closed' AND NEW.exit_price IS NOT NULL AND NEW.exit_time IS NOT NULL THEN
        -- Calculer la durée
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.exit_time - NEW.entry_time)) / 60;
        
        -- Définir position_size si non fourni (standard Forex = lot_size * 100000)
        IF NEW.position_size IS NULL THEN
            NEW.position_size = NEW.lot_size * 100000;
        END IF;
        
        -- Calculer les pips (pour Forex principalement)
        IF NEW.pips IS NULL THEN
            IF NEW.symbol LIKE '%JPY%' THEN
                -- Paires JPY : 1 pip = 0.01
                IF NEW.trade_type = 'long' THEN
                    NEW.pips = (NEW.exit_price - NEW.entry_price) / 0.01;
                ELSE
                    NEW.pips = (NEW.entry_price - NEW.exit_price) / 0.01;
                END IF;
            ELSE
                -- Autres paires : 1 pip = 0.0001
                IF NEW.trade_type = 'long' THEN
                    NEW.pips = (NEW.exit_price - NEW.entry_price) / 0.0001;
                ELSE
                    NEW.pips = (NEW.entry_price - NEW.exit_price) / 0.0001;
                END IF;
            END IF;
        END IF;
        
        -- Calculer le profit CORRECTEMENT
        -- Pour Forex : (pips * pip_value * lot_size)
        -- Formule simplifiée : différence de prix * lot_size * 100000 (pour une paire standard)
        
        IF NEW.trade_type = 'long' THEN
            -- Long : profit si prix monte
            NEW.gross_profit = (NEW.exit_price - NEW.entry_price) * NEW.lot_size * 100000;
        ELSE
            -- Short : profit si prix descend
            NEW.gross_profit = (NEW.entry_price - NEW.exit_price) * NEW.lot_size * 100000;
        END IF;
        
        -- Calculer le profit net (après commissions et swap)
        NEW.net_profit = NEW.gross_profit - COALESCE(NEW.commission, 0) - COALESCE(NEW.swap, 0);
        
        -- Calculer le pourcentage (basé sur une marge de 1000$ par lot)
        IF NEW.lot_size > 0 THEN
            NEW.profit_percentage = (NEW.net_profit / (NEW.lot_size * 1000)) * 100;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
CREATE TRIGGER calculate_trade_metrics_trigger 
    BEFORE INSERT OR UPDATE ON trades
    FOR EACH ROW 
    EXECUTE FUNCTION calculate_trade_metrics();

-- RECALCULER TOUS LES PROFITS EXISTANTS
UPDATE trades
SET 
    -- Force le trigger en modifiant updated_at
    updated_at = NOW()
WHERE status = 'closed' 
  AND exit_price IS NOT NULL;

-- Vérification des résultats
SELECT 
    symbol,
    trade_type,
    lot_size,
    entry_price,
    exit_price,
    ROUND(pips::numeric, 1) as pips,
    ROUND(net_profit::numeric, 2) as profit_usd,
    status
FROM trades
WHERE status = 'closed'
ORDER BY entry_time DESC
LIMIT 10;

-- Statistiques globales
SELECT 
    COUNT(*) as total_trades,
    COUNT(*) FILTER (WHERE net_profit > 0) as gagnants,
    COUNT(*) FILTER (WHERE net_profit < 0) as perdants,
    ROUND(SUM(net_profit)::numeric, 2) as profit_total,
    ROUND((COUNT(*) FILTER (WHERE net_profit > 0)::numeric / NULLIF(COUNT(*), 0) * 100), 1) as win_rate
FROM trades
WHERE status = 'closed';

