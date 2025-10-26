export type TradeType = 'long' | 'short'
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit'
export type TradeStatus = 'open' | 'closed' | 'cancelled'

export type EmotionBeforeType = 
  | 'confident' 
  | 'calm' 
  | 'neutral' 
  | 'stressed' 
  | 'fearful'

export type EmotionAfterType = 
  | 'confident' 
  | 'calm' 
  | 'neutral' 
  | 'stressed' 
  | 'fearful'
  | 'euphoric'
  | 'frustrated'
  | 'relieved'

export type EmotionType = EmotionBeforeType | EmotionAfterType

export type SubscriptionTier = 'free' | 'pro' | 'premium'
export type AccountType = 'individual' | 'coach' | 'analyst' | 'admin'
export type Theme = 'dark' | 'light' | 'auto'

export interface Trade {
  duration_minutes?: number
  id: string
  user_id: string
  symbol: string
  broker?: string
  trade_type: TradeType
  order_type?: OrderType
  lot_size: number
  entry_price: number
  exit_price?: number
  stop_loss?: number
  take_profit?: number
  entry_time: string
  exit_time?: string
  net_profit?: number
  profit_percentage?: number
  pips?: number
  status: TradeStatus
  strategy_name?: string
  tags?: string[]
  notes?: string
  lesson_learned?: string
  emotion_before?: EmotionBeforeType
  emotion_after?: EmotionAfterType
  discipline_score?: number
  checked_rules?: string[]
  screenshots?: string[]
  voice_notes?: string[]
  analysis_photos?: string[]
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  default_currency: string
  timezone: string
  preferred_broker?: string
  account_type: AccountType
  is_premium: boolean
  subscription_tier: SubscriptionTier
  theme: Theme
  language: string
}

export interface Strategy {
  id: string
  user_id: string
  name: string
  description?: string
  entry_rules?: string
  exit_rules?: string
  risk_management_rules?: string
  total_trades: number
  winning_trades: number
  timeframe?: string
  losing_trades: number
  win_rate?: number
  average_profit?: number
  profit_factor?: number
  color?: string
  is_active: boolean
}

export interface TradeStatistics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalProfit: number
  totalLoss: number
  netProfit: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  maxDrawdown: number
  largestWin: number
  largestLoss: number
  averageTradeDuration: number
  bestDay: number
  worstDay: number
}

export interface PerformanceData {
  date: string
  profit: number
  cumulativeProfit: number
  trades: number
}

export interface TradingAccount {
  id: string
  user_id: string
  account_name: string
  broker?: string
  account_number?: string
  account_type?: 'demo' | 'real' | 'paper'
  currency: string
  initial_balance?: number
  current_balance?: number
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

