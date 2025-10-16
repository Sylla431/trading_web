'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CalendarDays, CalendarRange } from 'lucide-react'

export type TimePeriod = 'day' | 'week' | 'month' | 'year'

interface TimePeriodFilterProps {
  selectedPeriod: TimePeriod
  onPeriodChange: (period: TimePeriod) => void
  className?: string
}

const periodConfig = {
  day: { label: 'Jour', icon: Clock },
  week: { label: 'Semaine', icon: Calendar },
  month: { label: 'Mois', icon: CalendarDays },
  year: { label: 'Année', icon: CalendarRange },
}

export function TimePeriodFilter({ selectedPeriod, onPeriodChange, className = '' }: TimePeriodFilterProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {Object.entries(periodConfig).map(([period, config]) => {
        const Icon = config.icon
        const isSelected = selectedPeriod === period
        
        return (
          <Button
            key={period}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange(period as TimePeriod)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            {config.label}
          </Button>
        )
      })}
    </div>
  )
}
