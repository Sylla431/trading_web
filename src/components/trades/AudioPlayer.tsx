'use client'

import { useState, useEffect } from 'react'

interface AudioPlayerProps {
  filePath: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  getFileUrl: (filePath: string) => Promise<string>
}

export function AudioPlayer({ filePath, onPlay, onPause, onEnded, getFileUrl }: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAudioUrl = async () => {
      try {
        setLoading(true)
        const url = await getFileUrl(filePath)
        setAudioUrl(url)
      } catch (error) {
        console.error('Erreur chargement URL audio:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAudioUrl()
  }, [filePath, getFileUrl])

  if (loading) {
    return (
      <div className="h-8 w-32 bg-muted rounded flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Chargement...</span>
      </div>
    )
  }

  if (!audioUrl) {
    return (
      <div className="h-8 w-32 bg-destructive/10 rounded flex items-center justify-center">
        <span className="text-xs text-destructive">Erreur</span>
      </div>
    )
  }

  return (
    <audio
      src={audioUrl}
      controls
      className="h-8"
      onPlay={onPlay}
      onPause={onPause}
      onEnded={onEnded}
    >
      Votre navigateur ne supporte pas l&apos;élément audio.
    </audio>
  )
}

