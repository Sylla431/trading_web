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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type TooltipItem,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { Line } from 'react-chartjs-2'
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
  Filler,
  annotationPlugin
)

interface WinRateOverTimeProps {
  trades: Trade[]
  timePeriod?: TimePeriod
}

export function WinRateOverTime({ trades, timePeriod = 'month' }: WinRateOverTimeProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const chartData = useMemo(() => {
    // Filtrer les trades par période temporelle
    const filteredTrades = timePeriod ? filterTradesByTimePeriod(trades, timePeriod) : trades
    
    const closedTrades = filteredTrades
      .filter((t) => t.status === 'closed' && t.exit_time && t.net_profit !== undefined && t.net_profit !== null)
      .sort((a, b) => new Date(a.exit_time!).getTime() - new Date(b.exit_time!).getTime())

    if (closedTrades.length === 0) return { labels: [], datasets: [], rawData: [] }

    const windowSize = Math.max(10, Math.floor(closedTrades.length / 20)) // Fenêtre glissante adaptative
    const result: Array<{ date: string; winRate: number; trades: number; fullDate: string }> = []

    for (let i = windowSize - 1; i < closedTrades.length; i++) {
      const window = closedTrades.slice(Math.max(0, i - windowSize + 1), i + 1)
      const wins = window.filter((t) => (t.net_profit ?? 0) > 0).length
      const winRate = (wins / window.length) * 100

      result.push({
        date: format(new Date(closedTrades[i].exit_time!), 'dd MMM', { locale: fr }),
        winRate: Number(winRate.toFixed(1)),
        trades: window.length,
        fullDate: format(new Date(closedTrades[i].exit_time!), 'dd MMM yyyy', { locale: fr }),
      })
    }

    // Échantillonner pour garder ~20 points max
    const step = Math.max(1, Math.floor(result.length / 20))
    const sampledData = result.filter((_, idx) => idx % step === 0 || idx === result.length - 1)

    return {
      labels: sampledData.map(d => d.date),
      datasets: [
        {
          label: 'Taux de réussite',
          data: sampledData.map(d => d.winRate),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4, // Interpolation smooth - courbe fluide
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#059669',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
        }
      ],
      rawData: sampledData
    }
  }, [trades, timePeriod])

  if (chartData.rawData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Pas assez de trades pour afficher l&apos;évolution
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
          title: function(context: TooltipItem<'line'>[]) {
            const dataIndex = context[0].dataIndex
            return chartData.rawData[dataIndex]?.fullDate || context[0].label
          },
          label: function(context: TooltipItem<'line'>) {
            const dataIndex = context.dataIndex
            const data = chartData.rawData[dataIndex]
            return [
              `Taux de réussite: ${(context.parsed.y ?? 0).toFixed(1)}%`,
              `Trades dans la fenêtre: ${data?.trades || 0}`
            ]
          }
        }
      },
      annotation: {
        annotations: {
          line50: {
            type: 'line' as const,
            yMin: 50,
            yMax: 50,
            borderColor: isDark ? '#6b7280' : '#9ca3af',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: 'Seuil 50%',
              enabled: true,
              position: 'end' as const,
              backgroundColor: isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              color: isDark ? '#e8e8e8' : '#0f172a',
              font: {
                size: 10
              }
            }
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
          }
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: isDark ? 'rgba(80, 80, 80, 0.2)' : 'rgba(226, 232, 240, 0.2)',
        },
        ticks: {
          color: isDark ? '#e8e8e8' : '#0f172a',
          font: {
            size: 11
          },
          callback: function(value: string | number) {
            return Number(value) + '%'
          }
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      line: {
        tension: 0.4, // Interpolation smooth - courbe fluide
      },
      point: {
        hoverRadius: 8,
      }
    }
  }

  return (
    <div style={{ height: '350px' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}

