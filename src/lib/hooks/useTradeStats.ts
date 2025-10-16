'use client'

import { useMemo } from 'react'
import type { Trade, TradeStatistics } from '@/types'

export function useTradeStats(trades: Trade[]): TradeStatistics {
  return useMemo(() => {
    const closedTrades = trades.filter((t) => t.status === 'closed' && t.net_profit !== null)

    if (closedTrades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        largestWin: 0,
        largestLoss: 0,
        averageTradeDuration: 0,
        bestDay: 0,
        worstDay: 0,
      }
    }

    const winningTrades = closedTrades.filter((t) => (t.net_profit ?? 0) > 0)
    const losingTrades = closedTrades.filter((t) => (t.net_profit ?? 0) < 0)

    // Calculer seulement les GAINS (trades positifs)
    const totalProfit = winningTrades.reduce((sum, t) => {
      const profit = t.net_profit
      if (profit === null || profit === undefined) {
        console.warn('Winning trade with null/undefined profit:', { id: t.id, symbol: t.symbol, net_profit: profit })
        return sum
      }
      // Les trades gagnants ont déjà des profits positifs, pas besoin de Math.abs()
      return sum + profit
    }, 0)
    
    // Calculer seulement les PERTES (trades négatifs)
    const totalLoss = losingTrades.reduce((sum, t) => {
      const profit = t.net_profit
      if (profit === null || profit === undefined) {
        console.warn('Losing trade with null/undefined profit:', { id: t.id, symbol: t.symbol, net_profit: profit })
        return sum
      }
      // Seulement les pertes (valeurs négatives converties en positives)
      return sum + Math.abs(profit)
    }, 0)
    const netProfit = totalProfit - totalLoss

    const averageWin = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0
    const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0

    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0

    const largestWin = winningTrades.length > 0
      ? Math.max(...winningTrades.map((t) => t.net_profit ?? 0))
      : 0

    const largestLoss = losingTrades.length > 0
      ? Math.min(...losingTrades.map((t) => t.net_profit ?? 0))
      : 0

    // Calculer le drawdown maximal
    let cumulativeProfit = 0
    let peak = 0
    let maxDrawdown = 0

    closedTrades
      .sort((a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime())
      .forEach((trade) => {
        cumulativeProfit += trade.net_profit ?? 0
        if (cumulativeProfit > peak) {
          peak = cumulativeProfit
        }
        const drawdown = peak - cumulativeProfit
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown
        }
      })

    // Calculer la durée moyenne des trades
    const tradesWithDuration = closedTrades.filter((t) => t.duration_minutes)
    const averageTradeDuration =
      tradesWithDuration.length > 0
        ? tradesWithDuration.reduce((sum, t) => sum + (t.duration_minutes ?? 0), 0) /
          tradesWithDuration.length
        : 0

    // Grouper par jour pour meilleur/pire jour
    const profitByDay = new Map<string, number>()
    closedTrades.forEach((trade) => {
      const day = new Date(trade.entry_time).toISOString().split('T')[0]
      profitByDay.set(day, (profitByDay.get(day) || 0) + (trade.net_profit ?? 0))
    })

    const dailyProfits = Array.from(profitByDay.values())
    const bestDay = dailyProfits.length > 0 ? Math.max(...dailyProfits) : 0
    const worstDay = dailyProfits.length > 0 ? Math.min(...dailyProfits) : 0

    return {
      totalTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / closedTrades.length) * 100,
      totalProfit,
      totalLoss,
      netProfit,
      averageWin,
      averageLoss,
      profitFactor,
      maxDrawdown,
      largestWin,
      largestLoss,
      averageTradeDuration,
      bestDay,
      worstDay,
    }
  }, [trades])
}

