-- Migration pour ajouter les colonnes voice_notes et analysis_photos à la table trades
-- Date: $(date)
-- Description: Ajout du support pour les enregistrements vocaux et photos d'analyse

-- Ajouter les nouvelles colonnes à la table trades
ALTER TABLE trades 
ADD COLUMN voice_notes TEXT[],
ADD COLUMN analysis_photos TEXT[];

-- Ajouter des commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN trades.voice_notes IS 'Array des URLs des enregistrements vocaux stockés dans Supabase Storage';
COMMENT ON COLUMN trades.analysis_photos IS 'Array des URLs des photos d''analyse stockées dans Supabase Storage';

-- Créer un index pour optimiser les requêtes sur les nouveaux champs (optionnel)
-- CREATE INDEX idx_trades_voice_notes ON trades USING GIN (voice_notes);
-- CREATE INDEX idx_trades_analysis_photos ON trades USING GIN (analysis_photos);

