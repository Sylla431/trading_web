'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, TrendingUp, TrendingDown, Calendar, Target, Brain } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Trade } from '@/types'
import { cn } from '@/lib/utils/cn'
import { translateEmotionBefore, translateEmotionAfter } from '@/lib/utils/emotionTranslations'

interface TradeDetailsModalProps {
  trade: Trade
  onClose: () => void
  onEdit?: (trade: Trade) => void
  onDuplicate?: (trade: Trade) => void
}

export function TradeDetailsModal({ trade, onClose, onEdit, onDuplicate }: TradeDetailsModalProps) {
  const isProfit = (trade.net_profit ?? 0) >= 0
  const isProfitCalculated = trade.net_profit !== null && trade.net_profit !== undefined

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-primary/50">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-3 rounded-xl',
                trade.trade_type === 'long'
                  ? 'trade-long-bg trade-long'
                  : 'trade-short-bg trade-short'
              )}
            >
              {trade.trade_type === 'long' ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
            </div>
            <div>
              <CardTitle className="text-2xl">{trade.symbol}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {trade.trade_type === 'long' ? 'Position Long' : 'Position Short'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Profit/Perte grand */}
          {isProfitCalculated && (
            <div
              className={cn(
                'p-6 rounded-2xl text-center',
                isProfit
                  ? 'profit-bg border-2 profit-border'
                  : 'loss-bg border-2 loss-border'
              )}
            >
              <p className="text-sm text-muted-foreground mb-2">Résultat du trade</p>
              <p
                className={cn(
                  'text-4xl font-bold',
                  isProfit ? 'profit-text' : 'loss-text'
                )}
              >
                {isProfit ? '+' : ''}
                {trade.net_profit?.toFixed(2) ?? '0.00'} $
              </p>
              {trade.pips && (
                <p className="text-sm text-muted-foreground mt-2">
                  {trade.pips > 0 ? '+' : ''}
                  {trade.pips.toFixed(1)} pips
                </p>
              )}
            </div>
          )}

          {/* Prix et taille */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">Taille</p>
              <p className="text-lg font-bold">{trade.lot_size}</p>
              <p className="text-xs text-muted-foreground">lots</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">Entrée</p>
              <p className="text-lg font-bold">{trade.entry_price.toFixed(5)}</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">Sortie</p>
              <p className="text-lg font-bold">
                {trade.exit_price ? trade.exit_price.toFixed(5) : '-'}
              </p>
            </div>
          </div>

          {/* SL/TP */}
          {(trade.stop_loss || trade.take_profit) && (
            <div className="grid grid-cols-2 gap-4">
              {trade.stop_loss && (
                <div className="p-4 rounded-xl loss-bg border loss-border">
                  <p className="text-xs loss-text mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Stop Loss
                  </p>
                  <p className="text-xl font-bold">{trade.stop_loss.toFixed(5)}</p>
                </div>
              )}
              {trade.take_profit && (
                <div className="p-4 rounded-xl profit-bg border profit-border">
                  <p className="text-xs profit-text mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Take Profit
                  </p>
                  <p className="text-xl font-bold">{trade.take_profit.toFixed(5)}</p>
                </div>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="p-4 rounded-xl bg-secondary/30 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium">Dates du trade</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ouverture</p>
                <p className="font-medium">
                  {format(new Date(trade.entry_time), 'dd MMM yyyy', { locale: fr })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(trade.entry_time), 'HH:mm', { locale: fr })}
                </p>
              </div>
              {trade.exit_time && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Fermeture</p>
                  <p className="font-medium">
                    {format(new Date(trade.exit_time), 'dd MMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(trade.exit_time), 'HH:mm', { locale: fr })}
                  </p>
                </div>
              )}
            </div>
            {trade.duration_minutes && (
              <p className="text-xs text-muted-foreground">
                Durée : {(trade.duration_minutes / 60).toFixed(1)} heures
              </p>
            )}
          </div>

          {/* Stratégie et émotions */}
          {(trade.strategy_name || trade.emotion_before || trade.emotion_after) && (
            <div className="space-y-3">
              {trade.strategy_name && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs text-primary mb-1 font-medium">Stratégie</p>
                  <p className="text-sm font-semibold">{trade.strategy_name}</p>
                </div>
              )}

              {(trade.emotion_before || trade.emotion_after) && (
                <div className="grid grid-cols-2 gap-3">
                  {trade.emotion_before && (
                    <div className="p-3 rounded-xl bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">Émotion avant</p>
                      <p className="text-sm font-medium">{translateEmotionBefore(trade.emotion_before)}</p>
                    </div>
                  )}
                  {trade.emotion_after && (
                    <div className="p-3 rounded-xl bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">Émotion après</p>
                      <p className="text-sm font-medium">{translateEmotionAfter(trade.emotion_after)}</p>
                    </div>
                  )}
                </div>
              )}

              {trade.discipline_score && (
                <div className="p-3 rounded-xl bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Score de discipline</p>
                    <p className="text-lg font-bold text-primary">{trade.discipline_score}/10</p>
                  </div>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${trade.discipline_score * 10}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {trade.notes && (
            <div className="p-4 rounded-xl bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Notes
              </p>
              <p className="text-sm">{trade.notes}</p>
            </div>
          )}

          {/* Leçon apprise */}
          {trade.lesson_learned && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-primary mb-2 font-medium">💡 Leçon apprise</p>
              <p className="text-sm">{trade.lesson_learned}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <Button variant="outline" className="flex-1" onClick={() => onEdit?.(trade)}>
              Éditer le trade
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => onDuplicate?.(trade)}>
              Dupliquer
            </Button>
            <Button onClick={onClose} className="flex-1">
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
