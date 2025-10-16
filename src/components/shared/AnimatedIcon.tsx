import React from 'react'
import { Icon as IconifyIcon } from '@iconify/react'
import { cn } from '@/lib/utils/cn'

interface AnimatedIconProps {
  icon: string  // ex: "fluent-emoji:chart-increasing"
  size?: number
  className?: string
  animated?: boolean
}

export function AnimatedIcon({ 
  icon, 
  size = 24, 
  className,
  animated = true 
}: AnimatedIconProps) {
  return (
    <IconifyIcon 
      icon={icon} 
      width={size} 
      height={size}
      className={cn(
        animated && 'hover:scale-110 transition-transform duration-300',
        className
      )}
    />
  )
}

// Icônes populaires pour le trading
export const TradingIcons = {
  chartUp: 'fluent-emoji:chart-increasing',
  chartDown: 'fluent-emoji:chart-decreasing',
  money: 'fluent-emoji:money-bag',
  trophy: 'fluent-emoji:trophy',
  fire: 'fluent-emoji:fire',
  rocket: 'fluent-emoji:rocket',
  target: 'fluent-emoji:direct-hit',
  brain: 'fluent-emoji:brain',
  calendar: 'fluent-emoji:calendar',
  notebook: 'fluent-emoji:notebook',
  star: 'fluent-emoji:glowing-star',
  checkmark: 'fluent-emoji:check-mark-button',
  warning: 'fluent-emoji:warning',
  lightning: 'fluent-emoji:high-voltage',
  gem: 'fluent-emoji:gem-stone',
}

