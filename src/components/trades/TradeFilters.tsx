'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, X, Grid3X3, List, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface TradeFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  symbolFilter: string
  onSymbolFilterChange: (value: string) => void
  strategyFilter: string
  onStrategyFilterChange: (value: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  sortBy: string
  onSortChange: (value: string) => void
  symbols: string[]
  strategies: string[]
  onResetFilters: () => void
}

export function TradeFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  symbolFilter,
  onSymbolFilterChange,
  strategyFilter,
  onStrategyFilterChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  symbols,
  strategies,
  onResetFilters,
}: TradeFiltersProps) {
  const hasActiveFilters =
    searchTerm || statusFilter !== 'all' || symbolFilter !== 'all' || strategyFilter !== 'all'

  return (
    <div className="space-y-4">
      {/* Recherche et vue */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un symbole, une note..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Boutons de vue */}
        <div className="flex gap-2 p-1 rounded-xl bg-secondary/30 self-start">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-2 rounded-lg transition-all',
              viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Vue grille"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-2 rounded-lg transition-all',
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Vue liste"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtres :</span>
        </div>

        {/* Tri */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-9 w-full rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur-sm px-3 text-sm focus:border-primary focus:outline-none transition-all sm:w-auto"
        >
          <option value="date-desc">📅 Plus récents</option>
          <option value="date-asc">📅 Plus anciens</option>
          <option value="profit-desc">💰 Plus profitables</option>
          <option value="profit-asc">💰 Moins profitables</option>
          <option value="symbol-asc">🔤 Symbole A-Z</option>
          <option value="symbol-desc">🔤 Symbole Z-A</option>
        </select>

        {/* Statut */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="h-9 w-full rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur-sm px-3 text-sm focus:border-primary focus:outline-none transition-all sm:w-auto"
        >
          <option value="all">Tous les statuts</option>
          <option value="open">Ouverts</option>
          <option value="closed">Fermés</option>
          <option value="cancelled">Annulés</option>
        </select>

        {/* Symbole */}
        <select
          value={symbolFilter}
          onChange={(e) => onSymbolFilterChange(e.target.value)}
          className="h-9 w-full rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur-sm px-3 text-sm focus:border-primary focus:outline-none transition-all sm:w-auto"
        >
          <option value="all">Tous les symboles</option>
          {symbols.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>

        {/* Stratégie */}
        <select
          value={strategyFilter}
          onChange={(e) => onStrategyFilterChange(e.target.value)}
          className="h-9 w-full rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur-sm px-3 text-sm focus:border-primary focus:outline-none transition-all sm:w-auto"
        >
          <option value="all">Toutes les stratégies</option>
          {strategies.map((strategy) => (
            <option key={strategy} value={strategy}>
              {strategy}
            </option>
          ))}
        </select>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="gap-2 w-full sm:w-auto"
          >
            <X className="w-3 h-3" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Compteur de résultats */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          <Filter className="w-3 h-3 inline mr-1" />
          Filtres actifs
        </div>
      )}
    </div>
  )
}

