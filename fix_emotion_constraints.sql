-- Script de correction pour les contraintes d'émotions
-- Date: 2025-01-17

-- ÉTAPE 1: Supprimer TOUTES les contraintes d'émotions existantes
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_emotion_before_check;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_emotion_after_check;

-- ÉTAPE 2: Mettre à jour TOUTES les données existantes
-- Convertir toutes les anciennes valeurs vers les nouvelles
UPDATE trades 
SET emotion_before = CASE 
  -- Anciennes valeurs du schéma original
  WHEN emotion_before = 'anxious' THEN 'stressed'
  WHEN emotion_before = 'greedy' THEN 'confident'
  WHEN emotion_before = 'euphoric' THEN 'confident'
  WHEN emotion_before = 'frustrated' THEN 'stressed'
  -- Anciennes valeurs du formulaire
  WHEN emotion_before = 'excellent' THEN 'confident'
  WHEN emotion_before = 'good' THEN 'calm'
  WHEN emotion_before = 'bad' THEN 'stressed'
  WHEN emotion_before = 'terrible' THEN 'fearful'
  -- Valeurs déjà correctes
  WHEN emotion_before IN ('confident', 'calm', 'neutral', 'stressed', 'fearful') THEN emotion_before
  -- Valeurs inconnues -> neutre
  ELSE 'neutral'
END
WHERE emotion_before IS NOT NULL;

UPDATE trades 
SET emotion_after = CASE 
  -- Anciennes valeurs du schéma original
  WHEN emotion_after = 'anxious' THEN 'stressed'
  WHEN emotion_after = 'greedy' THEN 'confident'
  WHEN emotion_after = 'euphoric' THEN 'euphoric' -- Garde euphoric pour emotion_after
  WHEN emotion_after = 'frustrated' THEN 'frustrated' -- Garde frustrated pour emotion_after
  -- Anciennes valeurs du formulaire
  WHEN emotion_after = 'excellent' THEN 'confident'
  WHEN emotion_after = 'good' THEN 'calm'
  WHEN emotion_after = 'bad' THEN 'stressed'
  WHEN emotion_after = 'terrible' THEN 'fearful'
  -- Valeurs déjà correctes
  WHEN emotion_after IN ('confident', 'calm', 'neutral', 'stressed', 'fearful', 'euphoric', 'frustrated', 'relieved') THEN emotion_after
  -- Valeurs inconnues -> neutre
  ELSE 'neutral'
END
WHERE emotion_after IS NOT NULL;

-- ÉTAPE 3: Ajouter les nouvelles contraintes
ALTER TABLE trades ADD CONSTRAINT trades_emotion_before_check 
  CHECK (emotion_before IS NULL OR emotion_before IN ('confident', 'calm', 'neutral', 'stressed', 'fearful'));

ALTER TABLE trades ADD CONSTRAINT trades_emotion_after_check 
  CHECK (emotion_after IS NULL OR emotion_after IN ('confident', 'calm', 'neutral', 'stressed', 'fearful', 'euphoric', 'frustrated', 'relieved'));

-- ÉTAPE 4: Vérification finale
SELECT 'Contraintes mises à jour avec succès!' as status;

-- Vérifier les contraintes
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'trades'::regclass 
  AND conname LIKE '%emotion%';

-- Vérifier qu'il n'y a plus de valeurs invalides
SELECT 
  COUNT(*) as invalid_emotion_before_count
FROM trades 
WHERE emotion_before IS NOT NULL 
  AND emotion_before NOT IN ('confident', 'calm', 'neutral', 'stressed', 'fearful');

SELECT 
  COUNT(*) as invalid_emotion_after_count
FROM trades 
WHERE emotion_after IS NOT NULL 
  AND emotion_after NOT IN ('confident', 'calm', 'neutral', 'stressed', 'fearful', 'euphoric', 'frustrated', 'relieved');

