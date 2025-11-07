'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import type { Database } from '@/types/database.types'
import { checkSubscriptionStatus } from '@/lib/services/subscription'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  hasActiveSubscription: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Vérifier la session active
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    console.log('👤 AuthContext - loadProfile appelé:', { userId })
    setLoading(true)
    
    try {
      // Vérifier d'abord si l'utilisateur est authentifié
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser || authUser.id !== userId) {
        console.error('❌ AuthContext - Utilisateur non authentifié ou ID ne correspond pas')
        setProfile(null)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ AuthContext - Erreur chargement profil:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          error: error
        })
        
        // Si le profil n'existe pas (code PGRST116), créer un profil par défaut
        if (error.code === 'PGRST116') {
          console.log('⚠️ AuthContext - Profil n\'existe pas, création d\'un profil par défaut...')
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: authUser.email || '',
                full_name: authUser.user_metadata?.full_name || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as Database['public']['Tables']['profiles']['Insert'])
              .select()
              .single()

            if (createError) {
              console.error('❌ AuthContext - Erreur création profil:', createError)
              setProfile(null)
              setLoading(false)
              return
            }

            console.log('✅ AuthContext - Profil créé:', newProfile)
            setProfile(newProfile as Profile)
            setHasActiveSubscription(false)
            setLoading(false)
            return
          } catch (createErr) {
            console.error('❌ AuthContext - Erreur lors de la création du profil:', createErr)
            setProfile(null)
            setLoading(false)
            return
          }
        }
        
        // Pour les autres erreurs, ne pas bloquer l'application
        setProfile(null)
        setLoading(false)
        return
      }
      
      if (!data) {
        console.error('❌ AuthContext - Aucune donnée retournée')
        setProfile(null)
        setLoading(false)
        return
      }
      
      console.log('✅ AuthContext - Profil chargé:', { 
        id: data?.id, 
        email: data?.email,
        is_premium: data?.is_premium,
        subscription_expires_at: data?.subscription_expires_at,
        account_type: data?.account_type
      })
      setProfile(data as Profile)

      // Vérifier le statut de l'abonnement
      try {
        console.log('🔍 AuthContext - Vérification abonnement...')
        const subscriptionStatus = await checkSubscriptionStatus(userId)
        console.log('📊 AuthContext - Statut abonnement:', subscriptionStatus)
        setHasActiveSubscription(subscriptionStatus.isActive)
      } catch (subscriptionError) {
        console.error('❌ AuthContext - Erreur lors de la vérification de l\'abonnement:', subscriptionError)
        setHasActiveSubscription(false)
      }
    } catch (error) {
      console.error('❌ AuthContext - Erreur lors du chargement du profil:', error)
      setProfile(null)
    } finally {
      setLoading(false)
      console.log('✅ AuthContext - loadProfile terminé')
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    // Le profil sera créé automatiquement par le trigger Supabase
    // Voir fix_auto_profile.sql
    
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    hasActiveSubscription,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

