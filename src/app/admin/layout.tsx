'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading } = useAuth()
  const { isActive, loading: subscriptionLoading } = useSubscription()
  const router = useRouter()
  const pathname = usePathname()

  // Routes qui ne nécessitent pas d'abonnement actif
  const publicRoutes = ['/dashboard/subscription', '/dashboard/settings', '/admin']
  
  // Les administrateurs ont accès à toutes les pages
  const isAdmin = profile?.account_type === 'admin'

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    // Vérifier que l'utilisateur est admin pour accéder aux routes admin
    if (!loading && user && !isAdmin) {
      console.log('🚫 Accès refusé - Route admin réservée aux administrateurs')
      router.replace('/dashboard')
    }
  }, [user, loading, isAdmin, router])

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

  // Bloquer l'accès si l'utilisateur n'est pas admin
  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <p className="text-muted-foreground">Accès refusé</p>
          <p className="text-sm text-muted-foreground">Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  // Utiliser le même layout que le dashboard avec le sidebar
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
