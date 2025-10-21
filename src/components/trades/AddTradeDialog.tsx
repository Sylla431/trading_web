'use client'

import { useEffect, useState, useCallback } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tradeSchema, type TradeFormData } from '@/lib/validations/trade'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useTrades } from '@/lib/hooks/useTrades'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { useStrategies } from '@/lib/hooks/useStrategies'
import { StrategyPlanPanel } from '@/components/trades/StrategyPlanPanel'
import { X } from 'lucide-react'
import type { Trade } from '@/types'

interface AddTradeDialogProps {
  onClose: () => void
  tradeToEdit?: Trade
  tradeToDuplicate?: Trade
}

export function AddTradeDialog({ onClose, tradeToEdit, tradeToDuplicate }: AddTradeDialogProps) {
  const { addTrade, updateTrade } = useTrades()
  const { accounts } = useAccounts()
  const { strategies } = useStrategies()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = Boolean(tradeToEdit)
  const isDuplicate = Boolean(tradeToDuplicate)
  const [showEntryCal, setShowEntryCal] = useState(false)
  const [showExitCal, setShowExitCal] = useState(false)
  

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(tradeSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      status: 'open',
      trade_type: 'long',
      commission: 0,
      swap: 0,
      discipline_score: 5,
    },
  })

  const watchedEntryTime = watch('entry_time') as string | undefined
  const watchedExitPrice = watch('exit_price') as number | undefined
  const watchedStrategyName = watch('strategy_name') as string | undefined
  
  // Trouver la stratégie sélectionnée
  const selectedStrategy = strategies.find((s) => s.name === watchedStrategyName) || null

  const formatNowForInput = useCallback(() => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }, [])

  const formatWithPreservedTime = (date: Date, timeSource?: string) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    const source = timeSource ? new Date(timeSource) : new Date()
    const hh = pad(source.getHours())
    const mi = pad(source.getMinutes())
    const yyyy = date.getFullYear()
    const mm = pad(date.getMonth() + 1)
    const dd = pad(date.getDate())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }

  // Fonction pour convertir les anciennes valeurs d'émotion vers les nouvelles
  const convertEmotion = (emotion: string | undefined): 'confident' | 'calm' | 'neutral' | 'stressed' | 'fearful' | undefined => {
    if (!emotion) return undefined
    
    const emotionMap: Record<string, 'confident' | 'calm' | 'neutral' | 'stressed' | 'fearful'> = {
      'excellent': 'confident',
      'good': 'calm',
      'neutral': 'neutral',
      'bad': 'stressed',
      'terrible': 'fearful',
      // Nouvelles valeurs (déjà correctes)
      'confident': 'confident',
      'calm': 'calm',
      'stressed': 'stressed',
      'fearful': 'fearful'
    }
    
    return emotionMap[emotion] || undefined
  }

  useEffect(() => {
    if (tradeToEdit) {
      console.log('🔄 Remplissage du formulaire avec:', {
        emotion_before: tradeToEdit.emotion_before,
        emotion_after: tradeToEdit.emotion_after,
        emotion_before_type: typeof tradeToEdit.emotion_before,
        emotion_after_type: typeof tradeToEdit.emotion_after
      })
      
      reset({
        account_id: (tradeToEdit as unknown as { account_id?: string }).account_id,
        symbol: tradeToEdit.symbol,
        trade_type: tradeToEdit.trade_type,
        lot_size: tradeToEdit.lot_size,
        entry_price: tradeToEdit.entry_price,
        exit_price: tradeToEdit.exit_price,
        stop_loss: tradeToEdit.stop_loss,
        take_profit: tradeToEdit.take_profit,
        entry_time: tradeToEdit.entry_time?.slice(0, 16),
        exit_time: tradeToEdit.exit_time?.slice(0, 16),
        net_profit: tradeToEdit.net_profit,
        notes: tradeToEdit.notes,
        strategy_name: tradeToEdit.strategy_name,
        status: tradeToEdit.status,
        emotion_before: convertEmotion(tradeToEdit.emotion_before),
        emotion_after: convertEmotion(tradeToEdit.emotion_after),
        discipline_score: tradeToEdit.discipline_score,
      })
    } else if (tradeToDuplicate) {
      // Duplication: on garde les infos du trade mais on réinitialise dates, statut et profits
      reset({
        account_id: (tradeToDuplicate as unknown as { account_id?: string }).account_id,
        symbol: tradeToDuplicate.symbol,
        trade_type: tradeToDuplicate.trade_type,
        lot_size: tradeToDuplicate.lot_size,
        entry_price: tradeToDuplicate.entry_price,
        exit_price: undefined, // Reset exit price
        stop_loss: tradeToDuplicate.stop_loss,
        take_profit: tradeToDuplicate.take_profit,
        entry_time: formatNowForInput(), // Set entry time to now
        exit_time: undefined, // Reset exit time
        net_profit: undefined, // Reset net profit
        gross_profit: undefined, // Reset gross profit
        notes: tradeToDuplicate.notes,
        strategy_name: tradeToDuplicate.strategy_name,
        status: 'open', // Set status to open
        emotion_before: convertEmotion(tradeToDuplicate.emotion_before),
        emotion_after: convertEmotion(tradeToDuplicate.emotion_after),
        discipline_score: tradeToDuplicate.discipline_score,
      })
    }
  }, [tradeToEdit, tradeToDuplicate, reset, formatNowForInput])

  // UX: si un prix de sortie est saisi, on bascule automatiquement en "Fermé"
  // et on préremplit la date de sortie à maintenant si absente
  useEffect(() => {
    if (watchedExitPrice && watchedExitPrice > 0) {
      setValue('status', 'closed', { shouldDirty: true })
      if (!watch('exit_time')) {
        setValue('exit_time', formatNowForInput(), { shouldDirty: true })
      }
    }
  }, [watchedExitPrice, setValue, watch, formatNowForInput])

  // Debug: afficher les erreurs de validation
  console.log('🔍 Erreurs de validation:', errors)
  console.log('✅ Formulaire valide:', isValid)

  const onSubmit = async (data: TradeFormData) => {
    console.log('🚀 onSubmit appelé', { isEdit, tradeToEdit: tradeToEdit?.id, data })
    setIsSubmitting(true)
    try {
      let error: Error | null = null
      
      if (isEdit && tradeToEdit) {
        console.log('📝 Mode édition - Mise à jour du trade', tradeToEdit.id)
        const { error: updateErr } = await updateTrade(tradeToEdit.id, data)
        error = updateErr ?? null
        console.log('✅ Résultat mise à jour:', { error })
      } else {
        console.log('➕ Mode ajout - Nouveau trade')
        const { error: addErr } = await addTrade(data)
        error = addErr ?? null
        console.log('✅ Résultat ajout:', { error })
      }

      if (error) {
        console.error('❌ Erreur lors de l\'enregistrement:', error)
        toast.error('Erreur lors de l\'enregistrement', {
          description: error.message,
        })
      } else {
        console.log('🎉 Succès:', isEdit ? 'Trade mis à jour' : 'Trade ajouté')
        toast.success(isEdit ? 'Trade mis à jour !' : 'Trade ajouté avec succès !')
        onClose()
      }
    } catch (err) {
      console.error('💥 Erreur catch:', err)
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-hidden">
      <div className="w-full max-w-7xl h-[90vh] gap-6" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', minWidth: '800px' }}>
        {/* Formulaire principal */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between flex-shrink-0 border-b">
            <div>
              <CardTitle>
                {isEdit ? 'Éditer un trade' : isDuplicate ? 'Dupliquer un trade' : 'Ajouter un trade'}
              </CardTitle>
              <CardDescription>
                {isEdit
                  ? 'Modifiez les détails de votre trade'
                  : isDuplicate
                  ? 'Créez un nouveau trade basé sur celui-ci'
                  : 'Enregistrez les détails de votre trade'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Sélection du compte */}
            {accounts.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="account_id">Compte de trading</Label>
                <select
                  id="account_id"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  {...register('account_id')}
                >
                  <option value="">Sélectionner un compte</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_name} ({account.broker})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Informations de base */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbole *</Label>
                <Input
                  id="symbol"
                  placeholder="EURUSD, BTCUSD..."
                  {...register('symbol')}
                />
                {errors.symbol && (
                  <p className="text-sm text-destructive">{errors.symbol.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trade_type">Type de trade</Label>
                <select
                  id="trade_type"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  {...register('trade_type')}
                >
                  <option value="long">Long (Achat)</option>
                  <option value="short">Short (Vente)</option>
                </select>
              </div>
            </div>

            {/* Prix et taille */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lot_size">Taille du lot *</Label>
                <Input
                  id="lot_size"
                  type="number"
                  step="any"
                  placeholder="0.01"
                  {...register('lot_size', { valueAsNumber: true })}
                />
                {errors.lot_size && (
                  <p className="text-sm text-destructive">{errors.lot_size.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry_price">Prix d&apos;entrée *</Label>
                <Input
                  id="entry_price"
                  type="number"
                  step="any"
                  placeholder="1.2500"
                  {...register('entry_price', { valueAsNumber: true })}
                />
                {errors.entry_price && (
                  <p className="text-sm text-destructive">{errors.entry_price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit_price">Prix de sortie</Label>
                <Input
                  id="exit_price"
                  type="number"
                  step="any"
                  placeholder="1.2600"
                  {...register('exit_price', {
                    setValueAs: (v) => (v === '' ? undefined : Number(v))
                  })}
                />
                {errors.exit_price && (
                  <p className="text-sm text-destructive">{errors.exit_price.message}</p>
                )}
              </div>
            </div>

            {/* SL/TP */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stop_loss">Stop Loss</Label>
                <Input
                  id="stop_loss"
                  type="number"
                  step="any"
                  placeholder="1.2400"
                  {...register('stop_loss', {
                    setValueAs: (v) => (v === '' ? undefined : Number(v))
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="take_profit">Take Profit</Label>
                <Input
                  id="take_profit"
                  type="number"
                  step="any"
                  placeholder="1.2700"
                  {...register('take_profit', {
                    setValueAs: (v) => (v === '' ? undefined : Number(v))
                  })}
                />
              </div>
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                {...register('status')}
              >
                <option value="open">Ouvert</option>
                <option value="closed">Fermé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            {/* Profit net */}
            <div className="space-y-2">
              <Label htmlFor="net_profit">Profit net (optionnel)</Label>
              <Input
                id="net_profit"
                type="number"
                step="0.01"
                placeholder="100.00"
                {...register('net_profit', {
                  setValueAs: (v) => (v === '' || v === null ? undefined : Number(v))
                })}
              />
              <p className="text-xs text-muted-foreground">
                Profit après déduction des frais (commissions, swap, etc.)
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="entry_time">Date d&apos;entrée *</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setValue('entry_time', formatNowForInput(), { shouldDirty: true })}
                    >
                      Maintenant
                    </Button>
                  </div>
                </div>
                <Input
                  id="entry_time"
                  type="datetime-local"
                  {...register('entry_time')}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setShowEntryCal((v) => !v)}
                  >
                    {showEntryCal ? 'Fermer calendrier' : 'Calendrier'}
                  </Button>
                </div>
                {showEntryCal && (
                  <div className="mt-2 rounded-xl border p-2 bg-card/70">
                    <DayPicker
                      mode="single"
                      selected={watchedEntryTime ? new Date(watchedEntryTime) : undefined}
                      onSelect={(d) => {
                        if (!d) return
                        setValue('entry_time', formatWithPreservedTime(d, watchedEntryTime), { shouldDirty: true })
                      }}
                    />
                  </div>
                )}
                {errors.entry_time && (
                  <p className="text-sm text-destructive">{errors.entry_time.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="exit_time">Date de sortie</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setValue('exit_time', formatNowForInput(), { shouldDirty: true })}
                    >
                      Maintenant
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => watchedEntryTime && setValue('exit_time', watchedEntryTime, { shouldDirty: true })}
                    >
                      Copier entrée
                    </Button>
                  </div>
                </div>
                <Input
                  id="exit_time"
                  type="datetime-local"
                  {...register('exit_time')}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setShowExitCal((v) => !v)}
                  >
                    {showExitCal ? 'Fermer calendrier' : 'Calendrier'}
                  </Button>
                </div>
                {showExitCal && (
                  <div className="mt-2 rounded-xl border p-2 bg-card/70">
                    <DayPicker
                      mode="single"
                      selected={(watch('exit_time') as string | undefined) ? new Date(watch('exit_time') as string) : undefined}
                      onSelect={(d) => {
                        if (!d) return
                        const currentExit = watch('exit_time') as string | undefined
                        const source = currentExit || watchedEntryTime
                        setValue('exit_time', formatWithPreservedTime(d, source), { shouldDirty: true })
                      }}
                    />
                  </div>
                )}
                {errors.exit_time && (
                  <p className="text-sm text-destructive">{errors.exit_time.message}</p>
                )}
              </div>
            </div>

            {/* État mental */}
            <div className="space-y-4">
              <h3 className="font-semibold">État mental</h3>
              
              <div className="space-y-3">
                <Label>Humeur avant le trade</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 'confident', label: 'Confiant', icon: '😎', color: 'text-green-600' },
                    { value: 'calm', label: 'Calme', icon: '😌', color: 'text-blue-500' },
                    { value: 'neutral', label: 'Neutre', icon: '😐', color: 'text-gray-500' },
                    { value: 'stressed', label: 'Stressé', icon: '😰', color: 'text-orange-500' },
                    { value: 'fearful', label: 'Peur', icon: '😨', color: 'text-red-600' },
                  ].map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setValue('emotion_before', mood.value as 'confident' | 'calm' | 'neutral' | 'stressed' | 'fearful', { shouldDirty: true })}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        watch('emotion_before') === mood.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-lg mb-1">{mood.icon}</div>
                      <div className={`text-xs font-medium ${mood.color}`}>{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Humeur après le trade</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'euphoric', label: 'Euphorique', icon: '🚀', color: 'text-green-600' },
                    { value: 'confident', label: 'Confiant', icon: '😎', color: 'text-green-500' },
                    { value: 'relieved', label: 'Soulagé', icon: '😌', color: 'text-blue-500' },
                    { value: 'neutral', label: 'Neutre', icon: '😐', color: 'text-gray-500' },
                    { value: 'frustrated', label: 'Frustré', icon: '😤', color: 'text-orange-500' },
                    { value: 'stressed', label: 'Stressé', icon: '😰', color: 'text-orange-600' },
                    { value: 'fearful', label: 'Peur', icon: '😨', color: 'text-red-500' },
                    { value: 'calm', label: 'Calme', icon: '🧘', color: 'text-blue-600' },
                  ].map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setValue('emotion_after', mood.value as 'confident' | 'calm' | 'neutral' | 'stressed' | 'fearful' | 'euphoric' | 'frustrated' | 'relieved', { shouldDirty: true })}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        watch('emotion_after') === mood.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-lg mb-1">{mood.icon}</div>
                      <div className={`text-xs font-medium ${mood.color}`}>{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discipline_score">Score de discipline (1-10)</Label>
                <Input
                  id="discipline_score"
                  type="range"
                  min="1"
                  max="10"
                  {...register('discipline_score', { valueAsNumber: true })}
                  className="w-full"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Très faible</p>
                  <p className="text-lg font-bold text-primary">{String(watch('discipline_score') ?? 5)}/10</p>
                  <p className="text-sm text-muted-foreground">Excellent</p>
                </div>
              </div>
            </div>

            {/* Stratégie */}
            <div className="space-y-2">
              <Label htmlFor="strategy_name">Stratégie utilisée</Label>
              {strategies.length > 0 ? (
                <select
                  id="strategy_name"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  {...register('strategy_name')}
                >
                  <option value="">Aucune stratégie</option>
                  {strategies.map((strategy) => (
                    <option key={strategy.id} value={strategy.name}>
                      {strategy.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="strategy_name"
                  placeholder="Breakout, Scalping, Swing..."
                  {...register('strategy_name')}
                />
              )}
              <p className="text-xs text-muted-foreground">
                Le plan de trading s&apos;affichera à droite (écrans larges) ou en bas (petits écrans)
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes sur le trade</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Raison du trade, setup, etc..."
                {...register('notes')}
              />
            </div>

            {/* Plan de stratégie - Version mobile */}
            <div className="hidden">
              <div className="space-y-2">
                <Label>Plan de trading</Label>
                <div className="p-4 rounded-lg border bg-secondary/30">
                  {selectedStrategy ? (
                    <div>
                      <p className="text-sm font-semibold mb-2">Stratégie: {selectedStrategy.name}</p>
                      <StrategyPlanPanel strategy={selectedStrategy} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sélectionnez une stratégie pour voir le plan</p>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                onClick={() => {
                  console.log('🖱️ Bouton cliqué!', { isEdit, isValid, errors })
                }}
              >
                {isSubmitting 
                  ? (isEdit ? 'Mise à jour...' : 'Ajout en cours...') 
                  : (isEdit ? 'Mettre à jour le trade' : 'Ajouter le trade')
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Panneau du plan de trading */}
      <div className="flex flex-col overflow-hidden">
        <Card className="flex flex-col h-full">
          <CardHeader className="flex-shrink-0 border-b">
            <CardTitle className="text-lg">Plan de trading</CardTitle>
            <CardDescription>
              {selectedStrategy ? `Stratégie: ${selectedStrategy.name}` : 'Sélectionnez une stratégie'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <StrategyPlanPanel strategy={selectedStrategy} />
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}