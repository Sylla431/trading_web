'use client'

import { useMemo } from 'react'
import type { Trade } from '@/types'

interface TotalGainsCheckerProps {
  trades: Trade[]
}

export function TotalGainsChecker({ trades }: TotalGainsCheckerProps) {
  const analysis = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status === 'closed')
    const tradesWithProfit = closedTrades.filter((t) => t.net_profit !== null && t.net_profit !== undefined)
    const tradesWithoutProfit = closedTrades.filter((t) => t.net_profit === null || t.net_profit === undefined)
    
    const winningTrades = tradesWithProfit.filter((t) => (t.net_profit ?? 0) > 0)
    const losingTrades = tradesWithProfit.filter((t) => (t.net_profit ?? 0) < 0)
    const breakEvenTrades = tradesWithProfit.filter((t) => (t.net_profit ?? 0) === 0)

    // Calcul détaillé des gains
    let totalWinning = 0
    let totalLosing = 0
    const problemTrades: Array<{ type: string; trade: Trade }> = []

    winningTrades.forEach((trade) => {
      const profit = trade.net_profit
      if (profit === null || profit === undefined) {
        problemTrades.push({ type: 'winning_null', trade })
      } else {
        // Les trades gagnants ont déjà des profits positifs
        totalWinning += profit
      }
    })

    losingTrades.forEach((trade) => {
      const profit = trade.net_profit
      if (profit === null || profit === undefined) {
        problemTrades.push({ type: 'losing_null', trade })
      } else {
        // Seulement les pertes (valeurs négatives converties en positives)
        totalLosing += Math.abs(profit)
      }
    })

    return {
      totalTrades: trades.length,
      closedTrades: closedTrades.length,
      tradesWithProfit: tradesWithProfit.length,
      tradesWithoutProfit: tradesWithoutProfit,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      breakEvenTrades: breakEvenTrades.length,
      totalWinning,
      totalLosing,
      netProfit: totalWinning - totalLosing,
      problemTrades,
    }
  }, [trades])

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
      <h3 className="font-semibold mb-3 text-yellow-800 dark:text-yellow-200">
        🔍 Vérification du Total des Gains
      </h3>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><strong>Total trades:</strong> {analysis.totalTrades}</div>
        <div><strong>Trades fermés:</strong> {analysis.closedTrades}</div>
        <div><strong>Avec profit:</strong> {analysis.tradesWithProfit}</div>
        <div><strong>Sans profit:</strong> {analysis.tradesWithoutProfit.length}</div>
        <div><strong>Trades gagnants:</strong> {analysis.winningTrades}</div>
        <div><strong>Trades perdants:</strong> {analysis.losingTrades}</div>
        <div><strong>Break-even:</strong> {analysis.breakEvenTrades}</div>
        <div><strong>Total gains:</strong> <span className="text-green-600 font-bold">{analysis.totalWinning.toFixed(2)} $</span></div>
        <div><strong>Total pertes:</strong> <span className="text-red-600 font-bold">{Math.abs(analysis.totalLosing).toFixed(2)} $</span></div>
        <div><strong>Profit net:</strong> <span className={`font-bold ${analysis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{analysis.netProfit.toFixed(2)} $</span></div>
      </div>

      {analysis.problemTrades.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
            ⚠️ Trades avec problèmes ({analysis.problemTrades.length})
          </h4>
          <div className="text-xs space-y-1">
            {analysis.problemTrades.map((problem, index) => (
              <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded border">
                <div><strong>Type:</strong> {problem.type}</div>
                <div><strong>Trade ID:</strong> {problem.trade.id}</div>
                <div><strong>Symbol:</strong> {problem.trade.symbol}</div>
                <div><strong>Net Profit:</strong> {String(problem.trade.net_profit)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.tradesWithoutProfit.length > 0 && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
          <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
            📊 Trades fermés sans profit ({analysis.tradesWithoutProfit.length})
          </h4>
          <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
            {analysis.tradesWithoutProfit.slice(0, 10).map((trade, index) => (
              <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded border">
                <div><strong>ID:</strong> {trade.id}</div>
                <div><strong>Symbol:</strong> {trade.symbol}</div>
                <div><strong>Status:</strong> {trade.status}</div>
                <div><strong>Net Profit:</strong> {String(trade.net_profit)}</div>
              </div>
            ))}
            {analysis.tradesWithoutProfit.length > 10 && (
              <div className="text-orange-600">... et {analysis.tradesWithoutProfit.length - 10} autres</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
