import { z } from 'zod'
import type { EmotionBeforeType, EmotionAfterType } from '@/types'

const optionalPositiveNumber = z
  .preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined
    const n = typeof v === 'string' ? Number(v) : (v as number)
    return Number.isNaN(n) ? undefined : n
  }, z.number().positive())
  .optional()

const optionalPriceNumber = z
  .preprocess((v) => {
    if (v === '' || v === null || v === undefined) return 0
    const n = typeof v === 'string' ? Number(v) : (v as number)
    return Number.isNaN(n) ? 0 : n
  }, z.number().min(0))
  .default(0)

const optionalNumber = z
  .preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined
    const n = typeof v === 'string' ? Number(v) : (v as number)
    return Number.isNaN(n) ? undefined : n
  }, z.number())
  .optional()

export const tradeSchema = z
  .object({
    account_id: z.string().min(1, 'Le compte est requis'),
    symbol: z.string().min(1, 'Le symbole est requis'),
    broker: z.string().optional(),
    account_number: z.string().optional(),
    trade_type: z.enum(['long', 'short']),
    order_type: z.enum(['market', 'limit', 'stop', 'stop_limit']).optional(),
    lot_size: z.number().positive('La taille du lot doit être positive'),
    position_size: z.number().positive().optional(),
    entry_price: optionalPriceNumber,
    exit_price: optionalPriceNumber,
    stop_loss: optionalPositiveNumber,
    take_profit: optionalPositiveNumber,
    entry_time: z.string().min(1, 'La date d\'entrée est requise'),
    exit_time: z.string().optional(),
    commission: z.number().default(0),
    swap: z.number().default(0),
    gross_profit: optionalNumber,
    net_profit: optionalNumber,
    pips: optionalNumber,
    points: optionalNumber,
    strategy_name: z.string().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    lesson_learned: z.string().optional(),
    emotion_before: z
      .enum(['confident', 'calm', 'neutral', 'stressed', 'fearful'] as const satisfies readonly EmotionBeforeType[])
      .optional(),
    emotion_after: z
      .enum(['confident', 'calm', 'neutral', 'stressed', 'fearful', 'euphoric', 'frustrated', 'relieved'] as const satisfies readonly EmotionAfterType[])
      .optional(),
    discipline_score: optionalNumber.refine((v) => v === undefined || (v >= 1 && v <= 10), {
      message: 'Doit être entre 1 et 10',
    }),
    checked_rules: z.array(z.string()).optional(),
    screenshots: z.array(z.string()).optional(),
    voice_notes: z.array(z.string()).optional(),
    analysis_photos: z.array(z.string()).optional(),
    status: z.enum(['open', 'closed', 'cancelled']).default('open'),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'closed') {
      // Plus de validation sur exit_price car il est maintenant optionnel avec valeur par défaut 0
      if (!data.exit_time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['exit_time'],
          message: 'Requis si statut = Fermé',
        })
      }
    }
  })

export type TradeFormData = z.infer<typeof tradeSchema>

