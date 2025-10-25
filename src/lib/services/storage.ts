import { createClient } from '@/lib/supabase/client'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export interface StorageError {
  message: string
  code?: string
}

const BUCKET_NAME = 'trade-attachments'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024 // 10MB pour audio
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB pour images

/**
 * Génère un nom de fichier unique avec timestamp
 */
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  return `${timestamp}_${random}.${extension}`
}

/**
 * Valide la taille d'un fichier
 */
function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

/**
 * Valide le type MIME d'un fichier
 */
function validateMimeType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

/**
 * Upload un fichier audio (enregistrement vocal ou upload)
 */
export async function uploadVoiceNote(
  file: File,
  userId: string,
  tradeId: string
): Promise<UploadResult> {
  const supabase = createClient()

  // Validation
  if (!validateFileSize(file, MAX_AUDIO_SIZE)) {
    return {
      url: '',
      path: '',
      error: `Fichier trop volumineux. Maximum ${MAX_AUDIO_SIZE / 1024 / 1024}MB`
    }
  }

  const allowedAudioTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/ogg',
    'audio/webm'
  ]

  if (!validateMimeType(file, allowedAudioTypes)) {
    return {
      url: '',
      path: '',
      error: 'Format audio non supporté. Formats acceptés: MP3, WAV, M4A, OGG, WebM'
    }
  }

  const fileName = generateUniqueFileName(file.name)
  const filePath = `${userId}/${tradeId}/voice/${fileName}`

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Erreur upload audio:', error)
      return {
        url: '',
        path: '',
        error: `Erreur upload: ${error.message}`
      }
    }

    // Pour un bucket privé, on stocke le chemin et on générera l'URL signée à la demande
    return {
      url: filePath, // On stocke le chemin, pas l'URL publique
      path: filePath
    }
  } catch (err) {
    console.error('Erreur inattendue upload audio:', err)
    return {
      url: '',
      path: '',
      error: 'Erreur inattendue lors de l\'upload'
    }
  }
}

/**
 * Upload une photo d'analyse
 */
export async function uploadAnalysisPhoto(
  file: File,
  userId: string,
  tradeId: string
): Promise<UploadResult> {
  const supabase = createClient()

  // Validation
  if (!validateFileSize(file, MAX_IMAGE_SIZE)) {
    return {
      url: '',
      path: '',
      error: `Image trop volumineuse. Maximum ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
    }
  }

  const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]

  if (!validateMimeType(file, allowedImageTypes)) {
    return {
      url: '',
      path: '',
      error: 'Format d\'image non supporté. Formats acceptés: JPEG, PNG, WebP, GIF'
    }
  }

  const fileName = generateUniqueFileName(file.name)
  const filePath = `${userId}/${tradeId}/photos/${fileName}`

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Erreur upload photo:', error)
      return {
        url: '',
        path: '',
        error: `Erreur upload: ${error.message}`
      }
    }

    // Pour un bucket privé, on stocke le chemin et on générera l'URL signée à la demande
    return {
      url: filePath, // On stocke le chemin, pas l'URL publique
      path: filePath
    }
  } catch (err) {
    console.error('Erreur inattendue upload photo:', err)
    return {
      url: '',
      path: '',
      error: 'Erreur inattendue lors de l\'upload'
    }
  }
}

/**
 * Supprime un fichier du storage
 */
export async function deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Erreur suppression fichier:', error)
      return {
        success: false,
        error: `Erreur suppression: ${error.message}`
      }
    }

    return { success: true }
  } catch (err) {
    console.error('Erreur inattendue suppression:', err)
    return {
      success: false,
      error: 'Erreur inattendue lors de la suppression'
    }
  }
}

/**
 * Supprime plusieurs fichiers du storage
 */
export async function deleteFiles(filePaths: string[]): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths)

    if (error) {
      console.error('Erreur suppression fichiers:', error)
      return {
        success: false,
        error: `Erreur suppression: ${error.message}`
      }
    }

    return { success: true }
  } catch (err) {
    console.error('Erreur inattendue suppression multiple:', err)
    return {
      success: false,
      error: 'Erreur inattendue lors de la suppression'
    }
  }
}

/**
 * Obtient l'URL publique d'un fichier (pour bucket public)
 */
export function getPublicUrl(filePath: string): string {
  const supabase = createClient()
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

/**
 * Génère une URL signée pour un fichier privé
 */
export async function getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
  const supabase = createClient()
  
  console.log('🔐 getSignedUrl appelé:', { filePath, expiresIn, bucket: BUCKET_NAME })
  
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn)
    
    if (error) {
      console.error('❌ Erreur génération URL signée:', error)
      console.error('❌ Détails erreur:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error
      })
      return ''
    }
    
    console.log('✅ URL signée générée avec succès:', data.signedUrl)
    return data.signedUrl
  } catch (err) {
    console.error('Erreur inattendue génération URL signée:', err)
    return ''
  }
}

/**
 * Extrait le chemin du fichier depuis une URL publique
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/trade-attachments\/(.+)/)
    return pathMatch ? pathMatch[1] : null
  } catch {
    return null
  }
}

/**
 * Compresse une image côté client avant upload
 */
export function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculer les nouvelles dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Dessiner l'image redimensionnée
      ctx?.drawImage(img, 0, 0, width, height)

      // Convertir en blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Erreur lors de la compression'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'))
    img.src = URL.createObjectURL(file)
  })
}
