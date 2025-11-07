'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/lib/hooks/useSubscription'
// import { activateSubscription } from '@/lib/services/subscription' // Retiré - Activation uniquement par admin
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

export default function SubscriptionPage() {
  const { user, profile } = useAuth()
  const { isActive, daysRemaining, expiresAt, isExpired, loading } = useSubscription()
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [isPendingActivation, setIsPendingActivation] = useState(false)
  
  // Les administrateurs n'ont pas besoin d'abonnement
  const isAdmin = profile?.account_type === 'admin'

  useEffect(() => {
    if (user?.id) {
      loadPaymentHistory()
    }
  }, [user?.id])

  // Vérifier si c'est un nouvel utilisateur ou s'il y a un paiement récent
  useEffect(() => {
    // Vérifier si c'est un nouvel utilisateur (première connexion)
    // Si le profil a été créé récemment (moins de 24h) et pas d'abonnement, c'est probablement un nouvel achat
    const isNewUser = profile?.created_at 
      ? new Date().getTime() - new Date(profile.created_at).getTime() < 24 * 60 * 60 * 1000
      : false
    
    // Vérifier s'il y a un paiement récent (moins de 24h)
    const hasRecentPayment = paymentHistory.some(payment => {
      const paymentDate = new Date(payment.created_at)
      const now = new Date()
      return (now.getTime() - paymentDate.getTime()) < 24 * 60 * 60 * 1000 // Moins de 24h
    })
    
    // Si nouvel utilisateur OU paiement récent ET pas d'abonnement actif
    setIsPendingActivation((isNewUser || hasRecentPayment) && !isActive)
  }, [profile?.created_at, paymentHistory, isActive])

  const loadPaymentHistory = async () => {
    if (!user?.id) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && data) {
      setPaymentHistory(data)
    }
  }

  // Fonction retirée - L'activation se fait uniquement par l'administrateur
  // Les utilisateurs ne peuvent plus s'activer eux-mêmes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Abonnement</h1>
        <p className="text-muted-foreground mt-2">
          {isAdmin 
            ? 'En tant qu\'administrateur, vous avez accès à toutes les fonctionnalités sans abonnement.'
            : 'Gérez votre abonnement et accédez à toutes les fonctionnalités premium'}
        </p>
      </div>

      {/* Message pour les admins */}
      {isAdmin && (
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Accès administrateur
                </p>
                <p className="text-sm text-muted-foreground">
                  En tant qu&apos;administrateur, vous avez un accès illimité à toutes les fonctionnalités de la plateforme sans besoin d&apos;abonnement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statut actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Statut de l&apos;abonnement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              {isAdmin ? (
                <Badge className="bg-blue-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Administrateur
                </Badge>
              ) : isActive ? (
                <Badge className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Actif
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {isExpired ? 'Expiré' : 'Inactif'}
                </Badge>
              )}
            </div>
            {expiresAt && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Expire le</p>
                <p className="font-medium">
                  {new Date(expiresAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {daysRemaining !== null && daysRemaining > 0 && (
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Jours restants</p>
                  <p className="text-2xl font-bold text-primary">{daysRemaining}</p>
                </div>
              </div>
            </div>
          )}

          {!isActive && (
            <div className="pt-4 border-t">
              <div className={cn(
                "p-4 rounded-lg border",
                isPendingActivation 
                  ? "bg-blue-500/10 border-blue-500/30" 
                  : "bg-muted border-border"
              )}>
                {isPendingActivation ? (
                  <>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1 text-blue-600 dark:text-blue-400">
                          Activation en attente
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Votre abonnement est en cours d&apos;activation par l&apos;administrateur. 
                          Vous recevrez un email de confirmation une fois l&apos;activation terminée.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-500/20">
                      <p className="text-xs text-muted-foreground">
                        ⏱️ L&apos;activation se fait généralement dans les 24 heures suivant votre paiement.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium mb-2">
                      {isExpired
                        ? 'Votre abonnement a expiré'
                        : 'Aucun abonnement actif'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isExpired
                        ? 'Pour renouveler votre abonnement, veuillez contacter l&apos;administrateur.'
                        : 'Pour activer votre abonnement, veuillez contacter l&apos;administrateur.'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      <span>L&apos;activation se fait uniquement par l&apos;administrateur</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique des paiements */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des paiements</CardTitle>
            <CardDescription>Vos derniers paiements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{payment.description || 'Paiement'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {payment.amount} {payment.currency}
                    </p>
                    <Badge
                      variant={
                        payment.status === 'succeeded'
                          ? 'default'
                          : payment.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {payment.status === 'succeeded'
                        ? 'Réussi'
                        : payment.status === 'pending'
                        ? 'En attente'
                        : 'Échoué'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
