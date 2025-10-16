-- ===============================================
-- Script pour assigner les trades sans compte
-- ===============================================

-- 1. Vérifier d'abord les trades sans compte
SELECT 
    COUNT(*) as trades_sans_compte,
    MIN(created_at) as plus_ancien,
    MAX(created_at) as plus_recent
FROM trades 
WHERE account_id IS NULL;

-- 2. Vérifier les comptes disponibles
SELECT 
    id,
    account_name,
    broker,
    created_at
FROM trading_accounts
ORDER BY created_at;

-- ===============================================
-- OPTION 1: Assigner au premier compte disponible
-- ===============================================

-- Créer un compte par défaut s'il n'en existe pas
INSERT INTO trading_accounts (account_name, broker, balance, currency, created_at)
SELECT 
    'Compte par défaut',
    'Broker inconnu',
    10000.00,
    'USD',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM trading_accounts);

-- Assigner tous les trades sans compte au premier compte
UPDATE trades 
SET account_id = (
    SELECT id 
    FROM trading_accounts 
    ORDER BY created_at 
    LIMIT 1
)
WHERE account_id IS NULL;

-- ===============================================
-- OPTION 2: Assigner au compte le plus récent
-- ===============================================

-- (Décommentez cette section si vous préférez cette option)
/*
UPDATE trades 
SET account_id = (
    SELECT id 
    FROM trading_accounts 
    ORDER BY created_at DESC 
    LIMIT 1
)
WHERE account_id IS NULL;
*/

-- ===============================================
-- OPTION 3: Assigner selon le broker (si disponible)
-- ===============================================

-- (Décommentez cette section si vous voulez assigner selon le broker)
/*
-- D'abord, créer des comptes par défaut pour chaque broker unique
INSERT INTO trading_accounts (account_name, broker, balance, currency, created_at)
SELECT DISTINCT
    COALESCE(broker, 'Broker inconnu') || ' - Compte par défaut' as account_name,
    COALESCE(broker, 'Broker inconnu') as broker,
    10000.00 as balance,
    'USD' as currency,
    NOW() as created_at
FROM trades 
WHERE account_id IS NULL 
AND NOT EXISTS (
    SELECT 1 FROM trading_accounts ta 
    WHERE ta.broker = COALESCE(trades.broker, 'Broker inconnu')
);

-- Puis assigner les trades selon leur broker
UPDATE trades 
SET account_id = (
    SELECT ta.id 
    FROM trading_accounts ta 
    WHERE ta.broker = COALESCE(trades.broker, 'Broker inconnu')
    LIMIT 1
)
WHERE account_id IS NULL;
*/

-- ===============================================
-- VÉRIFICATION FINALE
-- ===============================================

-- Vérifier qu'il n'y a plus de trades sans compte
SELECT 
    COUNT(*) as trades_sans_compte_restants
FROM trades 
WHERE account_id IS NULL;

-- Voir la répartition des trades par compte
SELECT 
    ta.account_name,
    ta.broker,
    COUNT(t.id) as nombre_trades,
    SUM(t.net_profit) as profit_total
FROM trading_accounts ta
LEFT JOIN trades t ON ta.id = t.account_id
GROUP BY ta.id, ta.account_name, ta.broker
ORDER BY nombre_trades DESC;

-- ===============================================
-- SCRIPT DE NETTOYAGE (si nécessaire)
-- ===============================================

-- Si vous voulez annuler les changements :
/*
UPDATE trades 
SET account_id = NULL 
WHERE account_id = (
    SELECT id 
    FROM trading_accounts 
    WHERE account_name = 'Compte par défaut'
    LIMIT 1
);
*/
