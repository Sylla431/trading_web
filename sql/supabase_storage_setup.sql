-- Configuration du bucket Supabase Storage pour les attachements de trades
-- Date: $(date)
-- Description: Création du bucket et des policies de sécurité pour les médias

-- Créer le bucket pour les attachements de trades
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
    -- Formats image
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
);

-- Policy pour permettre aux utilisateurs de voir leurs propres fichiers
CREATE POLICY "Users can view own trade attachments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'trade-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy pour permettre aux utilisateurs d'uploader leurs propres fichiers
CREATE POLICY "Users can upload own trade attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'trade-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy pour permettre aux utilisateurs de mettre à jour leurs propres fichiers
CREATE POLICY "Users can update own trade attachments" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'trade-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy pour permettre aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY "Users can delete own trade attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'trade-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Commentaire sur la structure des dossiers
-- Structure attendue: trade-attachments/{user_id}/{trade_id}/{type}/{filename}
-- Exemple: trade-attachments/123e4567-e89b-12d3-a456-426614174000/456e7890-e89b-12d3-a456-426614174001/voice/recording.webm

