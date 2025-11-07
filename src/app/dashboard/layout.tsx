'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { useRouter, usePathname } from 'next/navigation'

const PUBLIC_ROUTES = ['/dashboard/subscription', '/dashboard/settings', '/admin']

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Log avec timestamp pour vérifier si c'est du cache
  console.log('🚀 DashboardLayout - Composant rendu', new Date().toISOString())
  
  const { user, profile, loading } = useAuth()
  console.log('👤 DashboardLayout - Auth:', { hasUser: !!user, hasProfile: !!profile, loading })
  
  const { isActive, loading: subscriptionLoading, isExpired } = useSubscription()
  console.log('📊 DashboardLayout - Subscription:', { isActive, subscriptionLoading, isExpired })
  
  const router = useRouter()
  const pathname = usePathname()
  console.log('📍 DashboardLayout - Route:', { pathname })
  
  // Avertissement si les valeurs semblent obsolètes
  if (profile && !subscriptionLoading && isActive === undefined) {
    console.warn('⚠️ PROBLÈME DE CACHE DÉTECTÉ - isActive est undefined, videz le cache !')
  }

  // Les administrateurs ont accès à toutes les pages
  const isAdmin = profile?.account_type === 'admin'

  // Debug logs détaillés
  useEffect(() => {
    console.log('🔐 Dashboard Layout - État complet:', {
      hasUser: !!user,
      hasProfile: !!profile,
      profileEmail: profile?.email,
      accountType: profile?.account_type,
      isAdmin,
      isActive,
      isExpired,
      subscriptionLoading,
      pathname,
      subscriptionExpiresAt: profile?.subscription_expires_at,
      isPremium: profile?.is_premium,
    })
    
    // Log spécial si l'utilisateur est admin
    if (isAdmin) {
      console.log('⚠️ UTILISATEUR ADMIN - Accès autorisé à toutes les pages')
    }
    
    // Log spécial si l'utilisateur n'a pas d'abonnement mais accède quand même
    if (!isActive && !isAdmin && profile && !subscriptionLoading) {
      console.log('🚨 PROBLÈME - Utilisateur sans abonnement actif mais accès autorisé:', {
        email: profile?.email,
        accountType: profile?.account_type,
        isActive,
        isAdmin,
        subscriptionExpiresAt: profile?.subscription_expires_at,
      })
    }
  }, [user, profile, isAdmin, isActive, isExpired, subscriptionLoading, pathname])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    // Vérifier l'abonnement uniquement si l'utilisateur est connecté et que la route nécessite un abonnement
    // Les administrateurs ont accès à toutes les pages
    if (!loading && user && !subscriptionLoading && !isAdmin) {
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route))
      
      // Si pas d'abonnement actif et pas sur une route publique, rediriger immédiatement
      if (!isPublicRoute && !isActive) {
        console.log('🚫 Accès refusé - Pas d\'abonnement actif', { 
          isActive, 
          pathname, 
          isPublicRoute,
          subscriptionLoading,
          isAdmin 
        })
        // Rediriger immédiatement
        router.replace('/dashboard/subscription')
      }
    }
  }, [user, loading, isActive, subscriptionLoading, router, pathname, isAdmin])

  if (loading || subscriptionLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Déterminer si la route actuelle est publique
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route))
  
  // BLOQUER L'ACCÈS : Si pas d'abonnement actif et pas sur une route publique et pas admin
  // Cette vérification doit se faire APRÈS que le chargement soit terminé
  // IMPORTANT: On vérifie aussi que le profil est chargé pour éviter les faux positifs
  if (
    !subscriptionLoading && 
    profile && // Profil chargé
    !isActive && 
    !isPublicRoute && 
    !isAdmin
  ) {
    console.log('🚫 BLOCAGE - Accès refusé:', {
      subscriptionLoading,
      hasProfile: !!profile,
      profileId: profile?.id,
      isActive,
      isPublicRoute,
      isAdmin,
      pathname,
    })
    // Afficher un message et rediriger
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Redirection vers la page d&apos;abonnement...</p>
          <p className="text-sm text-muted-foreground">Vous devez avoir un abonnement actif pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:ml-72 lg:mr-4">
        <div className="container mx-auto p-6 lg:p-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

