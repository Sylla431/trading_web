'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mic, Square, Play, Pause, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onClear: () => void
  disabled?: boolean
}

export function VoiceRecorder({ onRecordingComplete, onClear, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Formater le temps en MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Démarrer l'enregistrement
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onRecordingComplete(blob)
        
        // Nettoyer le stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Démarrer le timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      toast.success('Enregistrement démarré')
    } catch (error) {
      console.error('Erreur accès microphone:', error)
      toast.error('Impossible d\'accéder au microphone')
    }
  }, [onRecordingComplete])

  // Arrêter l'enregistrement
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      
      toast.success('Enregistrement terminé')
    }
  }, [isRecording])

  // Jouer l'audio
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

  // Supprimer l'enregistrement
  const clearRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setIsPlaying(false)
    onClear()
    toast.success('Enregistrement supprimé')
  }, [audioUrl, onClear])

  // Télécharger l'enregistrement
  const downloadRecording = useCallback(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `enregistrement_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [audioBlob])

  // Nettoyage à la destruction du composant
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  // Nettoyage automatique
  useState(() => {
    return () => cleanup()
  })

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Enregistrement vocal</h3>
          {recordingTime > 0 && (
            <span className="text-sm text-muted-foreground">
              {formatTime(recordingTime)}
            </span>
          )}
        </div>

        {/* Contrôles d'enregistrement */}
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button
              type="button"
              onClick={startRecording}
              disabled={disabled}
              className="flex items-center gap-2"
              variant="default"
            >
              <Mic className="h-4 w-4" />
              Démarrer l'enregistrement
            </Button>
          ) : (
            <Button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2"
              variant="destructive"
            >
              <Square className="h-4 w-4" />
              Arrêter l'enregistrement
            </Button>
          )}
        </div>

        {/* Preview de l'enregistrement */}
        {audioBlob && audioUrl && (
          <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enregistrement terminé</span>
              <span className="text-xs text-muted-foreground">
                {formatTime(recordingTime)} • {(audioBlob.size / 1024).toFixed(1)} KB
              </span>
            </div>
            
            <audio
              ref={audioRef}
              src={audioUrl}
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
                onClick={downloadRecording}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-3 w-3" />
                Télécharger
              </Button>
              
              <Button
                type="button"
                onClick={clearRecording}
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

        {/* Indicateur d'enregistrement */}
        {isRecording && (
          <div className="flex items-center gap-2 text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm">Enregistrement en cours...</span>
          </div>
        )}

        {/* Message d'aide */}
        {!audioBlob && !isRecording && (
          <p className="text-xs text-muted-foreground">
            Cliquez sur "Démarrer l'enregistrement" pour enregistrer une note vocale sur votre analyse.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
