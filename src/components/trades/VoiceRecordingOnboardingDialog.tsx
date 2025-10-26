'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, X } from 'lucide-react'

const STORAGE_KEY = 'voice-recording-preference-shown'

interface VoiceRecordingOnboardingDialogProps {
  onPreferenceSet?: (enabled: boolean) => void
}

export function VoiceRecordingOnboardingDialog({ onPreferenceSet }: VoiceRecordingOnboardingDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Vérifier si le popup a déjà été affiché
    const hasBeenShown = localStorage.getItem(STORAGE_KEY)
    if (!hasBeenShown) {
      // Délai de 500ms pour un affichage plus naturel
      setTimeout(() => setIsOpen(true), 500)
    }
  }, [])

  const handleChoice = (enabled: boolean) => {
    // Sauvegarder la préférence
    localStorage.setItem(STORAGE_KEY, 'true')
    localStorage.setItem('voice-recording-enabled', enabled ? 'true' : 'false')
    
    // Fermer le popup
    setIsOpen(false)
    
    // Callback optionnel
    onPreferenceSet?.(enabled)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Enregistrements vocaux</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleChoice(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="mt-2">
            Souhaitez-vous utiliser les enregistrements vocaux pour enrichir vos notes de trading ?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Les enregistrements vocaux vous permettent d&apos;ajouter rapidement des notes audio 
              à vos trades pour capturer vos analyses et réflexions en temps réel.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleChoice(false)}
            >
              Non merci
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleChoice(true)}
            >
              Oui, activer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
