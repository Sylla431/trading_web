'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export interface JournalEntry {
  id: string
  user_id: string
  entry_date: string
  mood?: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible'
  energy_level?: number
  stress_level?: number
  confidence_level?: number
  what_went_well?: string
  what_to_improve?: string
  lessons_learned?: string
  market_analysis?: string
  followed_plan?: boolean
  discipline_score?: number
  mistakes_made?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user?.id as never)
        .order('entry_date', { ascending: false })

      if (fetchError) throw fetchError

      setEntries(data as JournalEntry[])
    } catch (err) {
      setError(err as Error)
      console.error('Erreur lors du chargement du journal:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      fetchEntries()
    }
  }, [user, fetchEntries])

  const addEntry = async (entryData: Partial<JournalEntry>) => {
    try {
      const payload = {
        ...entryData,
        user_id: user?.id,
      }

      const { data, error: insertError } = await supabase
        .from('journal_entries')
        .insert([payload] as never)
        .select()
        .single()

      if (insertError) throw insertError

      setEntries([data as JournalEntry, ...entries])
      return { data, error: null }
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err)
      return { data: null, error: err as Error }
    }
  }

  const updateEntry = async (id: string, updates: Partial<JournalEntry>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('journal_entries')
        .update({ ...updates, updated_at: new Date().toISOString() } as never)
        .eq('id', id)
        .eq('user_id', user?.id as never)
        .select()
        .single()

      if (updateError) throw updateError

      setEntries(entries.map((e) => (e.id === id ? (data as JournalEntry) : e)))
      return { data, error: null }
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err)
      return { data: null, error: err as Error }
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id as never)

      if (deleteError) throw deleteError

      setEntries(entries.filter((e) => e.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      return { error: err as Error }
    }
  }

  return {
    entries,
    loading,
    error,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
  }
}
