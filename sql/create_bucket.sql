-- Création du bucket Supabase Storage pour les attachements de trades
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer le bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trade-attachments',
  'trade-attachments',
  false, -- Bucket privé pour la sécurité
  52428800, -- Limite de 50MB par fichier
  ARRAY[
    -- Formats audio
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/ogg',
    'audio/webm',
    'audio/mp3',
    -- Formats image
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
);

-- 2. Créer les policies de sécurité
-- Policy pour la lecture (SELECT)
CREATE POLICY "Users can view own trade attachments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'trade-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy pour l'upload (INSERT)
CREATE POLICY "Users can upload own trade attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'trade-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy pour la mise à jour (UPDATE)
CREATE POLICY "Users can update own trade attachments" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'trade-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy pour la suppression (DELETE)
CREATE POLICY "Users can delete own trade attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'trade-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Vérifier que le bucket a été créé
SELECT * FROM storage.buckets WHERE id = 'trade-attachments';

