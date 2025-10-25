'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Trash2, Download, Image as ImageIcon, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { compressImage } from '@/lib/services/storage'

interface PhotoUploaderProps {
  onFilesSelect: (files: File[]) => void
  onClear: () => void
  disabled?: boolean
  multiple?: boolean
  acceptedFormats?: string[]
  maxSize?: number // en MB
  maxFiles?: number
}

export function PhotoUploader({ 
  onFilesSelect, 
  onClear, 
  disabled = false,
  multiple = true,
  acceptedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  maxSize = 5,
  maxFiles = 10
}: PhotoUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Validation du fichier
  const validateFile = useCallback((file: File): string | null => {
    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      return `Image trop volumineuse. Maximum ${maxSize}MB`
    }

    // Vérifier le type MIME
    const validMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ]

    if (!validMimeTypes.includes(file.type)) {
      return 'Format d\'image non supporté. Formats acceptés: JPEG, PNG, WebP, GIF'
    }

    return null
  }, [maxSize])

  // Compresser et ajouter les fichiers
  const processFiles = useCallback(async (files: File[]) => {
    setIsCompressing(true)
    
    try {
      const processedFiles: File[] = []
      const newPreviewUrls: string[] = []

      for (const file of files) {
        const error = validateFile(file)
        if (error) {
          toast.error(`${file.name}: ${error}`)
          continue
        }

        // Compresser l'image si elle est trop grande
        let processedFile = file
        if (file.size > 1024 * 1024) { // Compresser si > 1MB
          try {
            processedFile = await compressImage(file, 1920, 0.8)
          } catch (compressionError) {
            console.warn('Erreur compression, utilisation du fichier original:', compressionError)
          }
        }

        processedFiles.push(processedFile)
        newPreviewUrls.push(URL.createObjectURL(processedFile))
      }

      if (processedFiles.length > 0) {
        setSelectedFiles(prev => {
          const updated = [...prev, ...processedFiles]
          return updated.slice(0, maxFiles) // Limiter le nombre de fichiers
        })
        
        setPreviewUrls(prev => {
          const updated = [...prev, ...newPreviewUrls]
          return updated.slice(0, maxFiles)
        })

        onFilesSelect(processedFiles)
        toast.success(`${processedFiles.length} image(s) ajoutée(s)`)
      }
    } catch (error) {
      console.error('Erreur traitement fichiers:', error)
      toast.error('Erreur lors du traitement des images')
    } finally {
      setIsCompressing(false)
    }
  }, [validateFile, maxFiles, onFilesSelect])

  // Gérer la sélection de fichiers
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Vérifier la limite de fichiers
    if (selectedFiles.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images autorisées`)
      return
    }

    processFiles(fileArray)
  }, [selectedFiles.length, maxFiles, processFiles])

  // Gérer le changement d'input file
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  // Gérer le drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }, [disabled, handleFileSelect])

  // Ouvrir le sélecteur de fichiers
  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  // Supprimer un fichier spécifique
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index)
      onFilesSelect(updated)
      return updated
    })
    
    setPreviewUrls(prev => {
      const url = prev[index]
      if (url) {
        URL.revokeObjectURL(url)
      }
      return prev.filter((_, i) => i !== index)
    })
    
    toast.success('Image supprimée')
  }, [onFilesSelect])

  // Supprimer tous les fichiers
  const clearAllFiles = useCallback(() => {
    // Nettoyer les URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    
    setSelectedFiles([])
    setPreviewUrls([])
    onClear()
    
    // Reset l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    toast.success('Toutes les images supprimées')
  }, [previewUrls, onClear])

  // Télécharger une image
  const downloadImage = useCallback((index: number) => {
    const file = selectedFiles[index]
    const url = previewUrls[index]
    
    if (file && url) {
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }, [selectedFiles, previewUrls])

  // Formater la taille du fichier
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            Photos d&apos;analyse {multiple ? '(multiple)' : '(simple)'}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Max {maxSize}MB par image</span>
            {multiple && <span>• Max {maxFiles} images</span>}
          </div>
        </div>

        {/* Zone de drop */}
        {selectedFiles.length === 0 && (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              Glissez-déposez {multiple ? 'des images' : 'une image'} ici
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-muted-foreground">
              Formats acceptés: {acceptedFormats.join(', ')}
            </p>
          </div>
        )}

        {/* Grille des images */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border bg-muted/30">
                    <img
                      src={previewUrls[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay avec actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadImage(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Info du fichier */}
                  <div className="mt-1 text-xs text-muted-foreground">
                    <p className="truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p>{formatFileSize(file.size)}</p>
                  </div>
                </div>
              ))}
              
              {/* Bouton pour ajouter plus d'images */}
              {multiple && selectedFiles.length < maxFiles && (
                <div
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={openFileDialog}
                >
                  <div className="text-center">
                    <Plus className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Ajouter</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions globales */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedFiles.length} image(s) sélectionnée(s)
              </p>
              <div className="flex items-center gap-2">
                {multiple && selectedFiles.length < maxFiles && (
                  <Button
                    type="button"
                    onClick={openFileDialog}
                    size="sm"
                    variant="outline"
                    disabled={disabled || isCompressing}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Ajouter
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={clearAllFiles}
                  size="sm"
                  variant="destructive"
                  disabled={disabled || isCompressing}
                  className="flex items-center gap-2"
                >
                  <X className="h-3 w-3" />
                  Tout supprimer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Indicateur de compression */}
        {isCompressing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Compression des images...
          </div>
        )}

        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          multiple={multiple}
          className="hidden"
          disabled={disabled}
        />

        {/* Message d'aide */}
        {selectedFiles.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Ajoutez {multiple ? 'des photos' : 'une photo'} d&apos;analyse pour enrichir vos notes de trade.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
