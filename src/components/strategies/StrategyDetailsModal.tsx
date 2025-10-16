'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Target, TrendingUp, Shield, Edit2, BarChart3, CheckCircle2 } from 'lucide-react'
import type { Strategy } from '@/types'

interface StrategyDetailsModalProps {
  strategy: Strategy
  onClose: () => void
  onEdit: (strategy: Strategy) => void
}

export function StrategyDetailsModal({ strategy, onClose, onEdit }: StrategyDetailsModalProps) {
  const entryRules = strategy.entry_rules?.split('\n').filter((r) => r.trim()) || []
  const exitRules = strategy.exit_rules?.split('\n').filter((r) => r.trim()) || []
  const riskRules = strategy.risk_management_rules?.split('\n').filter((r) => r.trim()) || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <CardHeader 
          className="flex flex-row items-center justify-between flex-shrink-0 border-b"
          style={{ borderLeftColor: strategy.color || '#10b981', borderLeftWidth: '4px' }}
        >
          <div className="flex-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="w-6 h-6" style={{ color: strategy.color || '#10b981' }} />
              {strategy.name}
              {!strategy.is_active && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Inactive
                </span>
              )}
            </CardTitle>
            {strategy.description && (
              <CardDescription className="mt-2">
                {strategy.description}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => onEdit(strategy)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-6 py-6">
          {/* Statistiques */}
          {strategy.total_trades > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-secondary/30">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total trades</p>
                <p className="text-2xl font-bold">{strategy.total_trades}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Taux de réussite</p>
                <p className="text-2xl font-bold">
                  {strategy.win_rate ? `${strategy.win_rate.toFixed(1)}%` : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Profit moyen</p>
                <p className="text-2xl font-bold profit-text">
                  {strategy.average_profit ? `${strategy.average_profit.toFixed(2)}$` : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Profit Factor</p>
                <p className="text-2xl font-bold">
                  {strategy.profit_factor ? strategy.profit_factor.toFixed(2) : '-'}
                </p>
              </div>
            </div>
          )}

          {/* Timeframe */}
          {strategy.timeframe && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
              <BarChart3 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Timeframe</p>
                <p className="font-semibold">{strategy.timeframe}</p>
              </div>
            </div>
          )}

          {/* Règles d'entrée */}
          {entryRules.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-green-600 text-lg">
                <TrendingUp className="w-5 h-5" />
                Règles d&apos;entrée
              </h3>
              <div className="space-y-2">
                {entryRules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Règles de sortie */}
          {exitRules.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-orange-600 text-lg">
                <Target className="w-5 h-5" />
                Règles de sortie
              </h3>
              <div className="space-y-2">
                {exitRules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gestion du risque */}
          {riskRules.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-blue-600 text-lg">
                <Shield className="w-5 h-5" />
                Gestion du risque
              </h3>
              <div className="space-y-2">
                {riskRules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={() => onEdit(strategy)} className="flex-1">
              <Edit2 className="w-4 h-4 mr-2" />
              Éditer la stratégie
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

