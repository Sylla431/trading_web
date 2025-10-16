'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { toast } from 'sonner'
import { X } from 'lucide-react'

type FormData = {
  account_name: string
  broker?: string
  account_number?: string
  account_type?: 'demo' | 'real' | 'paper'
  currency?: string
  initial_balance?: number
  notes?: string
}

export function AddAccountDialog({ onClose }: { onClose: () => void }) {
  const { addAccount } = useAccounts()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      account_type: 'real',
      currency: 'USD',
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const { error } = await addAccount({
        account_name: data.account_name,
        broker: data.broker,
        account_number: data.account_number,
        account_type: data.account_type,
        currency: data.currency || 'USD',
        initial_balance: data.initial_balance,
        current_balance: data.initial_balance,
        is_active: true,
        notes: data.notes,
      })
      if (error) {
        toast.error("Erreur lors de l'ajout du compte")
      } else {
        toast.success('Compte ajouté avec succès')
        onClose()
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Nouveau compte</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_name">Nom du compte *</Label>
                <Input id="account_name" placeholder="Compte Principal" {...register('account_name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="broker">Broker</Label>
                <Input id="broker" placeholder="Binance, ICMarkets..." {...register('broker')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_number">N° de compte</Label>
                <Input id="account_number" placeholder="12345678" {...register('account_number')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_type">Type</Label>
                <select id="account_type" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" {...register('account_type')}>
                  <option value="real">Réel</option>
                  <option value="demo">Démo</option>
                  <option value="paper">Paper</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Input id="currency" placeholder="USD" {...register('currency')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial_balance">Solde initial</Label>
                <Input id="initial_balance" type="number" step="0.01" placeholder="1000.00" {...register('initial_balance', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea id="notes" className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" placeholder="Infos supplémentaires" {...register('notes')} />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Ajout...' : 'Créer le compte'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


