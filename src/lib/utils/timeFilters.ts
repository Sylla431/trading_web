import type { Trade } from '@/types'
import type { TimePeriod } from '@/components/analytics/TimePeriodFilter'

export function filterTradesByTimePeriod(trades: Trade[], period: TimePeriod): Trade[] {
  const now = new Date()
  const cutoffDate = getCutoffDate(now, period)
  
  return trades.filter(trade => {
    const tradeDate = new Date(trade.entry_time)
    return tradeDate >= cutoffDate
  })
}

function getCutoffDate(now: Date, period: TimePeriod): Date {
  const cutoff = new Date(now)
  
  switch (period) {
    case 'day':
      // Aujourd'hui
      cutoff.setHours(0, 0, 0, 0)
      break
      
    case 'week':
      // Cette semaine (lundi)
      const dayOfWeek = cutoff.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      cutoff.setDate(cutoff.getDate() - daysToMonday)
      cutoff.setHours(0, 0, 0, 0)
      break
      
    case 'month':
      // Ce mois
      cutoff.setDate(1)
      cutoff.setHours(0, 0, 0, 0)
      break
      
    case 'year':
      // Cette année
      cutoff.setMonth(0, 1)
      cutoff.setHours(0, 0, 0, 0)
      break
  }
  
  return cutoff
}

export function formatTimeAxisLabel(date: Date, period: TimePeriod): string {
  switch (period) {
    case 'day':
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      })
      
    case 'week':
      const weekStart = new Date(date)
      const dayOfWeek = weekStart.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      weekStart.setDate(weekStart.getDate() - daysToMonday)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      return `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`
      
    case 'month':
      return date.toLocaleDateString('fr-FR', { 
        month: 'short', 
        year: 'numeric' 
      })
      
    case 'year':
      return date.getFullYear().toString()
      
    default:
      return date.toLocaleDateString('fr-FR')
  }
}

export function getTimeAxisStep(period: TimePeriod): number {
  switch (period) {
    case 'day':
      return 1 // 1 heure
    case 'week':
      return 1 // 1 jour
    case 'month':
      return 7 // 1 semaine
    case 'year':
      return 30 // 1 mois
    default:
      return 1
  }
}
