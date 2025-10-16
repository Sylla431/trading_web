'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { TradingAccount } from '@/types'

export function useAccounts() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user?.id as never)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setAccounts(data as TradingAccount[])
    } catch (err) {
      setError(err as Error)
      console.error('Erreur lors du chargement des comptes:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      fetchAccounts()
    }
  }, [user, fetchAccounts])

  const addAccount = async (accountData: Partial<TradingAccount>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('trading_accounts')
        .insert([
          {
            ...accountData,
            user_id: user?.id,
          },
        ] as never)
        .select()
        .single()

      if (insertError) throw insertError

      setAccounts([data as TradingAccount, ...accounts])
      return { data, error: null }
    } catch (err) {
      console.error('Erreur lors de l\'ajout du compte:', err)
      return { data: null, error: err as Error }
    }
  }

  const updateAccount = async (id: string, updates: Partial<TradingAccount>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('trading_accounts')
        .update(updates as never)
        .eq('id', id)
        .eq('user_id', user?.id as never)
        .select()
        .single()

      if (updateError) throw updateError

      setAccounts(accounts.map((a) => (a.id === id ? (data as TradingAccount) : a)))
      return { data, error: null }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du compte:', err)
      return { data: null, error: err as Error }
    }
  }

  const deleteAccount = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('trading_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id as never)

      if (deleteError) throw deleteError

      setAccounts(accounts.filter((a) => a.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Erreur lors de la suppression du compte:', err)
      return { error: err as Error }
    }
  }

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
  }
}

