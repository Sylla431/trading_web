'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VoiceRecorder } from './VoiceRecorder'
import { AudioUploader } from './AudioUploader'
import { PhotoUploader } from './PhotoUploader'
import { Play, Trash2, Download, Image as ImageIcon, FileAudio } from 'lucide-react'
import { toast } from 'sonner'
import { deleteFile, extractFilePathFromUrl } from '@/lib/services/storage'

interface AttachmentFile {
  url: string
  name: string
  type: 'voice' | 'photo'
  size?: number
}

interface AttachmentsManagerProps {
  // Fichiers existants (en mode édition)
  existingVoiceNotes?: string[] | null
  existingAnalysisPhotos?: string[] | null
  
  // Callbacks pour les nouveaux fichiers
  onVoiceNotesChange: (files: File[]) => void
  onAnalysisPhotosChange: (files: File[]) => void
  
  // Callbacks pour la suppression
  onVoiceNotesDelete: (urls: string[]) => void
  onAnalysisPhotosDelete: (urls: string[]) => void
  
  disabled?: boolean
  userId: string
  tradeId: string
}

export function AttachmentsManager({
  existingVoiceNotes,
  existingAnalysisPhotos,
  onVoiceNotesChange,
  onAnalysisPhotosChange,
  onVoiceNotesDelete,
  onAnalysisPhotosDelete,
  disabled = false,
  userId,
  tradeId
}: AttachmentsManagerProps) {
  const [newVoiceFiles, setNewVoiceFiles] = useState<File[]>([])
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])
  const [filesToDelete, setFilesToDelete] = useState<{
    voice: string[]
    photos: string[]
  }>({
    voice: [],
    photos: []
  })

  // Normaliser les tableaux pour éviter les erreurs null
  const safeExistingVoiceNotes = existingVoiceNotes || []
  const safeExistingAnalysisPhotos = existingAnalysisPhotos || []

  // Gérer l'ajout de nouveaux fichiers audio
  const handleVoiceFilesAdd = useCallback((files: File[]) => {
    setNewVoiceFiles(prev => [...prev, ...files])
    onVoiceNotesChange([...newVoiceFiles, ...files])
  }, [newVoiceFiles, onVoiceNotesChange])

  // Gérer l'ajout de nouveaux fichiers photo
  const handlePhotoFilesAdd = useCallback((files: File[]) => {
    setNewPhotoFiles(prev => [...prev, ...files])
    onAnalysisPhotosChange([...newPhotoFiles, ...files])
  }, [newPhotoFiles, onAnalysisPhotosChange])

  // Gérer la suppression de fichiers existants
  const handleDeleteExistingFile = useCallback(async (url: string, type: 'voice' | 'photo') => {
    const filePath = extractFilePathFromUrl(url)
    if (!filePath) {
      toast.error('Impossible de supprimer le fichier')
      return
    }

    try {
      const result = await deleteFile(filePath)
      if (result.success) {
        setFilesToDelete(prev => ({
          ...prev,
          [type]: [...prev[type], url]
        }))
        
        if (type === 'voice') {
          onVoiceNotesDelete([...filesToDelete.voice, url])
        } else {
          onAnalysisPhotosDelete([...filesToDelete.photos, url])
        }
        
        toast.success('Fichier supprimé')
      } else {
        toast.error(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur suppression fichier:', error)
      toast.error('Erreur lors de la suppression')
    }
  }, [filesToDelete, onVoiceNotesDelete, onAnalysisPhotosDelete])

  // Gérer la suppression de nouveaux fichiers
  const handleDeleteNewFile = useCallback((file: File, type: 'voice' | 'photo') => {
    if (type === 'voice') {
      const updated = newVoiceFiles.filter(f => f !== file)
      setNewVoiceFiles(updated)
      onVoiceNotesChange(updated)
    } else {
      const updated = newPhotoFiles.filter(f => f !== file)
      setNewPhotoFiles(updated)
      onAnalysisPhotosChange(updated)
    }
    toast.success('Fichier supprimé')
  }, [newVoiceFiles, newPhotoFiles, onVoiceNotesChange, onAnalysisPhotosChange])

  // Télécharger un fichier
  const handleDownload = useCallback((url: string, name: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [])

  // Formater la taille du fichier
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  // Obtenir le nom du fichier depuis l'URL
  const getFileNameFromUrl = useCallback((url: string): string => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const filename = pathname.split('/').pop() || 'fichier'
      return decodeURIComponent(filename)
    } catch {
      return 'fichier'
    }
  }, [])

  // Fichiers existants non supprimés
  const activeVoiceNotes = safeExistingVoiceNotes.filter(url => !filesToDelete.voice.includes(url))
  const activeAnalysisPhotos = safeExistingAnalysisPhotos.filter(url => !filesToDelete.photos.includes(url))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Médias d'analyse</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <FileAudio className="h-4 w-4" />
              Enregistrements vocaux
              {(activeVoiceNotes.length + newVoiceFiles.length) > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {activeVoiceNotes.length + newVoiceFiles.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photos d'analyse
              {(activeAnalysisPhotos.length + newPhotoFiles.length) > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {activeAnalysisPhotos.length + newPhotoFiles.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="space-y-4 mt-4">
            {/* Fichiers audio existants */}
            {activeVoiceNotes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Enregistrements existants</h4>
                <div className="space-y-2">
                  {activeVoiceNotes.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <FileAudio className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            {getFileNameFromUrl(url)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Enregistrement vocal
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <audio src={url} controls className="h-8" />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(url, getFileNameFromUrl(url))}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteExistingFile(url, 'voice')}
                          disabled={disabled}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nouveaux enregistrements */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Nouveaux enregistrements</h4>
              
              {/* Enregistrement direct */}
              <VoiceRecorder
                onRecordingComplete={(blob) => {
                  const file = new File([blob], `enregistrement_${Date.now()}.webm`, {
                    type: 'audio/webm'
                  })
                  handleVoiceFilesAdd([file])
                }}
                onClear={() => {
                  // Pas besoin de gérer le clear ici car le composant gère son propre état
                }}
                disabled={disabled}
              />

              {/* Upload de fichier audio */}
              <AudioUploader
                onFileSelect={(file) => handleVoiceFilesAdd([file])}
                onClear={() => {
                  // Pas besoin de gérer le clear ici car le composant gère son propre état
                }}
                disabled={disabled}
              />
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4 mt-4">
            {/* Photos existantes */}
            {activeAnalysisPhotos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Photos existantes</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {activeAnalysisPhotos.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border bg-muted/30">
                        <img
                          src={url}
                          alt={`Photo d'analyse ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Overlay avec actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(url, getFileNameFromUrl(url))}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteExistingFile(url, 'photo')}
                          disabled={disabled}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nouvelles photos */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Nouvelles photos</h4>
              <PhotoUploader
                onFilesSelect={handlePhotoFilesAdd}
                onClear={() => {
                  // Pas besoin de gérer le clear ici car le composant gère son propre état
                }}
                disabled={disabled}
                multiple={true}
                maxFiles={10}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
