'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AddTradeDialog } from '@/components/trades/AddTradeDialog'
import { TradeCard } from '@/components/trades/TradeCard'
import { TradeFilters } from '@/components/trades/TradeFilters'
import { TradeDetailsModal } from '@/components/trades/TradeDetailsModal'
import { TradePagination } from '@/components/trades/TradePagination'
import { useTrades } from '@/lib/hooks/useTrades'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { useTradeStats } from '@/lib/hooks/useTradeStats'
import { StatsCard3D } from '@/components/shared/StatsCard3D'
import { AnimatedIcon, TradingIcons } from '@/components/shared/AnimatedIcon'
import { Plus, TrendingUp, Target, DollarSign, BarChart3, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { Trade } from '@/types'
import { VoiceRecordingOnboardingDialog } from '@/components/trades/VoiceRecordingOnboardingDialog'

export default function TradesPage() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [tradeToDuplicate, setTradeToDuplicate] = useState<Trade | null>(null)
  const [showVoiceOnboarding, setShowVoiceOnboarding] = useState(true)
  const { accounts } = useAccounts()
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const { trades, loading, deleteTrade, fetchTrades } = useTrades(selectedAccountId || undefined)
  
  // États des filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [symbolFilter, setSymbolFilter] = useState('all')
  const [strategyFilter, setStrategyFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('date-desc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Extraire les symboles et stratégies uniques
  const symbols = useMemo(() => {
    return Array.from(new Set(trades.map((t) => t.symbol))).sort()
  }, [trades])

  const strategies = useMemo(() => {
    return Array.from(new Set(trades.map((t) => t.strategy_name).filter(Boolean) as string[])).sort()
  }, [trades])

  // Filtrer et trier les trades
  const filteredAndSortedTrades = useMemo(() => {
    let result = trades.filter((trade) => {
      // Recherche
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        if (
          !trade.symbol.toLowerCase().includes(search) &&
          !trade.notes?.toLowerCase().includes(search) &&
          !trade.strategy_name?.toLowerCase().includes(search)
        ) {
          return false
        }
      }

      // Filtre statut
      if (statusFilter !== 'all' && trade.status !== statusFilter) {
        return false
      }

      // Filtre symbole
      if (symbolFilter !== 'all' && trade.symbol !== symbolFilter) {
        return false
      }

      // Filtre stratégie
      if (strategyFilter !== 'all' && trade.strategy_name !== strategyFilter) {
        return false
      }

      return true
    })

    // Tri
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
        case 'date-asc':
          return new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
        case 'profit-desc':
          return (b.net_profit ?? 0) - (a.net_profit ?? 0)
        case 'profit-asc':
          return (a.net_profit ?? 0) - (b.net_profit ?? 0)
        case 'symbol-asc':
          return a.symbol.localeCompare(b.symbol)
        case 'symbol-desc':
          return b.symbol.localeCompare(a.symbol)
        default:
          return 0
      }
    })

    return result
  }, [trades, searchTerm, statusFilter, symbolFilter, strategyFilter, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTrades.length / itemsPerPage)
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredAndSortedTrades.slice(start, end)
  }, [filteredAndSortedTrades, currentPage, itemsPerPage])

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, symbolFilter, strategyFilter])

  const stats = useTradeStats(filteredAndSortedTrades)

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setSymbolFilter('all')
    setStrategyFilter('all')
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce trade ?')) {
      const { error } = await deleteTrade(id)
      if (error) {
        toast.error('Erreur lors de la suppression')
      } else {
        toast.success('Trade supprimé avec succès')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-muted-foreground">Chargement des trades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AnimatedIcon icon={TradingIcons.chartUp} size={36} />
            Mes trades
          </h1>
          <p className="text-muted-foreground">
            Gérez et analysez tous vos trades avec filtres avancés
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {accounts.length > 0 && (
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm sm:w-auto"
              title="Filtrer par compte"
            >
              <option value="">Tous les comptes</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_name} {a.broker ? `(${a.broker})` : ''}
                </option>
              ))}
            </select>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={fetchTrades} variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Ajouter un trade
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Summary avec effets 3D */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard3D
          title="Total trades"
          value={filteredAndSortedTrades.length}
          icon={BarChart3}
          description={`${trades.length} au total`}
          iconVariant="gradient"
        />
        <StatsCard3D
          title="Taux de réussite"
          value={`${stats.winRate.toFixed(1)}%`}
          icon={Target}
          description={`${stats.winningTrades} gagnants`}
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
          value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
          icon={TrendingUp}
          description="Ratio gains/pertes"
          trend={stats.profitFactor >= 1 ? 'up' : 'down'}
          iconVariant="3d"
        />
      </div>

      {/* Filtres et tri */}
      <TradeFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        symbolFilter={symbolFilter}
        onSymbolFilterChange={setSymbolFilter}
        strategyFilter={strategyFilter}
        onStrategyFilterChange={setStrategyFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        symbols={symbols}
        strategies={strategies}
        onResetFilters={resetFilters}
      />

      {/* Liste des trades */}
      {filteredAndSortedTrades.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <AnimatedIcon icon={TradingIcons.gem} size={64} />
            <p className="text-muted-foreground mt-4 mb-2 font-medium">
              {trades.length === 0 
                ? 'Aucun trade enregistré pour le moment'
                : 'Aucun trade ne correspond à vos filtres'
              }
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {trades.length === 0
                ? 'Commencez par ajouter votre premier trade !'
                : 'Essayez de modifier vos critères de recherche'
              }
            </p>
            {trades.length === 0 ? (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter votre premier trade
              </Button>
            ) : (
              <Button onClick={resetFilters} variant="outline">
                Réinitialiser les filtres
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Vue grille */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {paginatedTrades.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  onDetails={setSelectedTrade}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
        /* Vue liste */
        <div className="grid gap-3 sm:grid-cols-2">
              {paginatedTrades.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  onDetails={setSelectedTrade}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <TradePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedTrades.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(items) => {
                setItemsPerPage(items)
                setCurrentPage(1)
              }}
            />
          )}
        </>
      )}

      {/* Modals */}
      {selectedTrade && !showAddDialog && (
        <TradeDetailsModal
          trade={trades.find(t => t.id === selectedTrade.id) || selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onEdit={(t) => {
            setShowAddDialog(true)
            setSelectedTrade(t)
          }}
          onDuplicate={(t) => {
            setTradeToDuplicate(t)
            setSelectedTrade(null)
            setShowAddDialog(true)
          }}
        />
      )}

      {showAddDialog && (
        <AddTradeDialog
          onClose={() => {
            setShowAddDialog(false)
            setSelectedTrade(null)
            setTradeToDuplicate(null)
            // Rafraîchir les trades après modification
            fetchTrades()
          }}
          tradeToEdit={selectedTrade || undefined}
          tradeToDuplicate={tradeToDuplicate || undefined}
        />
      )}

      {/* Popup d'onboarding pour les enregistrements vocaux */}
      {showVoiceOnboarding && (
        <VoiceRecordingOnboardingDialog
          onPreferenceSet={(enabled) => {
            setShowVoiceOnboarding(false)
            if (enabled) {
              toast.success('Enregistrements vocaux activés !')
            }
          }}
        />
      )}
    </div>
  )
}

