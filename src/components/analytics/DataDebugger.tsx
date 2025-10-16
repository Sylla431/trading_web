'use client'

import { useMemo } from 'react'
import type { Trade } from '@/types'

interface DataDebuggerProps {
  trades: Trade[]
  title?: string
}

export function DataDebugger({ trades, title = "Debug des données" }: DataDebuggerProps) {
  const debugData = useMemo(() => {
    const allTrades = trades
    const closedTrades = trades.filter((t) => t.status === 'closed' && t.net_profit !== null)
    const winningTrades = closedTrades.filter((t) => (t.net_profit ?? 0) > 0)
    const losingTrades = closedTrades.filter((t) => (t.net_profit ?? 0) < 0)
    const breakEvenTrades = closedTrades.filter((t) => (t.net_profit ?? 0) === 0)

    const totalWinning = winningTrades.reduce((sum, t) => {
      const profit = t.net_profit
      console.log('Winning trade:', { id: t.id, symbol: t.symbol, net_profit: profit, type: typeof profit })
      // Les trades gagnants ont déjà des profits positifs
      return sum + (profit ?? 0)
    }, 0)
    const totalLosing = losingTrades.reduce((sum, t) => {
      const profit = t.net_profit
      console.log('Losing trade:', { id: t.id, symbol: t.symbol, net_profit: profit, type: typeof profit })
      // Seulement les pertes (valeurs négatives converties en positives)
      return sum + Math.abs(profit ?? 0)
    }, 0)
    const netProfit = totalWinning - totalLosing

    return {
      allTrades: allTrades.length,
      closedTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      breakEvenTrades: breakEvenTrades.length,
      totalWinning,
      totalLosing,
      netProfit,
      winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      profitFactor: totalLosing > 0 ? totalWinning / totalLosing : totalWinning > 0 ? Infinity : 0,
    }
  }, [trades])

  return (
    <div className="p-4 bg-muted/50 rounded-lg border">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><strong>Total trades:</strong> {debugData.allTrades}</div>
        <div><strong>Trades fermés:</strong> {debugData.closedTrades}</div>
        <div><strong>Trades gagnants:</strong> {debugData.winningTrades}</div>
        <div><strong>Trades perdants:</strong> {debugData.losingTrades}</div>
        <div><strong>Break-even:</strong> {debugData.breakEvenTrades}</div>
        <div><strong>Total gains:</strong> {debugData.totalWinning.toFixed(2)} $</div>
        <div><strong>Total pertes:</strong> {debugData.totalLosing.toFixed(2)} $</div>
        <div><strong>Profit net:</strong> {debugData.netProfit.toFixed(2)} $</div>
        <div><strong>Taux de réussite:</strong> {debugData.winRate.toFixed(1)}%</div>
        <div><strong>Profit Factor:</strong> {debugData.profitFactor === Infinity ? '∞' : debugData.profitFactor.toFixed(2)}</div>
      </div>
      
      {/* Afficher quelques trades pour debug */}
      <details className="mt-4">
        <summary className="cursor-pointer font-medium">Voir les premiers trades fermés</summary>
        <div className="mt-2 max-h-40 overflow-y-auto">
          {trades
            .filter((t) => t.status === 'closed' && t.net_profit !== null)
            .slice(0, 5)
            .map((trade, index) => (
              <div key={trade.id} className="text-xs p-2 bg-background rounded border mb-1">
                <div><strong>Trade {index + 1}:</strong> {trade.symbol}</div>
                <div>Profit: {trade.net_profit?.toFixed(2)} $</div>
                <div>Date: {new Date(trade.entry_time).toLocaleDateString()}</div>
              </div>
            ))}
        </div>
      </details>
    </div>
  )
}
