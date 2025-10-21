'use client'

import { useMemo } from 'react'
import type { Trade } from '@/types'
import type { TimePeriod } from '@/components/analytics/TimePeriodFilter'
import { filterTradesByTimePeriod } from '@/lib/utils/timeFilters'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'

interface RiskRewardAnalysisProps {
  trades: Trade[]
  timePeriod?: TimePeriod
}

export function RiskRewardAnalysis({ trades, timePeriod = 'month' }: RiskRewardAnalysisProps) {
  const data = useMemo(() => {
    // Filtrer les trades par période temporelle
    const filteredTrades = timePeriod ? filterTradesByTimePeriod(trades, timePeriod) : trades
    
    return filteredTrades
      .filter((t) => {
        return (
          t.status === 'closed' &&
          t.entry_price && t.entry_price > 0 &&
          t.exit_price && t.exit_price > 0 &&
          t.stop_loss && t.stop_loss > 0 &&
          t.net_profit !== undefined &&
          t.net_profit !== null
        )
      })
      .map((trade) => {
        const entryPrice = trade.entry_price
        const exitPrice = trade.exit_price!
        const stopLoss = trade.stop_loss!
        const isLong = trade.trade_type === 'long'

        // Calcul du risque (distance entry -> SL)
        const risk = Math.abs(entryPrice - stopLoss)

        // Calcul de la récompense réelle (distance entry -> exit)
        const reward = Math.abs(exitPrice - entryPrice)

        // Ratio R:R
        const rrRatio = risk > 0 ? reward / risk : 0

        return {
          risk: Number(risk.toFixed(5)),
          reward: Number(reward.toFixed(5)),
          rrRatio: Number(rrRatio.toFixed(2)),
          profit: trade.net_profit ?? 0,
          symbol: trade.symbol,
          isWin: (trade.net_profit ?? 0) > 0,
        }
      })
      .filter((d) => d.rrRatio < 10) // Filtrer les outliers extrêmes
  }, [trades, timePeriod])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Aucun trade avec SL défini
      </div>
    )
  }

  const avgRR = data.reduce((sum, d) => sum + d.rrRatio, 0) / data.length

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            type="number"
            dataKey="risk"
            name="Risque"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            stroke="hsl(var(--border))"
            label={{ value: 'Risque (pips)', position: 'insideBottom', offset: -10, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            type="number"
            dataKey="reward"
            name="Récompense"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            stroke="hsl(var(--border))"
            label={{ value: 'Récompense (pips)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'rrRatio') return [value.toFixed(2), 'Ratio R:R']
              if (name === 'profit') return [`${value.toFixed(2)} $`, 'Profit']
              return [value, name]
            }}
          />
          <ReferenceLine
            segment={[
              { x: 0, y: 0 },
              { x: Math.max(...data.map((d) => d.risk)), y: Math.max(...data.map((d) => d.risk)) },
            ]}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="3 3"
            label="1:1"
          />
          <Scatter name="Trades" data={data}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isWin ? '#10b981' : '#ef4444'} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div className="grid gap-2 text-sm">
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <span className="font-medium">Ratio R:R moyen</span>
          <span className="text-lg font-bold text-primary">
            1:{avgRR.toFixed(2)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-muted-foreground">Trades gagnants</p>
            <p className="text-lg font-bold text-green-600">
              {data.filter((d) => d.isWin).length}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-muted-foreground">Trades perdants</p>
            <p className="text-lg font-bold text-red-600">
              {data.filter((d) => !d.isWin).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

