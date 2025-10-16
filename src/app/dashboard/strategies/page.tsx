'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddStrategyDialog } from '@/components/strategies/AddStrategyDialog'
import { StrategyDetailsModal } from '@/components/strategies/StrategyDetailsModal'
import { useStrategies } from '@/lib/hooks/useStrategies'
import { Plus, Target, TrendingUp, Shield, Edit2, Trash2, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Strategy } from '@/types'

export default function StrategiesPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const { strategies, loading, fetchStrategies } = useStrategies()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [strategyToEdit, setStrategyToEdit] = useState<Strategy | undefined>()
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette stratégie ?')) return

    try {
      const { error } = await supabase
        .from('trading_strategies')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id as never)

      if (error) throw error

      toast.success('Stratégie supprimée')
      fetchStrategies()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleEdit = (strategy: Strategy) => {
    setSelectedStrategy(null)
    setStrategyToEdit(strategy)
    setShowAddDialog(true)
  }

  const handleCloseDialog = () => {
    setShowAddDialog(false)
    setStrategyToEdit(undefined)
  }

  const handleViewDetails = (strategy: Strategy) => {
    setSelectedStrategy(strategy)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Stratégies de trading</h1>
          <p className="text-muted-foreground">
            Gérez vos plans de trading et suivez leurs performances
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle stratégie
        </Button>
      </div>

      {/* Liste des stratégies */}
      {strategies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Aucune stratégie</h3>
            <p className="text-muted-foreground text-center mb-4">
              Créez votre première stratégie pour commencer à structurer votre trading
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une stratégie
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {strategies.map((strategy) => (
            <Card
              key={strategy.id}
              className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              style={{
                borderLeft: `4px solid ${strategy.color || '#10b981'}`,
              }}
              onClick={() => handleViewDetails(strategy)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {strategy.name}
                      {!strategy.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Inactive
                        </span>
                      )}
                    </CardTitle>
                    {strategy.description && (
                      <CardDescription className="mt-1">
                        {strategy.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(strategy)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(strategy.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Statistiques */}
                {strategy.total_trades > 0 && (
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-secondary/30">
                    <div>
                      <p className="text-xs text-muted-foreground">Trades</p>
                      <p className="text-lg font-bold">{strategy.total_trades}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Taux</p>
                      <p className="text-lg font-bold">
                        {strategy.win_rate ? `${strategy.win_rate.toFixed(1)}%` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Profit moy</p>
                      <p className="text-sm font-bold profit-text">
                        {strategy.average_profit ? `${strategy.average_profit.toFixed(2)}$` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">PF</p>
                      <p className="text-sm font-bold">
                        {strategy.profit_factor ? strategy.profit_factor.toFixed(2) : '-'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Règles */}
                <div className="space-y-2 text-sm">
                  {strategy.entry_rules && (
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-600">Entrée</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {strategy.entry_rules.split('\n')[0]}
                        </p>
                      </div>
                    </div>
                  )}

                  {strategy.exit_rules && (
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-orange-600">Sortie</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {strategy.exit_rules.split('\n')[0]}
                        </p>
                      </div>
                    </div>
                  )}

                  {strategy.risk_management_rules && (
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-blue-600">Risque</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {strategy.risk_management_rules.split('\n')[0]}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeframe */}
                {(strategy as any).timeframe && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BarChart3 className="w-3 h-3" />
                    <span>Timeframe: {(strategy as any).timeframe}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {selectedStrategy && (
        <StrategyDetailsModal
          strategy={selectedStrategy}
          onClose={() => setSelectedStrategy(null)}
          onEdit={handleEdit}
        />
      )}

      {showAddDialog && (
        <AddStrategyDialog
          onClose={handleCloseDialog}
          strategyToEdit={strategyToEdit}
          onSuccess={fetchStrategies}
        />
      )}
    </div>
  )
}

