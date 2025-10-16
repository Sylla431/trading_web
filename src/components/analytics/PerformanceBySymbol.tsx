'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import type { Trade } from '@/types'
import type { TimePeriod } from '@/components/analytics/TimePeriodFilter'
import { filterTradesByTimePeriod } from '@/lib/utils/timeFilters'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface PerformanceBySymbolProps {
  trades: Trade[]
  timePeriod?: TimePeriod
}

export function PerformanceBySymbol({ trades, timePeriod = 'month' }: PerformanceBySymbolProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const chartData = useMemo(() => {
    // Filtrer les trades par période temporelle
    const filteredTrades = timePeriod ? filterTradesByTimePeriod(trades, timePeriod) : trades
    
    const symbolStats = new Map<
      string,
      { wins: number; losses: number; totalProfit: number; count: number }
    >()

    filteredTrades
      .filter((t) => t.status === 'closed' && t.net_profit !== undefined && t.net_profit !== null)
      .forEach((trade) => {
        const symbol = trade.symbol
        const profit = trade.net_profit ?? 0
        const existing = symbolStats.get(symbol) || { wins: 0, losses: 0, totalProfit: 0, count: 0 }

        symbolStats.set(symbol, {
          wins: existing.wins + (profit > 0 ? 1 : 0),
          losses: existing.losses + (profit <= 0 ? 1 : 0),
          totalProfit: existing.totalProfit + profit,
          count: existing.count + 1,
        })
      })

    const sortedData = Array.from(symbolStats.entries())
      .map(([symbol, stats]) => ({
        symbol,
        profit: Number(stats.totalProfit.toFixed(2)),
        winRate: stats.count > 0 ? ((stats.wins / stats.count) * 100).toFixed(1) : '0',
        trades: stats.count,
      }))
      .sort((a, b) => b.profit - a.profit)

    return {
      labels: sortedData.map(d => d.symbol),
      datasets: [
        {
          label: 'Profit ($)',
          data: sortedData.map(d => d.profit),
          backgroundColor: sortedData.map(d => d.profit >= 0 ? '#10b981' : '#ef4444'),
          borderColor: sortedData.map(d => d.profit >= 0 ? '#059669' : '#dc2626'),
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }
      ],
      rawData: sortedData
    }
  }, [trades, timePeriod])

  if (chartData.rawData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Aucune donnée disponible
      </div>
    )
  }

  // Calculer la hauteur dynamique selon le nombre de symboles
  const dynamicHeight = Math.max(300, Math.min(600, chartData.rawData.length * 40 + 100))

  const options = {
    indexAxis: 'y' as const, // Barres horizontales
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#e8e8e8' : '#0f172a',
        bodyColor: isDark ? '#e8e8e8' : '#0f172a',
        borderColor: isDark ? 'rgba(80, 80, 80, 0.4)' : 'rgba(226, 232, 240, 0.4)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: function(context: TooltipItem<'bar'>[]) {
            const dataIndex = context[0].dataIndex
            return `Symbole: ${chartData.rawData[dataIndex]?.symbol || context[0].label}`
          },
          label: function(context: TooltipItem<'bar'>) {
            const dataIndex = context.dataIndex
            const data = chartData.rawData[dataIndex]
            return [
              `Profit: $${(context.parsed.x ?? 0).toFixed(2)}`,
              `Taux de réussite: ${data?.winRate}%`,
              `Trades: ${data?.trades}`
            ]
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(80, 80, 80, 0.2)' : 'rgba(226, 232, 240, 0.2)',
        },
        ticks: {
          color: isDark ? '#e8e8e8' : '#0f172a',
          font: {
            size: 11
          },
          callback: function(value: string | number) {
            return '$' + Number(value).toFixed(0)
          }
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#e8e8e8' : '#0f172a',
          font: {
            size: chartData.rawData.length > 10 ? 10 : 12
          }
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
  }

  return (
    <div style={{ height: `${dynamicHeight}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}

