'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedIcon, TradingIcons } from '@/components/shared/AnimatedIcon'
import { Plus, Target, CheckCircle2, Clock, DollarSign, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface TradingPlan {
  id: string
  title: string
  description?: string
  max_trades_per_day?: number
  max_risk_per_trade?: number
  max_daily_loss?: number
  daily_target?: number
  weekly_target?: number
  monthly_target?: number
  pre_trade_checklist?: string[]
  psychological_rules?: string[]
  is_active: boolean
}

interface Goal {
  id: string
  title: string
  goal_type: string
  period: string
  target_value: number
  current_value: number
  unit: string
  status: string
}

export default function PlanPage() {
  const [plans, setPlans] = useState<TradingPlan[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [plansResult, goalsResult] = await Promise.all([
        supabase
          .from('trading_plans')
          .select('*')
          .eq('user_id', user?.id || '')
          .order('created_at', { ascending: false }),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user?.id || '')
          .eq('status', 'active')
          .order('end_date', { ascending: true }),
      ])

      if (plansResult.data) setPlans(plansResult.data as TradingPlan[])
      if (goalsResult.data) setGoals(goalsResult.data as Goal[])
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  const activePlan = plans.find((p) => p.is_active)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
            <AnimatedIcon icon={TradingIcons.target} size={28} className="sm:w-9 sm:h-9" />
            Plan de trading
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Définissez vos règles et objectifs de trading
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Nouveau plan
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan actif */}
        <div className="lg:col-span-2">
          {activePlan ? (
            <Card className="border-2 border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      {activePlan.title}
                    </CardTitle>
                    <CardDescription>{activePlan.description}</CardDescription>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    Actif
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Risque max/trade</p>
                    <p className="text-2xl font-bold text-primary">
                      {activePlan.max_risk_per_trade}%
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Perte max quotidienne</p>
                    <p className="text-2xl font-bold text-red-500">
                      {activePlan.max_daily_loss} $
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Objectif mensuel</p>
                    <p className="text-2xl font-bold text-green-500">
                      +{activePlan.monthly_target} $
                    </p>
                  </div>
                </div>

                {activePlan.pre_trade_checklist && activePlan.pre_trade_checklist.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium mb-3">Checklist pré-trade</p>
                    <div className="space-y-2">
                      {activePlan.pre_trade_checklist.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30"
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activePlan.psychological_rules && activePlan.psychological_rules.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-medium mb-3">Règles psychologiques</p>
                    <div className="space-y-2">
                      {activePlan.psychological_rules.map((rule, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/5 border border-orange-500/20"
                        >
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <AnimatedIcon icon={TradingIcons.target} size={64} />
                <p className="text-muted-foreground mt-4 mb-2 font-medium">
                  Aucun plan de trading actif
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Créez votre plan pour définir vos règles et objectifs
                </p>
                <Button>
                  <Plus className="mr-2 w-4 h-4" />
                  Créer mon plan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Objectifs actifs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Objectifs actifs
              </CardTitle>
              <CardDescription>Suivez votre progression vers vos objectifs</CardDescription>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucun objectif actif</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal) => {
                    const progress = (goal.current_value / goal.target_value) * 100

                    return (
                      <div
                        key={goal.id}
                        className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{goal.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Période : {goal.period}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {goal.current_value.toFixed(0)} / {goal.target_value.toFixed(0)}{' '}
                            {goal.unit}
                          </span>
                        </div>

                        {/* Barre de progression */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progression</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                progress >= 100
                                  ? 'bg-green-500'
                                  : progress >= 75
                                  ? 'bg-primary'
                                  : progress >= 50
                                  ? 'bg-blue-500'
                                  : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

