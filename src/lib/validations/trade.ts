import { z } from 'zod'

const optionalPositiveNumber = z
  .preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined
    const n = typeof v === 'string' ? Number(v) : (v as number)
    return Number.isNaN(n) ? undefined : n
  }, z.number().positive())
  .optional()

const optionalNumber = z
  .preprocess((v) => {
    if (v === '' || v === null || v === undefined) return undefined
    const n = typeof v === 'string' ? Number(v) : (v as number)
    return Number.isNaN(n) ? undefined : n
  }, z.number())
  .optional()

export const tradeSchema = z
  .object({
    account_id: z.string().optional(),
    symbol: z.string().min(1, 'Le symbole est requis'),
    broker: z.string().optional(),
    account_number: z.string().optional(),
    trade_type: z.enum(['long', 'short']),
    order_type: z.enum(['market', 'limit', 'stop', 'stop_limit']).optional(),
    lot_size: z.number().positive('La taille du lot doit être positive'),
    position_size: z.number().positive().optional(),
    entry_price: z.number().positive('Le prix d\'entrée doit être positif'),
    exit_price: optionalPositiveNumber,
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
      .enum(['excellent', 'good', 'neutral', 'bad', 'terrible'])
      .optional(),
    emotion_after: z
      .enum(['excellent', 'good', 'neutral', 'bad', 'terrible'])
      .optional(),
    discipline_score: optionalNumber.refine((v) => v === undefined || (v >= 1 && v <= 10), {
      message: 'Doit être entre 1 et 10',
    }),
    screenshots: z.array(z.string()).optional(),
    status: z.enum(['open', 'closed', 'cancelled']).default('open'),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'closed') {
      if (data.exit_price === undefined || data.exit_price === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['exit_price'],
          message: 'Requis si statut = Fermé',
        })
      }
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

