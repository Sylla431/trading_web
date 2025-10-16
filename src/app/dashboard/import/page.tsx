'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedIcon, TradingIcons } from '@/components/shared/AnimatedIcon'
import { CsvImport } from '@/components/import/CsvImport'
import { FileSpreadsheet, Database, TrendingUp } from 'lucide-react'

export default function ImportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <AnimatedIcon icon={TradingIcons.rocket} size={36} />
          Importer des trades
        </h1>
        <p className="text-muted-foreground">
          Importez vos trades depuis MetaTrader, TradingView ou CSV
        </p>
      </div>

      {/* Options d'import */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-border/50 hover:border-primary/50 transition-all">
          <CardHeader>
            <FileSpreadsheet className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-lg">Fichier CSV</CardTitle>
            <CardDescription>
              Importez depuis n'importe quel fichier CSV
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2 border-border/50 opacity-50">
          <CardHeader>
            <Database className="w-8 h-8 text-muted-foreground mb-2" />
            <CardTitle className="text-lg">MetaTrader 4/5</CardTitle>
            <CardDescription>
              Connexion directe à MT4/MT5 (Bientôt)
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2 border-border/50 opacity-50">
          <CardHeader>
            <TrendingUp className="w-8 h-8 text-muted-foreground mb-2" />
            <CardTitle className="text-lg">TradingView</CardTitle>
            <CardDescription>
              Import depuis TradingView (Bientôt)
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Import CSV */}
      <CsvImport />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Format CSV attendu</CardTitle>
          <CardDescription>
            Votre fichier CSV doit contenir ces colonnes (ordre flexible)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Obligatoire</p>
                <p className="font-mono text-sm font-medium">Symbol</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Obligatoire</p>
                <p className="font-mono text-sm font-medium">Type</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Obligatoire</p>
                <p className="font-mono text-sm font-medium">Lots</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Obligatoire</p>
                <p className="font-mono text-sm font-medium">OpenPrice</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Optionnel</p>
                <p className="font-mono text-sm font-medium">ClosePrice</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Obligatoire</p>
                <p className="font-mono text-sm font-medium">OpenTime</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Optionnel</p>
                <p className="font-mono text-sm font-medium">CloseTime</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Optionnel</p>
                <p className="font-mono text-sm font-medium">Profit</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <p className="text-sm text-blue-500 font-medium mb-2">💡 Conseil</p>
              <p className="text-sm">
                Téléchargez le modèle CSV pour voir un exemple complet avec toutes les colonnes.
                Les noms de colonnes peuvent varier (Symbol/symbol/SYMBOL sont tous acceptés).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

