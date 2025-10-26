export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          default_currency: string
          timezone: string
          preferred_broker: string | null
          account_type: 'individual' | 'coach' | 'analyst' | 'admin'
          is_premium: boolean
          subscription_tier: 'free' | 'pro' | 'premium'
          subscription_expires_at: string | null
          trial_ends_at: string | null
          two_factor_enabled: boolean
          two_factor_secret: string | null
          created_at: string
          updated_at: string
          last_login_at: string | null
          theme: 'dark' | 'light' | 'auto'
          language: 'fr' | 'en' | 'es' | 'de'
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          default_currency?: string
          timezone?: string
          preferred_broker?: string | null
          account_type?: 'individual' | 'coach' | 'analyst' | 'admin'
          is_premium?: boolean
          subscription_tier?: 'free' | 'pro' | 'premium'
          subscription_expires_at?: string | null
          trial_ends_at?: string | null
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          theme?: 'dark' | 'light' | 'auto'
          language?: 'fr' | 'en' | 'es' | 'de'
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          default_currency?: string
          timezone?: string
          preferred_broker?: string | null
          account_type?: 'individual' | 'coach' | 'analyst' | 'admin'
          is_premium?: boolean
          subscription_tier?: 'free' | 'pro' | 'premium'
          subscription_expires_at?: string | null
          trial_ends_at?: string | null
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          theme?: 'dark' | 'light' | 'auto'
          language?: 'fr' | 'en' | 'es' | 'de'
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          instrument_id: string | null
          symbol: string
          broker: string | null
          account_number: string | null
          trade_type: 'long' | 'short'
          order_type: 'market' | 'limit' | 'stop' | 'stop_limit' | null
          lot_size: number
          position_size: number | null
          contract_count: number | null
          entry_price: number
          exit_price: number | null
          stop_loss: number | null
          take_profit: number | null
          entry_time: string
          exit_time: string | null
          gross_profit: number | null
          commission: number
          swap: number
          net_profit: number | null
          profit_percentage: number | null
          pips: number | null
          points: number | null
          duration_minutes: number | null
          mae: number | null
          mfe: number | null
          strategy_id: string | null
          strategy_name: string | null
          tags: string[] | null
          notes: string | null
          lesson_learned: string | null
          emotion_before: string | null
          emotion_after: string | null
          discipline_score: number | null
          checked_rules: string[] | null
          screenshots: string[] | null
          voice_notes: string[] | null
          analysis_photos: string[] | null
          status: 'open' | 'closed' | 'cancelled'
          imported_from: string | null
          external_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          instrument_id?: string | null
          symbol: string
          broker?: string | null
          account_number?: string | null
          trade_type: 'long' | 'short'
          order_type?: 'market' | 'limit' | 'stop' | 'stop_limit' | null
          lot_size: number
          position_size?: number | null
          contract_count?: number | null
          entry_price: number
          exit_price?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          entry_time: string
          exit_time?: string | null
          gross_profit?: number | null
          commission?: number
          swap?: number
          net_profit?: number | null
          profit_percentage?: number | null
          pips?: number | null
          points?: number | null
          duration_minutes?: number | null
          mae?: number | null
          mfe?: number | null
          strategy_id?: string | null
          strategy_name?: string | null
          tags?: string[] | null
          notes?: string | null
          lesson_learned?: string | null
          emotion_before?: string | null
          emotion_after?: string | null
          discipline_score?: number | null
          checked_rules?: string[] | null
          screenshots?: string[] | null
          voice_notes?: string[] | null
          analysis_photos?: string[] | null
          status?: 'open' | 'closed' | 'cancelled'
          imported_from?: string | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          instrument_id?: string | null
          symbol?: string
          broker?: string | null
          account_number?: string | null
          trade_type?: 'long' | 'short'
          order_type?: 'market' | 'limit' | 'stop' | 'stop_limit' | null
          lot_size?: number
          position_size?: number | null
          contract_count?: number | null
          entry_price?: number
          exit_price?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          entry_time?: string
          exit_time?: string | null
          gross_profit?: number | null
          commission?: number
          swap?: number
          net_profit?: number | null
          profit_percentage?: number | null
          pips?: number | null
          points?: number | null
          duration_minutes?: number | null
          mae?: number | null
          mfe?: number | null
          strategy_id?: string | null
          strategy_name?: string | null
          tags?: string[] | null
          notes?: string | null
          lesson_learned?: string | null
          emotion_before?: string | null
          emotion_after?: string | null
          discipline_score?: number | null
          checked_rules?: string[] | null
          screenshots?: string[] | null
          voice_notes?: string[] | null
          analysis_photos?: string[] | null
          status?: 'open' | 'closed' | 'cancelled'
          imported_from?: string | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trading_strategies: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          entry_rules: string | null
          exit_rules: string | null
          risk_management_rules: string | null
          timeframe: string | null
          instruments: string[] | null
          session_preference: string | null
          total_trades: number
          winning_trades: number
          losing_trades: number
          win_rate: number | null
          average_profit: number | null
          profit_factor: number | null
          color: string | null
          tags: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          entry_rules?: string | null
          exit_rules?: string | null
          risk_management_rules?: string | null
          timeframe?: string | null
          instruments?: string[] | null
          session_preference?: string | null
          total_trades?: number
          winning_trades?: number
          losing_trades?: number
          win_rate?: number | null
          average_profit?: number | null
          profit_factor?: number | null
          color?: string | null
          tags?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          entry_rules?: string | null
          exit_rules?: string | null
          risk_management_rules?: string | null
          timeframe?: string | null
          instruments?: string[] | null
          session_preference?: string | null
          total_trades?: number
          winning_trades?: number
          losing_trades?: number
          win_rate?: number | null
          average_profit?: number | null
          profit_factor?: number | null
          color?: string | null
          tags?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Ajoutez d'autres tables au besoin
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

