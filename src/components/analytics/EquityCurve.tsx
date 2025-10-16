'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { Trade } from '@/types'
import type { TimePeriod } from '@/components/analytics/TimePeriodFilter'
import { filterTradesByTimePeriod, formatTimeAxisLabel } from '@/lib/utils/timeFilters'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface EquityCurveProps {
  trades: Trade[]
  timePeriod?: TimePeriod
}

export function EquityCurve({ trades, timePeriod = 'month' }: EquityCurveProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const data = useMemo(() => {
    // Filtrer les trades par période temporelle
    const filteredTrades = timePeriod ? filterTradesByTimePeriod(trades, timePeriod) : trades
    const closedTrades = filteredTrades
      .filter((t) => t.status === 'closed' && t.net_profit !== null)
      .sort((a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime())

    let cumulativeProfit = 0
    return closedTrades.map((trade) => {
      cumulativeProfit += trade.net_profit ?? 0
        const tradeDate = new Date(trade.entry_time)
        return {
          date: formatTimeAxisLabel(tradeDate, timePeriod),
          profit: Number(cumulativeProfit.toFixed(2)),
          fullDate: format(tradeDate, 'dd MMM yyyy', { locale: fr }),
        }
    })
  }, [trades, timePeriod])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Pas assez de données pour afficher la courbe
      </div>
    )
  }

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Capital',
        data: data.map(d => d.profit),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
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
                return data[dataIndex]?.fullDate || context[0].label
              },
              label: function(context: { parsed: { y: number } }) {
                return `Capital: ${context.parsed.y.toFixed(2)} $`
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
          font: {
            size: 11
          }
        },
      },
      y: {
        grid: {
          // display: false,
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
      easing: 'easeInOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    }
  }

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}

