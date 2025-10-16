'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { X, Target, TrendingUp, Shield, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Strategy } from '@/types'

interface AddStrategyDialogProps {
  onClose: () => void
  strategyToEdit?: Strategy
  onSuccess: () => void
}

export function AddStrategyDialog({ onClose, strategyToEdit, onSuccess }: AddStrategyDialogProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const isEdit = Boolean(strategyToEdit)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    timeframe: '',
    color: '#10b981',
    is_active: true,
  })
  
  const [entryRules, setEntryRules] = useState<string[]>([''])
  const [exitRules, setExitRules] = useState<string[]>([''])
  const [riskRules, setRiskRules] = useState<string[]>([''])

  useEffect(() => {
    if (strategyToEdit) {
      setFormData({
        name: strategyToEdit.name || '',
        description: strategyToEdit.description || '',
        timeframe: strategyToEdit.timeframe || '',
        color: strategyToEdit.color || '#10b981',
        is_active: strategyToEdit.is_active ?? true,
      })
      
      // Charger les règles
      setEntryRules(
        strategyToEdit.entry_rules?.split('\n').filter((r) => r.trim()) || ['']
      )
      setExitRules(
        strategyToEdit.exit_rules?.split('\n').filter((r) => r.trim()) || ['']
      )
      setRiskRules(
        strategyToEdit.risk_management_rules?.split('\n').filter((r) => r.trim()) || ['']
      )
    }
  }, [strategyToEdit])

  const addRule = (type: 'entry' | 'exit' | 'risk') => {
    if (type === 'entry') setEntryRules([...entryRules, ''])
    else if (type === 'exit') setExitRules([...exitRules, ''])
    else setRiskRules([...riskRules, ''])
  }

  const removeRule = (type: 'entry' | 'exit' | 'risk', index: number) => {
    if (type === 'entry') {
      const newRules = entryRules.filter((_, i) => i !== index)
      setEntryRules(newRules.length === 0 ? [''] : newRules)
    } else if (type === 'exit') {
      const newRules = exitRules.filter((_, i) => i !== index)
      setExitRules(newRules.length === 0 ? [''] : newRules)
    } else {
      const newRules = riskRules.filter((_, i) => i !== index)
      setRiskRules(newRules.length === 0 ? [''] : newRules)
    }
  }

  const updateRule = (type: 'entry' | 'exit' | 'risk', index: number, value: string) => {
    if (type === 'entry') {
      const newRules = [...entryRules]
      newRules[index] = value
      setEntryRules(newRules)
    } else if (type === 'exit') {
      const newRules = [...exitRules]
      newRules[index] = value
      setExitRules(newRules)
    } else {
      const newRules = [...riskRules]
      newRules[index] = value
      setRiskRules(newRules)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        user_id: user?.id,
        entry_rules: entryRules.filter((r) => r.trim()).join('\n'),
        exit_rules: exitRules.filter((r) => r.trim()).join('\n'),
        risk_management_rules: riskRules.filter((r) => r.trim()).join('\n'),
      }

      if (isEdit && strategyToEdit) {
        const { error } = await supabase
          .from('trading_strategies')
          .update(payload as never)
          .eq('id', strategyToEdit.id)
          .eq('user_id', user?.id as never)

        if (error) throw error
        toast.success('Stratégie mise à jour !')
      } else {
        const { error } = await supabase
          .from('trading_strategies')
          .insert([payload] as never)

        if (error) throw error
        toast.success('Stratégie créée avec succès !')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-hidden">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0 border-b">
          <div>
            <CardTitle>{isEdit ? 'Éditer la stratégie' : 'Nouvelle stratégie'}</CardTitle>
            <CardDescription>
              {isEdit ? 'Modifiez votre plan de trading' : 'Créez un nouveau plan de trading'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="w-4 h-4" />
                Informations de base
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la stratégie *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Breakout Morning, Scalping EMA..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <select
                    id="timeframe"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={formData.timeframe}
                    onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                  >
                    <option value="">Sélectionner</option>
                    <option value="1m">1 minute</option>
                    <option value="5m">5 minutes</option>
                    <option value="15m">15 minutes</option>
                    <option value="30m">30 minutes</option>
                    <option value="1h">1 heure</option>
                    <option value="4h">4 heures</option>
                    <option value="1D">1 jour</option>
                    <option value="1W">1 semaine</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Description générale de la stratégie..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Règles d'entrée */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  Règles d&apos;entrée
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addRule('entry')}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              
              <div className="space-y-2">
                {entryRules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={rule}
                      onChange={(e) => updateRule('entry', index, e.target.value)}
                      placeholder="Ex: Prix au-dessus de EMA 200"
                      className="flex-1"
                    />
                    {entryRules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRule('entry', index)}
                        className="h-9 w-9 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Listez toutes les conditions qui doivent être remplies pour entrer en position
                </p>
              </div>
            </div>

            {/* Règles de sortie */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-orange-600">
                  <Target className="w-4 h-4" />
                  Règles de sortie
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addRule('exit')}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              
              <div className="space-y-2">
                {exitRules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={rule}
                      onChange={(e) => updateRule('exit', index, e.target.value)}
                      placeholder="Ex: TP1 à 1.5R (50% de la position)"
                      className="flex-1"
                    />
                    {exitRules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRule('exit', index)}
                        className="h-9 w-9 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Définissez quand prendre vos profits et couper vos pertes
                </p>
              </div>
            </div>

            {/* Gestion du risque */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-blue-600">
                  <Shield className="w-4 h-4" />
                  Gestion du risque
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addRule('risk')}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              
              <div className="space-y-2">
                {riskRules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={rule}
                      onChange={(e) => updateRule('risk', index, e.target.value)}
                      placeholder="Ex: Risque maximum 1% du capital par trade"
                      className="flex-1"
                    />
                    {riskRules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRule('risk', index)}
                        className="h-9 w-9 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Définissez vos limites et règles de protection du capital
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Couleur (pour l&apos;UI)</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10"
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Stratégie active
                </Label>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer la stratégie'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

