'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Trash2, Eye, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Trade } from '@/types'
import { cn } from '@/lib/utils/cn'

interface TradeCardProps {
  trade: Trade
  onDetails?: (trade: Trade) => void
  onDelete?: (id: string) => void
}

export function TradeCard({ trade, onDetails, onDelete }: TradeCardProps) {
  const isProfit = (trade.net_profit ?? 0) >= 0
  const isProfitCalculated = trade.net_profit !== null && trade.net_profit !== undefined

  return (
    <Card className="group hover:scale-[1.02] transition-all duration-300 border-2 border-border/50 hover:border-primary/50 relative overflow-hidden">
      <CardContent className="p-4">
        {/* Header compact */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{trade.symbol}</h3>
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1',
                trade.trade_type === 'long'
                  ? 'trade-long-bg trade-long'
                  : 'trade-short-bg trade-short'
              )}
            >
              {trade.trade_type === 'long' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trade.trade_type === 'long' ? 'L' : 'S'}
            </span>
          </div>

          {/* Profit/Perte */}
          {isProfitCalculated && (
            <div className={cn(
              'px-3 py-1 rounded-lg font-bold text-sm',
              isProfit ? 'profit-text' : 'loss-text'
            )}>
              {isProfit ? '+' : ''}
              {trade.net_profit?.toFixed(2) ?? '0.00'} $
            </div>
          )}
        </div>

        {/* Infos essentielles */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div>
            <span className="text-muted-foreground">Taille: </span>
            <span className="font-medium">{trade.lot_size}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Entrée: </span>
            <span className="font-medium">{trade.entry_price.toFixed(5)}</span>
          </div>
        </div>

        {/* Date et stratégie */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(trade.entry_time), 'dd MMM yyyy', { locale: fr })}
          </div>
          {trade.strategy_name && (
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
              {trade.strategy_name}
            </span>
          )}
        </div>

        {/* Actions compactes */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs"
            onClick={() => onDetails?.(trade)}
          >
            <Eye className="w-3 h-3 mr-1" />
            Détails
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete?.(trade.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

