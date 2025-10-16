'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, CheckCircle, XCircle, Download } from 'lucide-react'
import Papa from 'papaparse'
import { toast } from 'sonner'
import { useTrades } from '@/lib/hooks/useTrades'
import type { Trade } from '@/types'
import { cn } from '@/lib/utils/cn'

interface CsvRow {
  [key: string]: string
}

export function CsvImport() {
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<CsvRow[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(
    null
  )
  const { addTrade } = useTrades()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0]
    if (csvFile) {
      setFile(csvFile)
      parseCsv(csvFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  })

  const parseCsv = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data as CsvRow[])
        toast.success(`${results.data.length} lignes détectées dans le fichier`)
      },
      error: (error) => {
        toast.error('Erreur lors de la lecture du fichier', {
          description: error.message,
        })
      },
    })
  }

  const importTrades = async () => {
    if (data.length === 0) return

    setImporting(true)
    let success = 0
    let failed = 0

    for (const row of data) {
      try {
        // Mapper les colonnes CSV vers le format de trade
        // Ajustez les noms de colonnes selon votre format CSV
        const tradeData = {
          symbol: row.Symbol || row.symbol || row.SYMBOL,
          trade_type: (row.Type || row.type || row.TYPE || '').toLowerCase().includes('buy')
            ? 'long'
            : 'short',
          lot_size: parseFloat(row.Lots || row.lots || row.LOTS || row.Volume || '0'),
          entry_price: parseFloat(row.OpenPrice || row['Open Price'] || row.open_price || '0'),
          exit_price: parseFloat(row.ClosePrice || row['Close Price'] || row.close_price || '0'),
          entry_time: row.OpenTime || row['Open Time'] || row.open_time || new Date().toISOString(),
          exit_time: row.CloseTime || row['Close Time'] || row.close_time,
          stop_loss: parseFloat(row.StopLoss || row['Stop Loss'] || row.SL || '0') || undefined,
          take_profit: parseFloat(row.TakeProfit || row['Take Profit'] || row.TP || '0') || undefined,
          commission: parseFloat(row.Commission || row.commission || '0') || 0,
          swap: parseFloat(row.Swap || row.swap || '0') || 0,
          net_profit: parseFloat(row.Profit || row.profit || row.PL || '0'),
          status: row.CloseTime || row.exit_time ? 'closed' : 'open',
          imported_from: 'csv',
        }

        // Validation basique
        if (!tradeData.symbol || !tradeData.entry_price || tradeData.lot_size <= 0) {
          failed++
          continue
        }

        const { error } = await addTrade(tradeData as unknown as Trade)

        if (error) {
          failed++
        } else {
          success++
        }
      } catch (error) {
        failed++
      }
    }

    setImporting(false)
    setImportResult({ success, failed })
    toast.success(`Import terminé: ${success} trades importés, ${failed} échecs`)
  }

  const downloadTemplate = () => {
    const template = `Symbol,Type,Lots,OpenPrice,ClosePrice,OpenTime,CloseTime,StopLoss,TakeProfit,Commission,Swap,Profit
EURUSD,Buy,0.5,1.0850,1.0920,2025-01-15 10:30:00,2025-01-15 14:30:00,1.0820,1.0950,7,0,343
GBPUSD,Sell,0.3,1.2650,1.2580,2025-01-16 09:00:00,2025-01-16 15:00:00,1.2680,1.2550,5,-2,203`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_import_trades.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Zone de drop */}
      <Card>
        <CardHeader>
          <CardTitle>1. Importer votre fichier CSV</CardTitle>
          <CardDescription>
            Glissez-déposez votre fichier ou cliquez pour sélectionner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
            )}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
              </div>
              {file ? (
                <div>
                  <p className="font-medium text-primary flex items-center gap-2 justify-center">
                    <FileText className="w-4 h-4" />
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.length} lignes détectées
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">
                    Glissez votre fichier CSV ici ou cliquez pour sélectionner
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Formats acceptés : .csv
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={downloadTemplate} className="gap-2">
              <Download className="w-4 h-4" />
              Télécharger un modèle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Aperçu des données</CardTitle>
            <CardDescription>Vérifiez que les colonnes sont correctement mappées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Symbole</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Lots</th>
                    <th className="text-left p-2">Prix entrée</th>
                    <th className="text-left p-2">Prix sortie</th>
                    <th className="text-left p-2">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{row.Symbol || row.symbol}</td>
                      <td className="p-2">{row.Type || row.type}</td>
                      <td className="p-2">{row.Lots || row.lots}</td>
                      <td className="p-2">{row.OpenPrice || row.open_price}</td>
                      <td className="p-2">{row.ClosePrice || row.close_price}</td>
                      <td className="p-2">{row.Profit || row.profit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 5 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  ... et {data.length - 5} autres lignes
                </p>
              )}
            </div>

            <Button
              className="w-full mt-4"
              onClick={importTrades}
              disabled={importing}
            >
              {importing ? 'Import en cours...' : `Importer ${data.length} trades`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Résultat */}
      {importResult && (
        <Card className="border-2 border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Import terminé !
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-500 mb-1">Réussis</p>
                <p className="text-3xl font-bold text-green-500">{importResult.success}</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-500 mb-1">Échecs</p>
                <p className="text-3xl font-bold text-red-500">{importResult.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

