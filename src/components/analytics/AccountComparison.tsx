'use client'

import { useMemo } from 'react'
import type { Trade, TradingAccount } from '@/types'

interface AccountComparisonProps {
  trades: Trade[]
  accounts: TradingAccount[]
}

export function AccountComparison({ trades, accounts }: AccountComparisonProps) {
  const data = useMemo(() => {
    const accountStats = new Map<
      string,
      { 
        wins: number
        losses: number
        totalProfit: number
        count: number
        accountName: string
      }
    >()

    // Initialiser avec tous les comptes
    accounts.forEach((account) => {
      accountStats.set(account.id, {
        wins: 0,
        losses: 0,
        totalProfit: 0,
        count: 0,
        accountName: account.account_name,
      })
    })

    // Agréger les trades par compte
    trades
      .filter((t) => t.status === 'closed' && t.net_profit !== undefined && t.net_profit !== null)
      .forEach((trade) => {
        const accountId = (trade as unknown as { account_id?: string }).account_id
        if (!accountId) return

        const existing = accountStats.get(accountId)
        if (!existing) return

        const profit = trade.net_profit ?? 0
        accountStats.set(accountId, {
          ...existing,
          wins: existing.wins + (profit > 0 ? 1 : 0),
          losses: existing.losses + (profit <= 0 ? 1 : 0),
          totalProfit: existing.totalProfit + profit,
          count: existing.count + 1,
        })
      })

    return Array.from(accountStats.entries())
      .map(([id, stats]) => ({
        id,
        name: stats.accountName,
        profit: Number(stats.totalProfit.toFixed(2)),
        winRate: stats.count > 0 ? ((stats.wins / stats.count) * 100).toFixed(1) : '0',
        trades: stats.count,
        wins: stats.wins,
        losses: stats.losses,
      }))
      .filter((a) => a.trades > 0) // Afficher seulement les comptes avec des trades
      .sort((a, b) => b.profit - a.profit)
  }, [trades, accounts])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Aucun compte avec des trades
      </div>
    )
  }

  // Calculer les valeurs min et max pour la normalisation
  const maxProfit = Math.max(...data.map(d => d.profit))
  const minProfit = Math.min(...data.map(d => d.profit))
  const profitRange = maxProfit - minProfit

  // Debug: afficher les valeurs de normalisation
  console.log('AccountComparison Debug:', {
    data: data.map(d => ({ name: d.name, profit: d.profit })),
    maxProfit,
    minProfit,
    profitRange
  })

  return (
    <div className="space-y-6">
      {/* Progress Indicators */}
      <div className="space-y-4">
        {data.map((account, index) => {
          // Normaliser le profit entre 0 et 100 pour la barre de progression
          let normalizedProfit = 0
          if (profitRange > 0) {
            normalizedProfit = ((account.profit - minProfit) / profitRange) * 100
          } else {
            // Si tous les profits sont identiques, donner une largeur minimale
            normalizedProfit = account.profit >= 0 ? 80 : 20
          }
          
          // S'assurer que la largeur est au minimum 5% pour la visibilité
          const barWidth = Math.max(5, Math.abs(normalizedProfit))
          
          // Couleur basée sur la performance relative
          const isPositive = account.profit >= 0
          const isTopPerformer = index === 0
          
          return (
            <div key={account.id} className="space-y-2">
              {/* Header du compte */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isTopPerformer && (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  )}
                  <span className="font-semibold text-sm">{account.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {account.profit >= 0 ? '+' : ''}{account.profit.toFixed(2)} $
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {account.trades} trades • {account.winRate}% réussite
                </div>
              </div>

              {/* Barre de progression */}
              <div className="relative">
                <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      isPositive 
                        ? isTopPerformer 
                          ? 'bg-gradient-to-r from-green-500 to-green-400' 
                          : 'bg-gradient-to-r from-green-600 to-green-500'
                        : 'bg-gradient-to-r from-red-500 to-red-400'
                    }`}
                    style={{ 
                      width: `${barWidth}%`,
                      transform: isPositive ? 'translateX(0)' : 'translateX(100%)',
                      transformOrigin: isPositive ? 'left' : 'right'
                    }}
                  />
                </div>
                
                {/* Ligne de référence à zéro */}
                {minProfit < 0 && maxProfit > 0 && (
                  <div 
                    className="absolute top-0 w-px h-3 bg-border/50"
                    style={{ 
                      left: `${(Math.abs(minProfit) / profitRange) * 100}%` 
                    }}
                  />
                )}
              </div>

              {/* Stats détaillées */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{account.wins} gains • {account.losses} pertes</span>
                <span>Profit moyen: {account.trades > 0 ? (account.profit / account.trades).toFixed(2) : '0.00'}$</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tableau récapitulatif compact */}
      <div className="border-t border-border/50 pt-4">
        <h4 className="text-sm font-medium mb-3 text-muted-foreground">Résumé détaillé</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-2 font-medium">Compte</th>
                <th className="text-right p-2 font-medium">Trades</th>
                <th className="text-right p-2 font-medium">Taux</th>
                <th className="text-right p-2 font-medium">Profit</th>
              </tr>
            </thead>
            <tbody>
              {data.map((account) => (
                <tr key={account.id} className="border-b border-border/20 hover:bg-secondary/20">
                  <td className="p-2 font-medium">{account.name}</td>
                  <td className="text-right p-2 text-muted-foreground">{account.trades}</td>
                  <td className="text-right p-2">{account.winRate}%</td>
                  <td className={`text-right p-2 font-bold ${account.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {account.profit >= 0 ? '+' : ''}{account.profit.toFixed(2)} $
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

