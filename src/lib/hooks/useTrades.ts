'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Trade } from '@/types'
import type { TradeFormData } from '@/lib/validations/trade'

export function useTrades(accountId?: string) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', user?.id as never)

      if (accountId) {
        query = query.eq('account_id', accountId as never)
      }

      const { data, error: fetchError } = await query.order('entry_time', { ascending: false })

      if (fetchError) throw fetchError

      setTrades(data as Trade[])
    } catch (err) {
      setError(err as Error)
      console.error('Erreur lors du chargement des trades:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, user, accountId])

  useEffect(() => {
    if (user) {
      fetchTrades()
    }
  }, [user, fetchTrades])

  // Récupère la taille de contrat pour un symbole; fallback sensé pour forex si inconnu
  const getContractSizeForSymbol = async (symbol: string | undefined): Promise<number> => {
    if (!symbol) return 100000 // fallback forex standard
    
    // Heuristique: crypto/indices => 1, sinon forex => 100000
    const upper = symbol.toUpperCase()
    const isCryptoOrIndex = upper.includes('BTC') || upper.includes('ETH') || upper.includes('SPX') || upper.includes('NAS')
    
    // Pour l'instant, on utilise directement l'heuristique sans requête DB
    // car la table instruments peut ne pas exister ou avoir des problèmes de permissions
    return isCryptoOrIndex ? 1 : 100000
    
    /* 
    // Code original commenté en cas de problème avec la table instruments
    try {
      const { data } = await supabase
        .from('instruments')
        .select('contract_size')
        .eq('symbol', symbol as never)
        .single()
      const contractSize = (data as { contract_size?: number } | null)?.contract_size
      if (typeof contractSize === 'number' && !Number.isNaN(contractSize)) {
        return contractSize
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération de la taille de contrat:', error)
      // Ignore et utilise le fallback
    }
    */
  }

  const determineStatus = (data: { exit_price?: number; exit_time?: string; status?: Trade['status'] }): Trade['status'] => {
    // Si un prix de sortie est fourni ET supérieur à 0, on considère le trade comme fermé
    // (car exit_price a maintenant une valeur par défaut de 0)
    if (data.exit_price !== undefined && data.exit_price > 0) return 'closed'
    return data.status ?? 'open'
  }

  const toIsoIfProvided = (value?: string) => {
    if (!value) return undefined
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
  }

  // Plus de calcul automatique côté client pour gross/net profit

  const addTrade = async (tradeData: TradeFormData) => {
    try {
      // Validation des champs requis
      if (!tradeData.account_id || tradeData.account_id.trim() === '') {
        throw new Error('Le compte de trading est requis')
      }
      
      // Normaliser dates et calculer champs dérivés
      const contractSize = await getContractSizeForSymbol(tradeData.symbol)
      const positionSize = tradeData.position_size ?? (typeof tradeData.lot_size === 'number' ? Number(tradeData.lot_size) * contractSize : undefined)
      const status = determineStatus({ exit_price: tradeData.exit_price, exit_time: tradeData.exit_time, status: tradeData.status })
      const normalizedExitTime = status === 'closed' ? (toIsoIfProvided(tradeData.exit_time) ?? new Date().toISOString()) : undefined
      const gross_profit = tradeData.gross_profit
      const net_profit = tradeData.net_profit

      // Injecte broker depuis le compte si présent
      const selectedAccount = (tradeData as { account_id?: string }).account_id
        ? (
            await supabase
              .from('trading_accounts')
              .select('broker')
              .eq('id', (tradeData as { account_id?: string }).account_id as never)
              .single()
          ).data as { broker?: string } | null
        : null

      const payload = {
        user_id: user?.id,
        account_id: (tradeData as { account_id?: string }).account_id,
        symbol: tradeData.symbol,
        broker: selectedAccount?.broker || undefined,
        account_number: tradeData.account_number,
        trade_type: tradeData.trade_type,
        order_type: tradeData.order_type,
        lot_size: tradeData.lot_size,
        position_size: positionSize,
        entry_price: tradeData.entry_price,
        exit_price: tradeData.exit_price,
        stop_loss: tradeData.stop_loss,
        take_profit: tradeData.take_profit,
        entry_time: toIsoIfProvided(tradeData.entry_time),
        exit_time: normalizedExitTime,
        commission: tradeData.commission ?? 0,
        swap: tradeData.swap ?? 0,
        pips: tradeData.pips,
        points: tradeData.points,
        strategy_name: tradeData.strategy_name,
        tags: tradeData.tags,
        notes: tradeData.notes,
        lesson_learned: tradeData.lesson_learned,
        emotion_before: tradeData.emotion_before,
        emotion_after: tradeData.emotion_after,
        discipline_score: tradeData.discipline_score,
        checked_rules: tradeData.checked_rules,
        screenshots: tradeData.screenshots,
        voice_notes: tradeData.voice_notes,
        analysis_photos: tradeData.analysis_photos,
        status,
        gross_profit,
        net_profit,
      }

      const { data, error: insertError } = await supabase
        .from('trades')
        .insert([payload] as never)
        .select()
        .single()

      if (insertError) throw insertError

      setTrades([data as Trade, ...trades])
      return { data, error: null }
    } catch (err) {
      console.error('Erreur lors de l\'ajout du trade:', err)
      return { data: null, error: err as Error }
    }
  }

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    try {
      console.log('🔄 updateTrade appelé', { id, updates })
      console.log('📊 Données reçues pour mise à jour:', JSON.stringify(updates, null, 2))
      // Normaliser potentiellement les dates si fournies et ajuster status
      const normalized: Record<string, unknown> = { ...updates }
      if (typeof updates.entry_time === 'string') normalized.entry_time = toIsoIfProvided(updates.entry_time)
      if (typeof updates.exit_time === 'string') normalized.exit_time = toIsoIfProvided(updates.exit_time)

      const maybeExitPrice = (updates as { exit_price?: number }).exit_price
      const maybeExitTime = (normalized as { exit_time?: string }).exit_time as string | undefined
      const newStatus = determineStatus({ exit_price: maybeExitPrice, exit_time: maybeExitTime, status: updates.status })
      normalized.status = newStatus
      if (newStatus === 'closed' && !maybeExitTime) {
        normalized.exit_time = new Date().toISOString()
      }

      // Recalcule position_size si lot_size fourni ou manquant
      if ((updates as { lot_size?: number }).lot_size !== undefined || (updates as { position_size?: number }).position_size === undefined) {
        const contractSize = await getContractSizeForSymbol((updates as { symbol?: string }).symbol)
        const lotSize = (updates as { lot_size?: number }).lot_size
        if (typeof lotSize === 'number') {
          normalized.position_size = Number(lotSize) * contractSize
        }
      }

      // Respecte les profits fournis; aucun calcul côté client
      const providedGrossUpdate = (updates as { gross_profit?: number }).gross_profit
      const providedNetUpdate = (updates as { net_profit?: number }).net_profit
      console.log('💰 Traitement des profits:', { 
        providedGrossUpdate, 
        providedNetUpdate,
        grossType: typeof providedGrossUpdate,
        netType: typeof providedNetUpdate
      })
      if (providedGrossUpdate !== undefined) normalized.gross_profit = providedGrossUpdate
      if (providedNetUpdate !== undefined) normalized.net_profit = providedNetUpdate
      // Pas de fallback si non fournis

      console.log('📤 Données normalisées envoyées à Supabase:', JSON.stringify(normalized, null, 2))

      console.log('🔍 Paramètres de la requête:', { 
        id, 
        userId: user?.id, 
        normalizedKeys: Object.keys(normalized),
        normalizedValues: Object.values(normalized)
      })

      const { data, error: updateError } = await supabase
        .from('trades')
        .update(normalized as never)
        .eq('id', id)
        .eq('user_id', user?.id as never)
        .select()
        .single()

      console.log('📊 Résultat de la requête:', { data, updateError })

      if (updateError) {
        console.error('❌ Erreur Supabase updateTrade:', updateError)
        console.error('❌ Détails de l\'erreur:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        })
        throw updateError
      }

      console.log('✅ Trade mis à jour avec succès:', data)
      setTrades(trades.map((t) => (t.id === id ? (data as Trade) : t)))
      return { data, error: null }
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour du trade:', err)
      return { data: null, error: err as Error }
    }
  }

  const deleteTrade = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id as never)

      if (deleteError) throw deleteError

      setTrades(trades.filter((t) => t.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Erreur lors de la suppression du trade:', err)
      return { error: err as Error }
    }
  }

  return {
    trades,
    loading,
    error,
    fetchTrades,
    addTrade,
    updateTrade,
    deleteTrade,
  }
}

