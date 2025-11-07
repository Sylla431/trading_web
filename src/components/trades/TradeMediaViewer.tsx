'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, FileAudio, Image as ImageIcon, Volume2, X } from 'lucide-react'
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
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  )

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  // Choisir l'onglet initial selon les médias disponibles
  const initialTab = safeVoiceNotes.length
    ? 'voice'
    : safeAnalysisPhotos.length
    ? 'photos'
    : 'screenshots'

  const renderVoiceContent = () =>
    safeVoiceNotes.length > 0 ? (
      <div className="space-y-3">
        {safeVoiceNotes.map((url, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <FileAudio className="h-5 w-5 text-primary" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Enregistrement {index + 1}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {getFileNameFromUrl(url)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
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
      <div className="py-8 text-center text-muted-foreground">
        <FileAudio className="mx-auto mb-3 h-12 w-12 opacity-50" />
        <p className="text-sm">Aucun enregistrement vocal</p>
      </div>
    )

  const renderPhotosContent = (photos: string[], emptyLabel: string) =>
    photos.length > 0 ? (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((url, index) => (
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
      <div className="py-8 text-center text-muted-foreground">
        <ImageIcon className="mx-auto mb-3 h-12 w-12 opacity-50" />
        <p className="text-sm">{emptyLabel}</p>
      </div>
    )

  if (totalMedia === 0) {
    return null
  }

  if (isMobile) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
            <Volume2 className="h-5 w-5" />
            Médias d&apos;analyse
            <span className="ml-2 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
              {totalMedia}
            </span>
          </CardTitle>
        </CardHeader>
        {/* <CardContent className="space-y-6"> */}
        <CardContent className="space-y-6">
          <section className="space-y-3">
            <header className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <FileAudio className="h-4 w-4" />
                Enregistrements vocaux
              </h4>
              {safeVoiceNotes.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {safeVoiceNotes.length}
                </span>
              )}
            </header>
            {renderVoiceContent()}
          </section>

          <section className="space-y-3">
            <header className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon className="h-4 w-4" />
                Photos d&apos;analyse
              </h4>
              {safeAnalysisPhotos.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {safeAnalysisPhotos.length}
                </span>
              )}
            </header>
            {renderPhotosContent(safeAnalysisPhotos, 'Aucune photo d’analyse')}
          </section>

          <section className="space-y-3">
            <header className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon className="h-4 w-4" />
                Captures d&apos;écran
              </h4>
              {safeScreenshots.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {safeScreenshots.length}
                </span>
              )}
            </header>
            {renderPhotosContent(safeScreenshots, 'Aucune capture d’écran')}
          </section>
        </CardContent>

        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-h-[90vh] max-w-4xl">
              <img
                src={selectedImage}
                alt="Image en grand"
                className="max-h-full max-w-full rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-4 top-4"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    )
  }

  if (totalMedia === 0) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          <Volume2 className="h-5 w-5" />
          Médias d&apos;analyse
          <span className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
            {totalMedia}
          </span>
        </CardTitle>
      </CardHeader>
        <CardContent>
          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
              <TabsTrigger
                value="voice"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm transition-all sm:flex-1"
              >
                <FileAudio className="h-4 w-4" />
                Enregistrements
                {safeVoiceNotes.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                    {safeVoiceNotes.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm transition-all sm:flex-1"
              >
                <ImageIcon className="h-4 w-4" />
                Photos d&apos;analyse
                {safeAnalysisPhotos.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                    {safeAnalysisPhotos.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="screenshots"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm transition-all sm:flex-1"
              >
                <ImageIcon className="h-4 w-4" />
                Captures d&apos;écran
                {safeScreenshots.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                    {safeScreenshots.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="voice" className="mt-4 space-y-3">
              {renderVoiceContent()}
            </TabsContent>

            <TabsContent value="photos" className="mt-4 space-y-3">
              {renderPhotosContent(safeAnalysisPhotos, 'Aucune photo d’analyse')}
            </TabsContent>

            <TabsContent value="screenshots" className="mt-4 space-y-3">
              {renderPhotosContent(safeScreenshots, 'Aucune capture d’écran')}
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
