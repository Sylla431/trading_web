-- Migration pour mettre à jour les contraintes d'émotions dans la table trades
-- Date: 2025-01-17

-- ÉTAPE 1: D'abord, mettre à jour les données existantes pour convertir les anciennes valeurs
-- Convertir les anciennes valeurs vers les nouvelles pour emotion_before
UPDATE trades 
SET emotion_before = CASE 
  WHEN emotion_before = 'anxious' THEN 'stressed'
  WHEN emotion_before = 'greedy' THEN 'confident'
  WHEN emotion_before = 'euphoric' THEN 'confident'
  WHEN emotion_before = 'frustrated' THEN 'stressed'
  -- Gérer aussi les anciennes valeurs 'excellent', 'good', 'bad', 'terrible'
  WHEN emotion_before = 'excellent' THEN 'confident'
  WHEN emotion_before = 'good' THEN 'calm'
  WHEN emotion_before = 'bad' THEN 'stressed'
  WHEN emotion_before = 'terrible' THEN 'fearful'
  ELSE emotion_before
END
WHERE emotion_before IN ('anxious', 'greedy', 'euphoric', 'frustrated', 'excellent', 'good', 'bad', 'terrible');

-- Convertir les anciennes valeurs vers les nouvelles pour emotion_after
UPDATE trades 
SET emotion_after = CASE 
  WHEN emotion_after = 'anxious' THEN 'stressed'
  WHEN emotion_after = 'greedy' THEN 'confident'
  WHEN emotion_after = 'euphoric' THEN 'euphoric' -- Garde euphoric pour emotion_after
  WHEN emotion_after = 'frustrated' THEN 'frustrated' -- Garde frustrated pour emotion_after
  -- Gérer aussi les anciennes valeurs 'excellent', 'good', 'bad', 'terrible'
  WHEN emotion_after = 'excellent' THEN 'confident'
  WHEN emotion_after = 'good' THEN 'calm'
  WHEN emotion_after = 'bad' THEN 'stressed'
  WHEN emotion_after = 'terrible' THEN 'fearful'
  ELSE emotion_after
END
WHERE emotion_after IN ('anxious', 'greedy', 'euphoric', 'frustrated', 'excellent', 'good', 'bad', 'terrible');

-- ÉTAPE 2: Supprimer les anciennes contraintes CHECK
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_emotion_before_check;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_emotion_after_check;

-- ÉTAPE 3: Ajouter les nouvelles contraintes CHECK avec les nouvelles valeurs d'émotion
ALTER TABLE trades ADD CONSTRAINT trades_emotion_before_check 
  CHECK (emotion_before IS NULL OR emotion_before IN ('confident', 'calm', 'neutral', 'stressed', 'fearful'));

ALTER TABLE trades ADD CONSTRAINT trades_emotion_after_check 
  CHECK (emotion_after IS NULL OR emotion_after IN ('confident', 'calm', 'neutral', 'stressed', 'fearful', 'euphoric', 'frustrated', 'relieved'));

-- Vérifier que les contraintes sont bien appliquées
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'trades'::regclass 
  AND conname LIKE '%emotion%';
