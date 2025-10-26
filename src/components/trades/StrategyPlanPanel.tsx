'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, AlertCircle, Target, TrendingUp, Shield } from 'lucide-react'
import type { Strategy } from '@/types'

interface StrategyPlanPanelProps {
  strategy: Strategy | null
  onDisciplineScoreChange?: (score: number) => void
  onCheckedRulesChange?: (rules: string[]) => void
  initialDisciplineScore?: number
  initialCheckedRules?: string[]
}

export function StrategyPlanPanel({ 
  strategy, 
  onDisciplineScoreChange, 
  onCheckedRulesChange,
  initialDisciplineScore, 
  initialCheckedRules 
}: StrategyPlanPanelProps) {
  const [checkedRules, setCheckedRules] = useState<Set<string>>(new Set())

  // Calculer les règles et le score (avant le return conditionnel)
  const entryRules = strategy?.entry_rules?.split('\n').filter((r) => r.trim()) || []
  const exitRules = strategy?.exit_rules?.split('\n').filter((r) => r.trim()) || []
  const riskRules = strategy?.risk_management_rules?.split('\n').filter((r) => r.trim()) || []
  
  const totalRules = entryRules.length + exitRules.length + riskRules.length
  const checkedCount = checkedRules.size
  const allChecked = totalRules > 0 && checkedCount === totalRules

  // Initialiser les checkboxes avec les valeurs existantes ou réinitialiser
  useEffect(() => {
    if (initialCheckedRules && initialCheckedRules.length > 0) {
      // Mode édition : utiliser les règles déjà cochées
      setCheckedRules(new Set(initialCheckedRules))
    } else {
      // Mode création : réinitialiser
      setCheckedRules(new Set())
    }
  }, [strategy?.id, initialCheckedRules])

  // Initialiser le score de discipline en mode édition
  useEffect(() => {
    if (initialDisciplineScore && onDisciplineScoreChange) {
      onDisciplineScoreChange(initialDisciplineScore)
    }
  }, [initialDisciplineScore, onDisciplineScoreChange])

  // Calculer et communiquer le score de discipline
  useEffect(() => {
    if (totalRules > 0 && onDisciplineScoreChange) {
      const score = Math.round((checkedCount / totalRules) * 10)
      onDisciplineScoreChange(score)
    }
  }, [checkedRules, totalRules, checkedCount, onDisciplineScoreChange])

  // Communiquer les règles cochées
  useEffect(() => {
    if (onCheckedRulesChange) {
      onCheckedRulesChange(Array.from(checkedRules))
    }
  }, [checkedRules, onCheckedRulesChange])

  const toggleRule = (ruleId: string) => {
    setCheckedRules((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId)
      } else {
        newSet.add(ruleId)
      }
      return newSet
    })
  }

  const getRuleId = (section: string, index: number) => `${section}-${index}`

  if (!strategy) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Plan de trading
          </CardTitle>
          <CardDescription>
            Sélectionnez une stratégie pour voir le plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">
              Choisissez une stratégie dans le formulaire pour afficher ses règles
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`h-full border-2 ${allChecked ? 'border-green-500/50' : 'border-primary/20'}`}>
      <CardHeader className={allChecked ? 'bg-green-500/10' : 'bg-primary/5'}>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            {strategy.name}
          </div>
          {totalRules > 0 && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-normal ${allChecked ? 'text-green-600' : 'text-muted-foreground'}`}>
                {checkedCount}/{totalRules}
              </span>
              {allChecked && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            </div>
          )}
        </CardTitle>
        <CardDescription>
          {strategy.description || 'Cochez chaque règle avant d&apos;entrer en position'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Entry Rules */}
        {entryRules.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
              <TrendingUp className="w-4 h-4" />
              Règles d&apos;entrée
            </div>
            <div className="space-y-1">
              {entryRules.map((rule, idx) => {
                const ruleId = getRuleId('entry', idx)
                const isChecked = checkedRules.has(ruleId)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleRule(ruleId)}
                    className="flex items-start gap-2 text-sm w-full text-left p-2 rounded hover:bg-secondary/50 transition-colors"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <span className={isChecked ? 'text-foreground line-through' : 'text-muted-foreground'}>
                      {rule}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Exit Rules */}
        {exitRules.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-orange-600">
              <Target className="w-4 h-4" />
              Règles de sortie
            </div>
            <div className="space-y-1">
              {exitRules.map((rule, idx) => {
                const ruleId = getRuleId('exit', idx)
                const isChecked = checkedRules.has(ruleId)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleRule(ruleId)}
                    className="flex items-start gap-2 text-sm w-full text-left p-2 rounded hover:bg-secondary/50 transition-colors"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <span className={isChecked ? 'text-foreground line-through' : 'text-muted-foreground'}>
                      {rule}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Risk Management */}
        {riskRules.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Shield className="w-4 h-4" />
              Gestion du risque
            </div>
            <div className="space-y-1">
              {riskRules.map((rule, idx) => {
                const ruleId = getRuleId('risk', idx)
                const isChecked = checkedRules.has(ruleId)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleRule(ruleId)}
                    className="flex items-start gap-2 text-sm w-full text-left p-2 rounded hover:bg-secondary/50 transition-colors"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <span className={isChecked ? 'text-foreground line-through' : 'text-muted-foreground'}>
                      {rule}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Score de discipline */}
        {totalRules > 0 && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score de discipline</span>
              <span className="text-2xl font-bold text-primary">
                {Math.round((checkedCount / totalRules) * 10)}/10
              </span>
            </div>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${(checkedCount / totalRules) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Statistics */}
        {strategy.total_trades > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Statistiques</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Trades : </span>
                <span className="font-medium">{strategy.total_trades}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Taux : </span>
                <span className="font-medium">
                  {strategy.win_rate ? `${strategy.win_rate.toFixed(1)}%` : '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Profit moy : </span>
                <span className="font-medium profit-text">
                  {strategy.average_profit ? `${strategy.average_profit.toFixed(2)}$` : '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">PF : </span>
                <span className="font-medium">
                  {strategy.profit_factor ? strategy.profit_factor.toFixed(2) : '-'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

