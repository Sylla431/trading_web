-- Mettre à jour la devise par défaut de payment_history en XOF
-- et mettre à jour toutes les entrées existantes

-- 1. Mettre à jour la valeur par défaut de la colonne currency
ALTER TABLE payment_history 
ALTER COLUMN currency SET DEFAULT 'XOF';

-- 2. Mettre à jour toutes les entrées existantes qui ont 'USD' en 'XOF'
UPDATE payment_history 
SET currency = 'XOF' 
WHERE currency = 'USD' OR currency IS NULL;

-- 3. Vérifier les entrées mises à jour
SELECT 
    id,
    user_id,
    amount,
    currency,
    status,
    description,
    created_at
FROM payment_history
ORDER BY created_at DESC
LIMIT 10;

-- 4. Vérifier la valeur par défaut
SELECT 
    column_name,
    column_default,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_history'
AND column_name = 'currency';
