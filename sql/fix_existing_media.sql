-- Script pour corriger les médias existants après création du bucket
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier les trades avec des médias
SELECT 
  id, 
  symbol, 
  voice_notes, 
  analysis_photos, 
  screenshots,
  created_at
FROM trades 
WHERE voice_notes IS NOT NULL 
   OR analysis_photos IS NOT NULL 
   OR screenshots IS NOT NULL
ORDER BY created_at DESC;

-- 2. Si vous avez des médias existants avec des URLs incorrectes, 
-- vous pouvez les nettoyer avec cette requête (ATTENTION: à adapter selon vos besoins)
-- UPDATE trades 
-- SET voice_notes = NULL, analysis_photos = NULL 
-- WHERE voice_notes IS NOT NULL OR analysis_photos IS NOT NULL;

-- 3. Vérifier la structure du bucket
SELECT * FROM storage.buckets WHERE id = 'trade-attachments';

-- 4. Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

