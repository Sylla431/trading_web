'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Strategy } from '@/types'

export function useStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchStrategies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('trading_strategies')
        .select('*')
        .eq('user_id', user?.id as never)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      setStrategies(data as Strategy[])
    } catch (err) {
      setError(err as Error)
      console.error('Erreur lors du chargement des stratégies:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      fetchStrategies()
    }
  }, [user, fetchStrategies])

  return {
    strategies,
    loading,
    error,
    fetchStrategies,
  }
}

