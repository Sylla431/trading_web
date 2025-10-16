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

interface PerformanceByDayProps {
  trades: Trade[]
  timePeriod?: TimePeriod
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export function PerformanceByDay({ trades, timePeriod = 'month' }: PerformanceByDayProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const chartData = useMemo(() => {
    // Filtrer les trades par période temporelle
    const filteredTrades = timePeriod ? filterTradesByTimePeriod(trades, timePeriod) : trades
    
    const dayStats = new Map<number, { profit: number; count: number; wins: number }>()

    filteredTrades
      .filter((t) => t.status === 'closed' && t.net_profit !== undefined && t.net_profit !== null)
      .forEach((trade) => {
        const entryDate = new Date(trade.entry_time)
        const dayOfWeek = entryDate.getDay() // 0 = Dimanche, 1 = Lundi, etc.
        const profit = trade.net_profit ?? 0
        const existing = dayStats.get(dayOfWeek) || { profit: 0, count: 0, wins: 0 }

        dayStats.set(dayOfWeek, {
          profit: existing.profit + profit,
          count: existing.count + 1,
          wins: existing.wins + (profit > 0 ? 1 : 0),
        })
      })

    // Convertir en format pour le graphique (Lundi = 0, Dimanche = 6)
    const sortedData = []
    for (let i = 1; i <= 6; i++) { // Lundi à Samedi
      const stats = dayStats.get(i) || { profit: 0, count: 0, wins: 0 }
      sortedData.push({
        day: DAYS[i - 1],
        profit: Number(stats.profit.toFixed(2)),
        count: stats.count,
        winRate: stats.count > 0 ? ((stats.wins / stats.count) * 100).toFixed(1) : '0',
      })
    }
    
    // Ajouter Dimanche (index 0)
    const sundayStats = dayStats.get(0) || { profit: 0, count: 0, wins: 0 }
    sortedData.push({
      day: 'Dimanche',
      profit: Number(sundayStats.profit.toFixed(2)),
      count: sundayStats.count,
      winRate: sundayStats.count > 0 ? ((sundayStats.wins / sundayStats.count) * 100).toFixed(1) : '0',
    })

    return {
      labels: sortedData.map(d => d.day),
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

  if (chartData.rawData.every(d => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Aucune donnée de trading disponible
      </div>
    )
  }

  const options = {
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
          title: function(context: any) {
            const dataIndex = context[0].dataIndex
            return `Jour: ${chartData.rawData[dataIndex]?.day || context[0].label}`
          },
          label: function(context: any) {
            const dataIndex = context.dataIndex
            const data = chartData.rawData[dataIndex]
            return [
              `Profit: $${context.parsed.y.toFixed(2)}`,
              `Trades: ${data?.count}`,
              `Taux de réussite: ${data?.winRate}%`
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
            size: 12
          }
        },
      },
      y: {
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
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
  }

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
