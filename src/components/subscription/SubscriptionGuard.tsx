'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CreditCard, Clock } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionGuardProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
}

export function SubscriptionGuard({
  children,
  fallback,
  redirectTo = '/dashboard/subscription',
}: SubscriptionGuardProps) {
  const { isActive, isExpired, daysRemaining, loading } = useSubscription()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Vérification de l&apos;abonnement...</p>
        </div>
      </div>
    )
  }

  if (!isActive || isExpired) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <CardTitle>Abonnement requis</CardTitle>
            </div>
            <CardDescription>
              {isExpired
                ? 'Votre abonnement a expiré. Renouvelez votre abonnement pour continuer à utiliser la plateforme.'
                : 'Vous devez avoir un abonnement actif pour accéder à cette fonctionnalité.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysRemaining !== null && daysRemaining > 0 && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm">
                  <span className="font-medium">Jours restants :</span> {daysRemaining}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button asChild className="flex-1">
                <Link href={redirectTo}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gérer l&apos;abonnement
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
