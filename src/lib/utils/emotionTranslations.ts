import type { EmotionBeforeType, EmotionAfterType } from '@/types'

// Traductions pour les émotions avant le trade
export const EMOTION_BEFORE_LABELS: Record<EmotionBeforeType, string> = {
  confident: 'Confiant',
  calm: 'Calme',
  neutral: 'Neutre',
  stressed: 'Stressé',
  fearful: 'Peur',
}

// Traductions pour les émotions après le trade
export const EMOTION_AFTER_LABELS: Record<EmotionAfterType, string> = {
  confident: 'Confiant',
  calm: 'Calme',
  neutral: 'Neutre',
  stressed: 'Stressé',
  fearful: 'Peur',
  euphoric: 'Euphorique',
  frustrated: 'Frustré',
  relieved: 'Soulagé',
}

// Fonction pour traduire une émotion avant le trade
export function translateEmotionBefore(emotion: EmotionBeforeType | undefined): string {
  if (!emotion) return ''
  return EMOTION_BEFORE_LABELS[emotion] || emotion
}

// Fonction pour traduire une émotion après le trade
export function translateEmotionAfter(emotion: EmotionAfterType | undefined): string {
  if (!emotion) return ''
  return EMOTION_AFTER_LABELS[emotion] || emotion
}

// Fonction générique pour traduire n'importe quelle émotion
export function translateEmotion(emotion: string | undefined): string {
  if (!emotion) return ''
  
  // Essayer d'abord les émotions avant
  if (emotion in EMOTION_BEFORE_LABELS) {
    return EMOTION_BEFORE_LABELS[emotion as EmotionBeforeType]
  }
  
  // Puis les émotions après
  if (emotion in EMOTION_AFTER_LABELS) {
    return EMOTION_AFTER_LABELS[emotion as EmotionAfterType]
  }
  
  // Si aucune traduction trouvée, retourner l'émotion originale
  return emotion
}
