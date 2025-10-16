'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAccounts } from '@/lib/hooks/useAccounts'
import { AddAccountDialog } from '@/components/accounts/AddAccountDialog'
import { Trash2, Plus } from 'lucide-react'

export default function AccountsPage() {
  const { accounts, loading, deleteAccount, fetchAccounts } = useAccounts()
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comptes</h1>
          <p className="text-muted-foreground">Gérez vos comptes de trading</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchAccounts}>Rafraîchir</Button>
          <Button onClick={() => setShowAdd(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nouveau compte
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center text-muted-foreground">Chargement...</div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun compte. Créez votre premier compte pour commencer.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <Card key={a.id} className="border-2 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{a.account_name}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => deleteAccount(a.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                {a.broker && <p>Broker: {a.broker}</p>}
                {a.account_number && <p>N°: {a.account_number}</p>}
                <p>Type: {a.account_type || '—'}</p>
                <p>Devise: {a.currency}</p>
                {a.current_balance !== undefined && a.current_balance !== null && (
                  <p>Solde: {a.current_balance.toFixed(2)} {a.currency}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showAdd && <AddAccountDialog onClose={() => setShowAdd(false)} />}
    </div>
  )
}


