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

interface PerformanceByStrategyProps {
  trades: Trade[]
  timePeriod?: TimePeriod
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export function PerformanceByStrategy({ trades, timePeriod = 'month' }: PerformanceByStrategyProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const chartData = useMemo(() => {
    // Filtrer les trades par période temporelle
    const filteredTrades = timePeriod ? filterTradesByTimePeriod(trades, timePeriod) : trades
    
    const strategyStats = new Map<string, { profit: number; count: number }>()

    filteredTrades
      .filter((t) => t.status === 'closed' && t.strategy_name && t.net_profit !== undefined && t.net_profit !== null)
      .forEach((trade) => {
        const strategy = trade.strategy_name!
        const profit = trade.net_profit ?? 0
        const existing = strategyStats.get(strategy) || { profit: 0, count: 0 }

        strategyStats.set(strategy, {
          profit: existing.profit + profit,
          count: existing.count + 1,
        })
      })

    const sortedData = Array.from(strategyStats.entries())
      .map(([name, stats]) => ({
        name,
        value: Number(stats.profit.toFixed(2)),
        count: stats.count,
      }))
      .sort((a, b) => b.value - a.value)

    return {
      labels: sortedData.map(d => d.name),
      datasets: [
        {
          label: 'Profit ($)',
          data: sortedData.map(d => d.value),
          backgroundColor: sortedData.map((_, index) => COLORS[index % COLORS.length]),
          borderColor: sortedData.map((_, index) => COLORS[index % COLORS.length]),
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
        }
      ],
      rawData: sortedData
    }
  }, [trades, timePeriod])

  if (chartData.rawData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Aucune stratégie enregistrée
      </div>
    )
  }

  // Calculer la hauteur dynamique selon le nombre de stratégies
  const dynamicHeight = Math.max(300, Math.min(600, chartData.rawData.length * 50 + 100))

  const options = {
    indexAxis: 'y' as const, // Barres horizontales (progress bars)
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
              title: function(context: { dataIndex: number; label: string }[]) {
                const dataIndex = context[0].dataIndex
                return `Stratégie: ${chartData.rawData[dataIndex]?.name || context[0].label}`
              },
              label: function(context: { dataIndex: number; parsed: { x: number } }) {
                const dataIndex = context.dataIndex
                const data = chartData.rawData[dataIndex]
                return [
                  `Profit: $${context.parsed.x.toFixed(2)}`,
                  `Trades: ${data?.count}`
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
          callback: function(value: number) {
            return '$' + value.toFixed(0)
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
            size: chartData.rawData.length > 8 ? 10 : 12
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

