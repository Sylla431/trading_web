'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Play, Pause, Trash2, Download, FileAudio } from 'lucide-react'
import { toast } from 'sonner'

interface AudioUploaderProps {
  onFileSelect: (file: File) => void
  onClear: () => void
  disabled?: boolean
  acceptedFormats?: string[]
  maxSize?: number // en MB
}

export function AudioUploader({ 
  onFileSelect, 
  onClear, 
  disabled = false,
  acceptedFormats = ['.mp3', '.wav', '.m4a', '.ogg', '.webm'],
  maxSize = 10
}: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Validation du fichier
  const validateFile = useCallback((file: File): string | null => {
    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      return `Fichier trop volumineux. Maximum ${maxSize}MB`
    }

    // Vérifier le type MIME
    const validMimeTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/ogg',
      'audio/webm'
    ]

    if (!validMimeTypes.includes(file.type)) {
      return 'Format audio non supporté. Formats acceptés: MP3, WAV, M4A, OGG, WebM'
    }

    return null
  }, [maxSize])

  // Gérer la sélection de fichier
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }

    setSelectedFile(file)
    
    // Créer l'URL pour preview
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
    
    onFileSelect(file)
    toast.success('Fichier audio sélectionné')
  }, [validateFile, onFileSelect])

  // Gérer le changement d'input file
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
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
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }, [disabled, handleFileSelect])

  // Ouvrir le sélecteur de fichiers
  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  // Jouer/pause l'audio
  const playAudio = useCallback(() => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }, [audioUrl, isPlaying])

  // Gérer la fin de lecture
  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
  }, [])

  // Supprimer le fichier
  const clearFile = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setSelectedFile(null)
    setAudioUrl(null)
    setIsPlaying(false)
    onClear()
    
    // Reset l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    toast.success('Fichier supprimé')
  }, [audioUrl, onClear])

  // Télécharger le fichier
  const downloadFile = useCallback(() => {
    if (selectedFile && audioUrl) {
      const a = document.createElement('a')
      a.href = audioUrl
      a.download = selectedFile.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }, [selectedFile, audioUrl])

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
          <h3 className="font-semibold">Upload de fichier audio</h3>
          <span className="text-xs text-muted-foreground">
            Max {maxSize}MB
          </span>
        </div>

        {/* Zone de drop */}
        {!selectedFile && (
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
              Glissez-déposez un fichier audio ici
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-muted-foreground">
              Formats acceptés: {acceptedFormats.join(', ')}
            </p>
          </div>
        )}

        {/* Preview du fichier sélectionné */}
        {selectedFile && (
          <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <FileAudio className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            
            <audio
              ref={audioRef}
              src={audioUrl || undefined}
              onEnded={handleAudioEnded}
              className="w-full"
              controls
            />
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={playAudio}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {isPlaying ? 'Pause' : 'Lecture'}
              </Button>
              
              <Button
                type="button"
                onClick={downloadFile}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-3 w-3" />
                Télécharger
              </Button>
              
              <Button
                type="button"
                onClick={clearFile}
                size="sm"
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-3 w-3" />
                Supprimer
              </Button>
            </div>
          </div>
        )}

        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Message d'aide */}
        {!selectedFile && (
          <p className="text-xs text-muted-foreground">
            Sélectionnez un fichier audio existant pour l&apos;ajouter à votre analyse.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
