'use client'

import { useMemo } from 'react'
import { useTheme } from 'next-themes'
import type { Trade, EmotionType } from '@/types'
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

interface EmotionAnalysisProps {
  trades: Trade[]
  timePeriod?: TimePeriod
}

const EMOTION_LABELS: Record<EmotionType, string> = {
  excellent: 'Excellent',
  good: 'Bien',
  neutral: 'Neutre',
  bad: 'Mauvais',
  terrible: 'Terrible',
}

export function EmotionAnalysis({ trades, timePeriod = 'month' }: EmotionAnalysisProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const chartData = useMemo(() => {
    // Filtrer les trades par période temporelle
    const filteredTrades = timePeriod ? filterTradesByTimePeriod(trades, timePeriod) : trades
    
    const emotionStats = new Map<
      EmotionType,
      { wins: number; losses: number; totalProfit: number }
    >()

    filteredTrades
      .filter((t) => t.status === 'closed' && t.emotion_before && t.net_profit !== undefined && t.net_profit !== null)
      .forEach((trade) => {
        const emotion = trade.emotion_before!
        const profit = trade.net_profit ?? 0
        const existing = emotionStats.get(emotion) || { wins: 0, losses: 0, totalProfit: 0 }

        emotionStats.set(emotion, {
          wins: existing.wins + (profit > 0 ? 1 : 0),
          losses: existing.losses + (profit <= 0 ? 1 : 0),
          totalProfit: existing.totalProfit + profit,
        })
      })

    const sortedData = Array.from(emotionStats.entries())
      .map(([emotion, stats]) => ({
        emotion: EMOTION_LABELS[emotion],
        emotionKey: emotion,
        wins: stats.wins,
        losses: stats.losses,
        profit: Number(stats.totalProfit.toFixed(2)),
        winRate: stats.wins + stats.losses > 0
          ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)
          : '0',
      }))
      .sort((a, b) => b.profit - a.profit)

    return {
      labels: sortedData.map(d => d.emotion),
      datasets: [
        {
          label: 'Trades gagnants',
          data: sortedData.map(d => d.wins),
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Trades perdants',
          data: sortedData.map(d => d.losses),
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
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
        Aucune émotion enregistrée
      </div>
    )
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: isDark ? '#e8e8e8' : '#0f172a',
          usePointStyle: true,
          pointStyle: 'rectRounded',
        }
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
              return `Émotion: ${context[0].label}`
            },
            label: function(context: { dataset: { label?: string }; parsed: { y: number } }) {
              const datasetLabel = context.dataset.label || ''
              const value = context.parsed.y
              return `${datasetLabel}: ${value} trades`
            },
            afterBody: function(context: { dataIndex: number }[]) {
              const dataIndex = context[0].dataIndex
              const data = chartData.rawData[dataIndex]
              return [
                `Taux de réussite: ${data?.winRate}%`,
                `Profit total: ${data?.profit >= 0 ? '+' : ''}$${data?.profit.toFixed(2)}`
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
          stepSize: 1
        },
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
  }

  return (
    <div className="space-y-4">
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>

      {/* Insights */}
      <div className="grid gap-2 text-sm">
        {chartData.rawData.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                item.emotionKey === 'excellent' ? 'bg-green-500' :
                item.emotionKey === 'good' ? 'bg-blue-500' :
                item.emotionKey === 'neutral' ? 'bg-gray-500' :
                item.emotionKey === 'bad' ? 'bg-orange-500' :
                'bg-red-500'
              }`} />
              <span className="font-medium">{item.emotion}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground">
                Taux: {item.winRate}%
              </span>
              <span className={item.profit >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {item.profit >= 0 ? '+' : ''}${item.profit.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

