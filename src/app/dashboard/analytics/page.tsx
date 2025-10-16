'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTrades } from '@/lib/hooks/useTrades'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { useTradeStats } from '@/lib/hooks/useTradeStats'
import { EquityCurve } from '@/components/analytics/EquityCurve'
import { ProfitDistribution } from '@/components/analytics/ProfitDistribution'
import { PerformanceBySymbol } from '@/components/analytics/PerformanceBySymbol'
import { PerformanceByStrategy } from '@/components/analytics/PerformanceByStrategy'
import { TradingHeatmap } from '@/components/analytics/TradingHeatmap'
import { EmotionAnalysis } from '@/components/analytics/EmotionAnalysis'
import { WinRateOverTime } from '@/components/analytics/WinRateOverTime'
import { RiskRewardAnalysis } from '@/components/analytics/RiskRewardAnalysis'
import { AccountComparison } from '@/components/analytics/AccountComparison'
// import { DataDebugger } from '@/components/analytics/DataDebugger'
// import { TotalGainsChecker } from '@/components/analytics/TotalGainsChecker'
import { PerformanceByDay } from '@/components/analytics/PerformanceByDay'
import { TimePeriodFilter, type TimePeriod } from '@/components/analytics/TimePeriodFilter'
import { filterTradesByTimePeriod } from '@/lib/utils/timeFilters'
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  BarChart3,
  Calendar,
  Award,
  AlertTriangle,
} from 'lucide-react'

export default function AnalyticsPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')
  const { trades: allTrades, loading } = useTrades()
  const { accounts } = useAccounts()
  
  // Filtrer les trades par compte et période
  const accountFilteredTrades = selectedAccountId 
    ? allTrades.filter((t) => (t as unknown as { account_id?: string }).account_id === selectedAccountId)
    : allTrades

  const trades = timePeriod ? filterTradesByTimePeriod(accountFilteredTrades, timePeriod) : accountFilteredTrades

  // Debug: afficher le nombre de trades filtrés
  console.log('Analytics Debug:', {
    allTrades: allTrades.length,
    accountFilteredTrades: accountFilteredTrades.length,
    timePeriodFilteredTrades: trades.length,
    selectedAccountId,
    timePeriod,
    trades: trades.slice(0, 3).map(t => ({
      id: t.id,
      symbol: t.symbol,
      net_profit: t.net_profit,
      status: t.status,
      account_id: (t as unknown as { account_id?: string }).account_id
    }))
  })
    
  const stats = useTradeStats(trades)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-muted-foreground">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Account Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analyses et statistiques</h1>
          <p className="text-muted-foreground">
            Analysez vos performances de trading en détail
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Time Period Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">
              Période :
            </label>
            <TimePeriodFilter 
              selectedPeriod={timePeriod} 
              onPeriodChange={setTimePeriod}
            />
          </div>
          
          {/* Account Filter */}
          {accounts.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="account-filter" className="text-sm font-medium whitespace-nowrap">
                Compte :
              </label>
              <select
                id="account-filter"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm min-w-[200px]"
              >
                <option value="">Tous les comptes</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_name} {account.broker ? `(${account.broker})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Debug des données */}
      {/* <DataDebugger trades={trades} title="Debug des données - Vérification des incohérences" /> */}
      
      {/* Vérification spécifique du total des gains */}
      {/* <TotalGainsChecker trades={trades} /> */}

      {/* Account Comparison - Show at top when viewing all accounts */}
      {!selectedAccountId && accounts.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparaison des comptes</CardTitle>
            <CardDescription>
              Performance de chaque compte de trading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountComparison trades={allTrades} accounts={accounts} />
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total des trades"
          value={stats.totalTrades.toString()}
          icon={<BarChart3 className="h-4 w-4" />}
          description={`${stats.winningTrades} gagnants / ${stats.losingTrades} perdants`}
        />
        <StatCard
          title="Taux de réussite"
          value={`${stats.winRate.toFixed(1)}%`}
          icon={<Target className="h-4 w-4" />}
          description={stats.winRate >= 50 ? 'Au-dessus de 50%' : 'En-dessous de 50%'}
          positive={stats.winRate >= 50}
        />
        <StatCard
          title="Profit net"
          value={`${stats.netProfit >= 0 ? '+' : ''}${stats.netProfit.toFixed(2)} $`}
          icon={<DollarSign className="h-4 w-4" />}
          description="Total des gains - pertes"
          positive={stats.netProfit >= 0}
        />
        <StatCard
          title="Profit Factor"
          value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Ratio gains/pertes"
          positive={stats.profitFactor >= 1}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Courbe de capital</CardTitle>
            <CardDescription>
              Évolution de votre capital dans le temps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EquityCurve trades={trades} timePeriod={timePeriod} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution des gains/pertes</CardTitle>
            <CardDescription>
              Répartition de vos trades gagnants et perdants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfitDistribution trades={trades} timePeriod={timePeriod} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Meilleur trade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              +{stats.largestWin.toFixed(2)} $
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Plus gros gain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Pire trade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {stats.largestLoss.toFixed(2)} $
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Plus grosse perte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              Drawdown max
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {stats.maxDrawdown.toFixed(2)} $
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Perte maximale depuis le pic
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gain moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              +{stats.averageWin.toFixed(2)} $
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Par trade gagnant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perte moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              -{stats.averageLoss.toFixed(2)} $
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Par trade perdant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Durée moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(stats.averageTradeDuration / 60).toFixed(1)}h
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Temps de détention moyen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Day */}
      <Card>
        <CardHeader>
          <CardTitle>Performance quotidienne</CardTitle>
          <CardDescription>
            Analyse de vos performances par jour de la semaine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceByDay trades={trades} timePeriod={timePeriod} />
        </CardContent>
      </Card>


      {/* Performance by Symbol */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par symbole</CardTitle>
          <CardDescription>
            Top 10 des symboles les plus rentables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceBySymbol trades={trades} timePeriod={timePeriod} />
        </CardContent>
      </Card>

      {/* Performance by Strategy and WinRate Over Time */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance par stratégie</CardTitle>
            <CardDescription>
              Répartition des profits par stratégie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceByStrategy trades={trades} timePeriod={timePeriod} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution du taux de réussite</CardTitle>
            <CardDescription>
              Taux de réussite sur fenêtre glissante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WinRateOverTime trades={trades} timePeriod={timePeriod} />
          </CardContent>
        </Card>
      </div>

      {/* Trading Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Heatmap des sessions de trading</CardTitle>
          <CardDescription>
            Performance moyenne par jour et heure (profit moyen par trade)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TradingHeatmap trades={trades} timePeriod={timePeriod} />
        </CardContent>
      </Card>

      {/* Emotion Analysis and Risk/Reward */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Analyse des émotions</CardTitle>
            <CardDescription>
              Impact de vos émotions sur vos performances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmotionAnalysis trades={trades} timePeriod={timePeriod} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analyse Risque/Récompense</CardTitle>
            <CardDescription>
              Distribution des ratios R:R de vos trades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskRewardAnalysis trades={trades} timePeriod={timePeriod} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  description: string
  positive?: boolean
}

function StatCard({ title, value, icon, description, positive }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={`text-xs mt-1 ${
            positive !== undefined
              ? positive
                ? 'text-green-600'
                : 'text-red-600'
              : 'text-muted-foreground'
          }`}
        >
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

