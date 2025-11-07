'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Trash2, Eye, Calendar, FileAudio, Image as ImageIcon } from 'lucide-react'
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

  // Fonction pour formater les prix avec gestion des valeurs non définies
  const formatPrice = (price: number | null | undefined) => {
    if (!price || price === 0) {
      return 'Non défini'
    }
    return price.toFixed(5)
  }

  // Compter les médias (gérer les valeurs null)
  const mediaCount = (trade.voice_notes?.length || 0) + (trade.analysis_photos?.length || 0) + (trade.screenshots?.length || 0)

  return (
    <Card className="group hover:scale-[1.02] transition-all duration-300 border-2 border-border/50 hover:border-primary/50 relative overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header compact */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-xl font-bold truncate">{trade.symbol}</h3>
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
            <div
              className={cn(
                'px-3 py-1 rounded-lg font-bold text-sm sm:self-end',
                isProfit ? 'profit-text' : 'loss-text'
              )}
            >
              {isProfit ? '+' : ''}
              {trade.net_profit?.toFixed(2) ?? '0.00'} $
            </div>
          )}
        </div>

        {/* Infos essentielles */}
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Taille: </span>
            <span className="font-medium">{trade.lot_size}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Entrée: </span>
            <span className="font-medium">{formatPrice(trade.entry_price)}</span>
          </div>
        </div>

        {/* Date, stratégie et médias */}
        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(trade.entry_time), 'dd MMM yyyy', { locale: fr })}
          </div>
          <div className="flex items-center gap-2">
            {/* Indicateur de médias */}
            {mediaCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                {trade.voice_notes && trade.voice_notes.length > 0 && (
                  <FileAudio className="w-3 h-3" />
                )}
                {((trade.analysis_photos && trade.analysis_photos.length > 0) || (trade.screenshots && trade.screenshots.length > 0)) && (
                  <ImageIcon className="w-3 h-3" />
                )}
                <span className="text-xs">{mediaCount}</span>
              </div>
            )}
          {trade.strategy_name && (
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
              {trade.strategy_name}
            </span>
          )}
          </div>
        </div>

        {/* Actions compactes */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            size="sm"
            variant="outline"
            className="h-9 text-xs sm:flex-1"
            onClick={() => onDetails?.(trade)}
          >
            <Eye className="w-3 h-3 mr-1" />
            Détails
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="flex h-9 w-full items-center justify-center p-0 hover:bg-destructive/10 hover:text-destructive sm:w-9"
            onClick={() => onDelete?.(trade.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

