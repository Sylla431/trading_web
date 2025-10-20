-- Script de diagnostic pour les contraintes d'émotions
-- Date: 2025-01-17

-- 1. Vérifier les contraintes actuelles
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'trades'::regclass 
  AND conname LIKE '%emotion%';

-- 2. Vérifier les valeurs d'émotion actuelles dans la table
SELECT 
  emotion_before, 
  COUNT(*) as count_before
FROM trades 
WHERE emotion_before IS NOT NULL
GROUP BY emotion_before
ORDER BY count_before DESC;

SELECT 
  emotion_after, 
  COUNT(*) as count_after
FROM trades 
WHERE emotion_after IS NOT NULL
GROUP BY emotion_after
ORDER BY count_after DESC;

-- 3. Vérifier s'il y a des valeurs qui ne respectent pas les nouvelles contraintes
SELECT 
  id, 
  emotion_before, 
  emotion_after,
  created_at
FROM trades 
WHERE 
  (emotion_before IS NOT NULL AND emotion_before NOT IN ('confident', 'calm', 'neutral', 'stressed', 'fearful'))
  OR 
  (emotion_after IS NOT NULL AND emotion_after NOT IN ('confident', 'calm', 'neutral', 'stressed', 'fearful', 'euphoric', 'frustrated', 'relieved'));

