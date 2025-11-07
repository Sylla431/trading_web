'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, RefreshCw } from 'lucide-react'
import { StatsCard3D } from '@/components/shared/StatsCard3D'
import { AnimatedIcon, TradingIcons } from '@/components/shared/AnimatedIcon'
import { useTrades } from '@/lib/hooks/useTrades'
import { useTradeStats } from '@/lib/hooks/useTradeStats'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function DashboardPage() {
  const { trades, loading, fetchTrades } = useTrades()
  const stats = useTradeStats(trades)
  
  // Trades récents (5 derniers)
  const recentTrades = trades.slice(0, 5)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre journal de trading
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchTrades}
          className="gap-2 w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards avec effets 3D */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard3D
          title="Trades totaux"
          value={stats.totalTrades}
          icon={BarChart3}
          description="Total de trades enregistrés"
          iconVariant="gradient"
        />
        <StatsCard3D
          title="Taux de réussite"
          value={`${stats.winRate.toFixed(1)}%`}
          icon={Target}
          description="Pourcentage de trades gagnants"
          trend={stats.winRate >= 50 ? 'up' : 'down'}
          iconVariant="3d"
        />
        <StatsCard3D
          title="Profit net"
          value={`${stats.netProfit >= 0 ? '+' : ''}${stats.netProfit.toFixed(2)} $`}
          icon={DollarSign}
          description="Profit/Perte total"
          trend={stats.netProfit >= 0 ? 'up' : 'down'}
          iconVariant="glow"
        />
        <StatsCard3D
          title="Profit Factor"
          value={stats.profitFactor.toFixed(2)}
          icon={TrendingUp}
          description="Ratio gains/pertes"
          trend={stats.profitFactor >= 1 ? 'up' : 'down'}
          iconVariant="3d"
        />
      </div>

      {/* Quick Actions avec icônes animées */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer hover:scale-[1.02] border-2 border-border/50 hover:border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AnimatedIcon icon={TradingIcons.chartUp} size={24} />
              Ajouter un trade
            </CardTitle>
            <CardDescription>
              Enregistrez votre dernier trade manuellement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 group-hover:bg-primary/10 transition-colors">
              <div className="group-hover:animate-bounce">
                <TrendingUp className="h-10 w-10 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer hover:scale-[1.02] border-2 border-border/50 hover:border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AnimatedIcon icon={TradingIcons.rocket} size={24} />
              Importer des trades
            </CardTitle>
            <CardDescription>
              Importez vos trades depuis MT4/MT5 ou CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 group-hover:bg-primary/10 transition-colors">
              <div className="group-hover:animate-pulse">
                <BarChart3 className="h-10 w-10 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card className="border-2 border-border/50">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AnimatedIcon icon={TradingIcons.notebook} size={24} />
              Trades récents
            </CardTitle>
            <CardDescription>
              Vos 5 derniers trades
            </CardDescription>
          </div>
          <Link href="/dashboard/trades">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Voir tout
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTrades.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-3">
              <div className="flex justify-center">
                <AnimatedIcon icon={TradingIcons.gem} size={48} />
              </div>
              <p className="font-medium">Aucun trade enregistré pour le moment</p>
              <p className="text-sm">Commencez par ajouter votre premier trade !</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex flex-col gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`p-2 rounded-lg ${
                      trade.trade_type === 'long' 
                        ? 'trade-long-bg trade-long' 
                        : 'trade-short-bg trade-short'
                    }`}>
                      {trade.trade_type === 'long' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{trade.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(trade.entry_time), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {trade.net_profit !== null && trade.net_profit !== undefined ? (
                      <p className={`font-bold ${
                        trade.net_profit >= 0 ? 'profit-text' : 'loss-text'
                      }`}>
                        {trade.net_profit >= 0 ? '+' : ''}{trade.net_profit.toFixed(2)} $
                      </p>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
                        En cours
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {trade.strategy_name || 'Sans stratégie'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

