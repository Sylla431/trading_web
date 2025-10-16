import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface IconWrapperProps {
  icon: LucideIcon
  variant?: '3d' | 'glow' | 'gradient' | 'default'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
}

const iconSizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
}

export function IconWrapper({ 
  icon: Icon, 
  variant = 'default', 
  size = 'md',
  className 
}: IconWrapperProps) {
  
  const baseClasses = cn(
    'flex items-center justify-center rounded-2xl transition-all duration-300',
    sizeMap[size]
  )

  if (variant === '3d') {
    return (
      <div 
        className={cn(
          baseClasses,
          'bg-gradient-to-br from-primary/20 to-primary/5',
          'shadow-lg shadow-primary/20',
          'hover:shadow-2xl hover:shadow-primary/40',
          'hover:scale-110 hover:-translate-y-1',
          'border border-primary/30',
          className
        )}
        style={{
          transform: 'perspective(1000px) rotateX(5deg)',
        }}
      >
        <Icon className={cn(iconSizeMap[size], 'text-primary')} />
      </div>
    )
  }

  if (variant === 'glow') {
    return (
      <div 
        className={cn(
          baseClasses,
          'bg-primary/10 backdrop-blur-sm',
          'shadow-[0_0_20px_rgba(var(--color-primary),0.3)]',
          'hover:shadow-[0_0_30px_rgba(var(--color-primary),0.5)]',
          'hover:scale-110',
          'animate-pulse',
          className
        )}
      >
        <Icon className={cn(iconSizeMap[size], 'text-primary')} />
      </div>
    )
  }

  if (variant === 'gradient') {
    return (
      <div 
        className={cn(
          baseClasses,
          'bg-gradient-to-br from-primary to-primary/50',
          'shadow-lg shadow-primary/30',
          'hover:shadow-2xl hover:shadow-primary/50',
          'hover:scale-110 hover:rotate-3',
          className
        )}
      >
        <Icon className={cn(iconSizeMap[size], 'text-white')} />
      </div>
    )
  }

  return (
    <div className={cn(baseClasses, 'bg-card/50', className)}>
      <Icon className={cn(iconSizeMap[size], 'text-primary')} />
    </div>
  )
}

