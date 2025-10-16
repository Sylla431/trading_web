'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
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
import type { Trade } from '@/types'
import type { TimePeriod } from '@/components/analytics/TimePeriodFilter'
import { filterTradesByTimePeriod } from '@/lib/utils/timeFilters'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface ProfitDistributionProps {
  trades: Trade[]
  timePeriod?: TimePeriod
}

export function ProfitDistribution({ trades, timePeriod = 'month' }: ProfitDistributionProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const chartData = useMemo(() => {
    // Filtrer les trades par période temporelle
    const filteredTrades = timePeriod ? filterTradesByTimePeriod(trades, timePeriod) : trades
    const closedTrades = filteredTrades.filter((t) => t.status === 'closed' && t.net_profit !== null)
    
    const winningTrades = closedTrades.filter((t) => (t.net_profit ?? 0) > 0)
    const losingTrades = closedTrades.filter((t) => (t.net_profit ?? 0) < 0)
    const breakEvenTrades = closedTrades.filter((t) => (t.net_profit ?? 0) === 0)

    // Calculer les montants
    const totalWinning = winningTrades.reduce((sum, t) => sum + (t.net_profit ?? 0), 0)
    const totalLosing = Math.abs(losingTrades.reduce((sum, t) => sum + (t.net_profit ?? 0), 0))
    const netProfit = totalWinning - totalLosing

    return {
      labels: ['Profit net', 'Pertes', 'Break-even'],
      datasets: [
        {
          label: 'Montant ($)',
          data: [netProfit, totalLosing, 0],
          backgroundColor: [
            netProfit >= 0 ? '#10b981' : '#ef4444', // Vert si positif, rouge si négatif
            '#ef4444', // Rouge pour les pertes
            '#6b7280', // Gris pour break-even
          ],
          borderColor: [
            netProfit >= 0 ? '#059669' : '#dc2626', // Vert si positif, rouge si négatif
            '#dc2626',
            '#4b5563',
          ],
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
      tradeCounts: {
        winning: winningTrades.length,
        losing: losingTrades.length,
        breakEven: breakEvenTrades.length,
      },
    }
  }, [trades, timePeriod])

  if (trades.filter((t) => t.status === 'closed').length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Pas assez de données pour afficher la distribution
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
        backgroundColor: 'hsl(var(--card))',
        titleColor: 'hsl(var(--card-foreground))',
        bodyColor: 'hsl(var(--card-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        cornerRadius: 6,
          callbacks: {
            label: function(context: TooltipItem<'bar'>): string {
              const label = context.label || ''
              const value = context.parsed.y ?? 0
              const index = context.dataIndex
              
              if (index === 0) {
                return `${label}: ${value.toFixed(2)} $ (${chartData.tradeCounts.winning} trades gagnants - ${chartData.tradeCounts.losing} trades perdants)`
              } else if (index === 1) {
                return `${label}: ${value.toFixed(2)} $ (${chartData.tradeCounts.losing} trades perdants)`
              } else {
                return `${label}: 0 $ (${chartData.tradeCounts.breakEven} trades)`
              }
            }
          }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#e8e8e8' : '#0f172a',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#e8e8e8' : '#0f172a',
          callback: function(value: string | number): string {
            return '$' + Number(value).toFixed(0)
          }
        },
      },
    },
  }

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}

