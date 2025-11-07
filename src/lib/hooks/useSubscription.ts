'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { checkSubscriptionStatus } from '@/lib/services/subscription'

export interface SubscriptionStatus {
  isActive: boolean
  daysRemaining: number | null
  expiresAt: string | null
  isExpired: boolean
}

export function useSubscription() {
  const { profile } = useAuth()
  console.log('🔧 useSubscription - Hook initialisé:', { hasProfile: !!profile, profileId: profile?.id })
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    daysRemaining: null,
    expiresAt: null,
    isExpired: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 useSubscription - useEffect déclenché:', { hasProfile: !!profile, profileId: profile?.id })
    
    const loadSubscriptionStatus = async () => {
      console.log('🔄 useSubscription - Chargement statut:', { hasProfile: !!profile, profileId: profile?.id })
      
      if (!profile?.id) {
        console.log('⚠️ useSubscription - Pas de profil, abonnement inactif')
        setSubscriptionStatus({
          isActive: false,
          daysRemaining: null,
          expiresAt: null,
          isExpired: true,
        })
        setLoading(false)
        return
      }

      // Les administrateurs ont toujours accès, pas besoin d'abonnement
      if (profile.account_type === 'admin') {
        console.log('✅ useSubscription - Utilisateur ADMIN - Accès autorisé sans abonnement')
        setSubscriptionStatus({
          isActive: true,
          daysRemaining: null,
          expiresAt: null,
          isExpired: false,
        })
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const status = await checkSubscriptionStatus(profile.id)
        console.log('📊 useSubscription - Statut abonnement:', { userId: profile.id, status })
        setSubscriptionStatus(status)
      } catch (error) {
        console.error('❌ useSubscription - Erreur lors de la vérification de l\'abonnement:', error)
        // En cas d'erreur, considérer que l'abonnement n'est pas actif
        setSubscriptionStatus({
          isActive: false,
          daysRemaining: null,
          expiresAt: null,
          isExpired: true,
        })
      } finally {
        setLoading(false)
      }
    }

    // Attendre que le profil soit chargé avant de vérifier
    if (profile) {
      loadSubscriptionStatus()
    } else {
      setLoading(false)
    }

    // Vérifier périodiquement (toutes les heures)
    const interval = setInterval(() => {
      if (profile?.id) {
        loadSubscriptionStatus()
      }
    }, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [profile?.id])

  return {
    ...subscriptionStatus,
    loading,
  }
}
