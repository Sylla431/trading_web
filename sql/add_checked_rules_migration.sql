-- Migration pour ajouter la colonne checked_rules à la table trades
-- Cette colonne stocke les règles cochées par l'utilisateur pour le calcul du score de discipline

ALTER TABLE trades 
ADD COLUMN checked_rules TEXT[];

COMMENT ON COLUMN trades.checked_rules IS 'Array des IDs des règles cochées par l''utilisateur pour le calcul du score de discipline';
