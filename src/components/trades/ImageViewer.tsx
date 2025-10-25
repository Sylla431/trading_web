'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageViewerProps {
  filePath: string
  index: number
  onImageClick: (url: string) => void
  getFileUrl: (filePath: string) => Promise<string>
  downloadFile: (url: string, filename: string) => void
  getFileNameFromUrl: (url: string) => string
}

export function ImageViewer({ 
  filePath, 
  index, 
  onImageClick, 
  getFileUrl, 
  downloadFile, 
  getFileNameFromUrl 
}: ImageViewerProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadImageUrl = async () => {
      try {
        setLoading(true)
        const url = await getFileUrl(filePath)
        setImageUrl(url)
      } catch (error) {
        console.error('Erreur chargement URL image:', error)
      } finally {
        setLoading(false)
      }
    }

    loadImageUrl()
  }, [filePath, getFileUrl])

  if (loading) {
    return (
      <div className="relative group aspect-square rounded-lg overflow-hidden border bg-muted/30 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Chargement...</span>
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className="relative group aspect-square rounded-lg overflow-hidden border bg-destructive/10 flex items-center justify-center">
        <span className="text-xs text-destructive">Erreur</span>
      </div>
    )
  }

  return (
    <div className="relative group">
      <div 
        className="aspect-square rounded-lg overflow-hidden border bg-muted/30 cursor-pointer"
        onClick={() => onImageClick(imageUrl)}
      >
        <img
          src={imageUrl}
          alt={`Image ${index + 1}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
          onError={(e) => {
            console.error('Erreur chargement image:', e)
            setImageUrl('')
          }}
        />
      </div>
      
      {/* Overlay avec bouton de téléchargement */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation()
            downloadFile(imageUrl, getFileNameFromUrl(filePath))
          }}
        >
          <Download className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Numéro de l'image */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
    </div>
  )
}

