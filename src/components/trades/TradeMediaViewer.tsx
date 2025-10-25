'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, Download, FileAudio, Image as ImageIcon, Volume2, VolumeX, X } from 'lucide-react'
import { toast } from 'sonner'
import { getSignedUrl } from '@/lib/services/storage'
import { AudioPlayer } from './AudioPlayer'
import { ImageViewer } from './ImageViewer'

interface TradeMediaViewerProps {
  voiceNotes?: string[] | null
  analysisPhotos?: string[] | null
  screenshots?: string[] | null
}

export function TradeMediaViewer({ voiceNotes, analysisPhotos, screenshots }: TradeMediaViewerProps) {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  // Debug: afficher les props reçues
  console.log('🔍 TradeMediaViewer - Props reçues:', {
    voiceNotes,
    analysisPhotos,
    screenshots
  })

  // Normaliser les tableaux pour éviter les erreurs null
  const safeVoiceNotes = voiceNotes || []
  const safeAnalysisPhotos = analysisPhotos || []
  const safeScreenshots = screenshots || []

  // Fonction pour obtenir l'URL signée d'un fichier
  const getFileUrl = async (filePath: string): Promise<string> => {
    console.log('🔍 getFileUrl appelé avec:', filePath)
    
    // Si on a déjà l'URL signée en cache, on la retourne
    if (signedUrls[filePath]) {
      console.log('✅ URL signée trouvée en cache:', signedUrls[filePath])
      return signedUrls[filePath]
    }

    // Sinon, on génère une nouvelle URL signée
    console.log('🔄 Génération nouvelle URL signée pour:', filePath)
    const signedUrl = await getSignedUrl(filePath)
    console.log('📤 URL signée générée:', signedUrl)
    
    if (signedUrl) {
      setSignedUrls(prev => ({ ...prev, [filePath]: signedUrl }))
      return signedUrl
    }

    console.log('⚠️ Aucune URL signée générée, fallback vers:', filePath)
    return filePath // Fallback vers le chemin original
  }

  // Fonction pour jouer/pause l'audio
  const toggleAudio = (url: string) => {
    if (playingAudio === url) {
      setPlayingAudio(null)
    } else {
      setPlayingAudio(url)
    }
  }

  // Fonction pour télécharger un fichier
  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Obtenir le nom du fichier depuis l'URL
  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const filename = pathname.split('/').pop() || 'fichier'
      return decodeURIComponent(filename)
    } catch {
      return 'fichier'
    }
  }

  // Compter le total des médias
  const totalMedia = safeVoiceNotes.length + safeAnalysisPhotos.length + safeScreenshots.length

  if (totalMedia === 0) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Médias d&apos;analyse
          <span className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
            {totalMedia}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <FileAudio className="h-4 w-4" />
              Enregistrements
              {safeVoiceNotes.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {safeVoiceNotes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Photos d&apos;analyse
              {safeAnalysisPhotos.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {safeAnalysisPhotos.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="screenshots" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Captures d&apos;écran
              {safeScreenshots.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {safeScreenshots.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Enregistrements vocaux */}
          <TabsContent value="voice" className="space-y-3 mt-4">
            {safeVoiceNotes.length > 0 ? (
              <div className="space-y-3">
                {safeVoiceNotes.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <FileAudio className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          Enregistrement {index + 1}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getFileNameFromUrl(url)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AudioPlayer 
                        filePath={url}
                        onPlay={() => setPlayingAudio(url)}
                        onPause={() => setPlayingAudio(null)}
                        onEnded={() => setPlayingAudio(null)}
                        getFileUrl={getFileUrl}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const fileUrl = await getFileUrl(url)
                          downloadFile(fileUrl, getFileNameFromUrl(url))
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileAudio className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucun enregistrement vocal</p>
              </div>
            )}
          </TabsContent>

          {/* Photos d'analyse */}
          <TabsContent value="photos" className="space-y-3 mt-4">
            {safeAnalysisPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {safeAnalysisPhotos.map((url, index) => (
                  <ImageViewer
                    key={index}
                    filePath={url}
                    index={index}
                    onImageClick={setSelectedImage}
                    getFileUrl={getFileUrl}
                    downloadFile={downloadFile}
                    getFileNameFromUrl={getFileNameFromUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune photo d&apos;analyse</p>
              </div>
            )}
          </TabsContent>

          {/* Captures d'écran */}
          <TabsContent value="screenshots" className="space-y-3 mt-4">
            {safeScreenshots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {safeScreenshots.map((url, index) => (
                  <ImageViewer
                    key={index}
                    filePath={url}
                    index={index}
                    onImageClick={setSelectedImage}
                    getFileUrl={getFileUrl}
                    downloadFile={downloadFile}
                    getFileNameFromUrl={getFileNameFromUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucune capture d&apos;écran</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modal pour afficher l'image en grand */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={selectedImage}
                alt="Image en grand"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
