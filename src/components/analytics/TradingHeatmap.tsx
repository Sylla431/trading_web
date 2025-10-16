'use client'

import { useMemo } from 'react'
import type { Trade } from '@/types'
import type { TimePeriod } from '@/components/analytics/TimePeriodFilter'
import { filterTradesByTimePeriod } from '@/lib/utils/timeFilters'

interface TradingHeatmapProps {
  trades: Trade[]
  timePeriod?: TimePeriod
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function TradingHeatmap({ trades, timePeriod = 'month' }: TradingHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Filtrer les trades par période temporelle
    const filteredTrades = timePeriod ? filterTradesByTimePeriod(trades, timePeriod) : trades
    
    const data: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
    const counts: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))

    filteredTrades
      .filter((t) => t.status === 'closed' && t.entry_time && t.net_profit !== undefined && t.net_profit !== null)
      .forEach((trade) => {
        const date = new Date(trade.entry_time)
        const day = (date.getDay() + 6) % 7 // Lundi = 0
        const hour = date.getHours()
        const profit = trade.net_profit ?? 0

        data[day][hour] += profit
        counts[day][hour] += 1
      })

    // Calculer le profit moyen par cellule
    const avgData = data.map((row, dayIdx) =>
      row.map((profit, hourIdx) => {
        const count = counts[dayIdx][hourIdx]
        return count > 0 ? profit / count : 0
      })
    )

    const maxAbsValue = Math.max(
      ...avgData.flat().map((v) => Math.abs(v))
    )

    return { avgData, counts, maxAbsValue }
  }, [trades, timePeriod])

  const getColor = (value: number, maxValue: number) => {
    if (value === 0) return 'rgba(100, 100, 100, 0.1)'
    const intensity = Math.abs(value) / (maxValue || 1)
    if (value > 0) {
      return `rgba(16, 185, 129, ${0.2 + intensity * 0.8})` // Green
    } else {
      return `rgba(239, 68, 68, ${0.2 + intensity * 0.8})` // Red
    }
  }

  if (heatmapData.avgData.every((row) => row.every((v) => v === 0))) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Aucune donnée disponible
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-1">
          {/* Header - Hours */}
          <div />
          {HOURS.map((hour) => (
            <div key={hour} className="text-xs text-center text-muted-foreground">
              {hour}h
            </div>
          ))}

          {/* Rows - Days */}
          {DAYS.map((day, dayIdx) => (
            <>
              <div key={`day-${dayIdx}`} className="text-xs flex items-center text-muted-foreground">
                {day}
              </div>
              {HOURS.map((hour) => {
                const value = heatmapData.avgData[dayIdx][hour]
                const count = heatmapData.counts[dayIdx][hour]
                return (
                  <div
                    key={`${dayIdx}-${hour}`}
                    className="aspect-square rounded flex items-center justify-center text-xs font-medium cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    style={{
                      backgroundColor: getColor(value, heatmapData.maxAbsValue),
                    }}
                    title={`${day} ${hour}h: ${value.toFixed(2)}$ (${count} trades)`}
                  >
                    {count > 0 && (
                      <span className="text-[10px]">{count}</span>
                    )}
                  </div>
                )
              })}
            </>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)' }} />
            <span>Pertes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(100, 100, 100, 0.1)' }} />
            <span>Aucun trade</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(16, 185, 129, 0.8)' }} />
            <span>Gains</span>
          </div>
        </div>
      </div>
    </div>
  )
}

