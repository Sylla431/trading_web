'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { activateSubscription } from '@/lib/services/subscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Search, CreditCard, CheckCircle, AlertCircle, Clock, User, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  subscription_tier: string
  is_premium: boolean
  subscription_expires_at: string | null
}

export default function AdminSubscriptionsPage() {
  const { profile } = useAuth()
  const [searchEmail, setSearchEmail] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [activating, setActivating] = useState(false)
  const [amount, setAmount] = useState('29.99')
  const [loading, setLoading] = useState(false)

  // Vérifier si l'utilisateur est admin
  const isAdmin = profile?.account_type === 'admin'

  // Charger tous les utilisateurs au chargement
  const loadAllUsers = async () => {
    if (!isAdmin) return
    
    setLoading(true)
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, subscription_tier, is_premium, subscription_expires_at, created_at, account_type')
        .order('created_at', { ascending: false })
        .limit(50) // Limiter à 50 utilisateurs pour les performances

      if (error) {
        console.error('❌ Erreur Supabase lors du chargement des utilisateurs:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        toast.error(`Erreur: ${error.message}. Vérifiez les policies RLS pour les admins.`)
        throw error
      }

      console.log('📋 Liste des utilisateurs chargée:', data?.length || 0)
      setSearchResults(data || [])
      
      if (data && data.length > 0) {
        toast.success(`${data.length} utilisateur(s) chargé(s)`)
      } else {
        toast.info('Aucun utilisateur trouvé dans la base de données.')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      toast.error('Erreur lors du chargement des utilisateurs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Accès refusé. Vous devez être administrateur.')
    } else {
      // Charger automatiquement tous les utilisateurs au chargement de la page
      loadAllUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  // Réinitialiser le montant seulement quand on sélectionne un nouvel utilisateur différent
  const [lastSelectedUserId, setLastSelectedUserId] = useState<string | null>(null)
  useEffect(() => {
    if (selectedUser && selectedUser.id !== lastSelectedUserId) {
      // Réinitialiser le montant à la valeur par défaut seulement pour un nouvel utilisateur
      setAmount('29.99')
      setLastSelectedUserId(selectedUser.id)
    } else if (!selectedUser) {
      setLastSelectedUserId(null)
    }
  }, [selectedUser?.id, lastSelectedUserId])

  const searchUser = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Rechercher dans profiles (qui sont automatiquement créés depuis auth.users)
      // Les profils sont créés automatiquement via le trigger on_auth_user_created
      let query = supabase
        .from('profiles')
        .select('id, email, full_name, subscription_tier, is_premium, subscription_expires_at, created_at')
        .order('created_at', { ascending: false })
        .limit(20)

      // Si un terme de recherche est fourni, filtrer par email ou nom
      if (searchEmail.trim()) {
        query = query.or(`email.ilike.%${searchEmail.trim()}%,full_name.ilike.%${searchEmail.trim()}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Erreur Supabase lors de la recherche:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        toast.error(`Erreur: ${error.message}. Vérifiez les policies RLS pour les admins.`)
        throw error
      }

      const users = data as UserProfile[] || []
      console.log('🔍 Résultats de recherche:', users.length)
      setSearchResults(users)
      
      if (users.length === 0) {
        if (searchEmail.trim()) {
          toast.info('Aucun utilisateur trouvé avec ce critère de recherche.')
        } else {
          toast.info('Aucun utilisateur trouvé dans la base de données.')
        }
      } else {
        if (searchEmail.trim()) {
          toast.success(`${users.length} utilisateur(s) trouvé(s)`)
        } else {
          toast.success(`${users.length} utilisateur(s) au total`)
        }
        // Afficher les détails dans la console pour debug
        users.forEach((user, index) => {
          console.log(`Utilisateur ${index + 1}:`, {
            email: user.email,
            full_name: user.full_name,
            is_premium: user.is_premium,
            subscription_tier: user.subscription_tier,
            subscription_expires_at: user.subscription_expires_at,
          })
        })
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      toast.error('Erreur lors de la recherche. Vérifiez que les profils sont bien créés.')
    } finally {
      setLoading(false)
    }
  }

  const handleActivateSubscription = async (userId: string) => {
    // Normaliser le montant (remplacer virgule par point)
    const normalizedAmount = amount.replace(',', '.')
    const amountValue = parseFloat(normalizedAmount)
    
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      toast.error('Veuillez entrer un montant valide')
      return
    }

    setActivating(true)
    try {
      const result = await activateSubscription(
        userId,
        1, // 1 mois
        'cash', // Paiement en espèces
        amountValue,
        'Paiement en espèces - Activation manuelle'
      )

      if (result.success) {
        toast.success('Abonnement activé avec succès !', {
          description: `Montant: ${amountValue.toFixed(2)} USD - Durée: 1 mois`,
        })
        setSelectedUser(null)
        setAmount('29.99')
        // Recharger les résultats de recherche
        if (searchEmail.trim()) {
          await searchUser()
        } else {
          await loadAllUsers()
        }
      } else {
        toast.error(result.error || 'Erreur lors de l\'activation')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setActivating(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null
    const now = new Date()
    const expiration = new Date(expiresAt)
    const diff = expiration.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  // La vérification d'accès admin est gérée par le layout admin
  // On affiche juste un message si l'utilisateur n'est pas admin (ne devrait jamais arriver)
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Accès refusé
            </CardTitle>
            <CardDescription>
              Vous devez être administrateur pour accéder à cette page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des abonnements</h1>
        <p className="text-muted-foreground mt-2">
          Activez les abonnements pour les paiements en espèces
        </p>
      </div>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Liste des utilisateurs
          </CardTitle>
          <CardDescription>
            Tous les utilisateurs avec leur statut d&apos;abonnement. Cliquez sur un utilisateur pour activer son abonnement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recherche */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Rechercher par email ou nom..."
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value)
                  // Recherche en temps réel
                  if (e.target.value.trim()) {
                    searchUser()
                  } else {
                    // Si le champ est vide, recharger tous les utilisateurs
                    loadAllUsers()
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchUser()
                  }
                }}
              />
            </div>
            <Button onClick={searchUser} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Recherche...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </>
              )}
            </Button>
            <Button onClick={loadAllUsers} disabled={loading} variant="outline">
              <User className="w-4 h-4 mr-2" />
              Recharger
            </Button>
          </div>

          {/* Liste des utilisateurs */}
          {loading && searchResults.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chargement des utilisateurs...</p>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {searchEmail.trim() ? `Résultats de recherche (${searchResults.length})` : `Tous les utilisateurs (${searchResults.length})`}
              </p>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {searchResults.map((user) => {
                  const daysRemaining = getDaysRemaining(user.subscription_expires_at)
                  const isExpired = daysRemaining !== null && daysRemaining <= 0

                  return (
                    <div
                      key={user.id}
                      className="p-4 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name || 'Sans nom'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              ID: {user.id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              user.is_premium && !isExpired
                                ? 'default'
                                : isExpired
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {user.is_premium && !isExpired
                              ? 'Actif'
                              : isExpired
                              ? 'Expiré'
                              : 'Inactif'}
                          </Badge>
                          <div className="mt-1 space-y-1">
                            {user.subscription_expires_at ? (
                              <p className="text-xs text-muted-foreground">
                                {daysRemaining !== null && daysRemaining > 0
                                  ? `${daysRemaining} jours restants`
                                  : 'Expiré'}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">Pas d&apos;abonnement</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Tier: {user.subscription_tier || 'free'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm font-medium text-muted-foreground">
                  {searchEmail.trim() ? 'Aucun utilisateur trouvé avec ce critère de recherche.' : 'Aucun utilisateur trouvé dans la base de données.'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulaire d'activation en popup */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between flex-shrink-0 border-b">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Activer l&apos;abonnement
                </CardTitle>
                <CardDescription>
                  Pour: {selectedUser.full_name || 'Sans nom'} ({selectedUser.email})
                </CardDescription>
              </div>
                  <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setSelectedUser(null)
                  // Ne pas réinitialiser le montant pour préserver la valeur saisie
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Statut actuel:</span>
                  <Badge
                    variant={
                      selectedUser.is_premium &&
                      getDaysRemaining(selectedUser.subscription_expires_at) !== null &&
                      (getDaysRemaining(selectedUser.subscription_expires_at) || 0) > 0
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {selectedUser.is_premium &&
                    getDaysRemaining(selectedUser.subscription_expires_at) !== null &&
                    (getDaysRemaining(selectedUser.subscription_expires_at) || 0) > 0
                      ? 'Actif'
                      : 'Inactif'}
                  </Badge>
                </div>
                {selectedUser.subscription_expires_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expire le:</span>
                    <span className="text-sm font-medium">
                      {formatDate(selectedUser.subscription_expires_at)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant du paiement (USD)</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => {
                    // Permettre la virgule ou le point comme séparateur décimal
                    let value = e.target.value.replace(',', '.')
                    // Ne garder que les chiffres et un point décimal
                    value = value.replace(/[^0-9.]/g, '')
                    // Ne garder qu'un seul point décimal
                    const parts = value.split('.')
                    if (parts.length > 2) {
                      value = parts[0] + '.' + parts.slice(1).join('')
                    }
                    setAmount(value)
                  }}
                  placeholder="29.99"
                />
              </div>

              {/* Résumé de l'activation */}
              {amount && (() => {
                const normalizedAmount = amount.replace(',', '.')
                const amountValue = parseFloat(normalizedAmount)
                return !isNaN(amountValue) && amountValue > 0
              })() && (
                <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Résumé de l'activation:</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Montant:</span>
                    <span className="font-semibold">
                      {parseFloat(amount.replace(',', '.')).toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Durée:</span>
                    <span className="font-semibold">1 mois</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Nouvelle date d'expiration:</span>
                    <span className="font-semibold">
                      {formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleActivateSubscription(selectedUser.id)}
                  disabled={
                    activating ||
                    (selectedUser.is_premium &&
                      getDaysRemaining(selectedUser.subscription_expires_at) !== null &&
                      (getDaysRemaining(selectedUser.subscription_expires_at) || 0) > 0)
                  }
                  className="flex-1"
                >
                  {activating ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Activation...
                    </>
                  ) : selectedUser.is_premium &&
                    getDaysRemaining(selectedUser.subscription_expires_at) !== null &&
                    (getDaysRemaining(selectedUser.subscription_expires_at) || 0) > 0 ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Déjà actif
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activer l&apos;abonnement (1 mois)
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(null)
                    // Ne pas réinitialiser le montant pour préserver la valeur saisie
                  }}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
