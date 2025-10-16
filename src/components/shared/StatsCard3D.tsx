import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconWrapper } from './IconWrapper'
import { cn } from '@/lib/utils/cn'

interface StatsCard3DProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  iconVariant?: '3d' | 'glow' | 'gradient'
  className?: string
}

export function StatsCard3D({
  title,
  value,
  icon,
  description,
  trend,
  iconVariant = '3d',
  className
}: StatsCard3DProps) {
  
  const trendColors = {
    up: 'profit-text',
    down: 'loss-text',
    neutral: 'text-muted-foreground'
  }

  return (
    <Card 
      className={cn(
        'relative overflow-hidden group hover:scale-[1.02] transition-all duration-300',
        'border-2 border-border/50 hover:border-primary/50',
        className
      )}
    >
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br from-primary to-transparent" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <IconWrapper icon={icon} variant={iconVariant} size="sm" />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className={cn(
              'text-3xl font-bold',
              trend && trendColors[trend]
            )}>
              {value}
            </span>
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </CardContent>

      {/* Effet de reflet 3D */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  )
}

