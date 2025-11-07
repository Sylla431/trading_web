import { createClient } from '@/lib/supabase/client'

export interface SubscriptionStatus {
  isActive: boolean
  daysRemaining: number | null
  expiresAt: string | null
  isExpired: boolean
}

/**
 * Vérifie le statut de l'abonnement d'un utilisateur
 */
export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const supabase = createClient()

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_expires_at, is_premium, subscription_tier, account_type')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ Erreur lors de la récupération du profil:', error)
      throw error
    }

    const profileData = profile as {
      subscription_expires_at: string | null
      is_premium: boolean
      subscription_tier: string
      account_type: string
    } | null

    // Les administrateurs ont toujours accès, pas besoin d'abonnement
    if (profileData?.account_type === 'admin') {
      console.log('✅ Utilisateur ADMIN - Accès autorisé sans abonnement')
      return {
        isActive: true,
        daysRemaining: null,
        expiresAt: null,
        isExpired: false,
      }
    }

    const expiresAt = profileData?.subscription_expires_at
    const now = new Date()
    const expirationDate = expiresAt ? new Date(expiresAt) : null

    console.log('🔍 Vérification abonnement:', {
      userId,
      expiresAt,
      expirationDate: expirationDate?.toISOString(),
      now: now.toISOString(),
      is_premium: profileData?.is_premium,
      subscription_tier: profileData?.subscription_tier,
    })
    
    // Log spécial si subscription_expires_at est null
    if (!expirationDate) {
      console.log('⚠️ ATTENTION - subscription_expires_at est NULL pour userId:', userId)
    }

    // Si pas de date d'expiration, l'abonnement n'est pas actif
    if (!expirationDate) {
      console.log('⚠️ Pas de date d\'expiration - Abonnement inactif')
      // Mettre à jour le profil si nécessaire
      if (profileData?.is_premium) {
        await supabase
          .from('profiles')
          .update({
            is_premium: false,
            subscription_tier: 'free',
          } as never)
          .eq('id', userId)
      }

      return {
        isActive: false,
        daysRemaining: null,
        expiresAt: null,
        isExpired: true,
      }
    }

    const isExpired = expirationDate < now
    const daysRemaining = isExpired
      ? 0
      : Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    console.log('📊 Calcul statut:', {
      isExpired,
      daysRemaining,
      isActive: !isExpired && daysRemaining > 0,
    })

    // Si l'abonnement a expiré, mettre à jour le profil
    if (isExpired && profileData?.is_premium) {
      console.log('⏰ Abonnement expiré - Mise à jour du profil')
      await supabase
        .from('profiles')
        .update({
          is_premium: false,
          subscription_tier: 'free',
        } as never)
        .eq('id', userId)
    }

    const isActive = !isExpired && daysRemaining > 0

    return {
      isActive,
      daysRemaining: isExpired ? 0 : daysRemaining,
      expiresAt: expiresAt || null,
      isExpired,
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du statut d\'abonnement:', error)
    // En cas d'erreur, considérer que l'abonnement n'est pas actif
    return {
      isActive: false,
      daysRemaining: null,
      expiresAt: null,
      isExpired: true,
    }
  }
}

/**
 * Active un abonnement pour un utilisateur
 */
export async function activateSubscription(
  userId: string,
  durationMonths: number = 1,
  paymentMethod: 'stripe' | 'cash' = 'stripe',
  amount?: number,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // Calculer la date d'expiration
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths)

    // Mettre à jour le profil
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_expires_at: expiresAt.toISOString(),
        is_premium: true,
        subscription_tier: 'pro',
      } as never)
      .eq('id', userId)

    if (profileError) throw profileError

    // Créer ou mettre à jour l'entrée dans subscriptions
    // Note: Utiliser .maybeSingle() au lieu de .single() pour gérer le cas où il n'y a pas d'entrée
    const { data: existingSubscription, error: selectError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la recherche de subscription:', selectError)
      throw selectError
    }

    const subscriptionData = {
      user_id: userId,
      plan: 'pro' as const,
      status: 'active' as const,
      current_period_start: new Date().toISOString(),
      current_period_end: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (existingSubscription) {
      const subscription = existingSubscription as { id: string }
      console.log('📝 Mise à jour subscription existante:', subscription.id)
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update(subscriptionData as never)
        .eq('id', subscription.id)

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour de subscription:', updateError)
        throw updateError
      }
    } else {
      console.log('➕ Création nouvelle subscription pour userId:', userId)
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert(subscriptionData as never)

      if (insertError) {
        console.error('❌ Erreur lors de l\'insertion de subscription:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        })
        throw insertError
      }
    }

    // Enregistrer le paiement dans payment_history
    if (amount !== undefined) {
      const { error: paymentError } = await supabase
        .from('payment_history')
        .insert({
          user_id: userId,
          amount: amount,
          currency: 'XOF',
          status: 'succeeded' as const,
          description: description || (paymentMethod === 'cash' ? 'Paiement en espèces' : 'Paiement Stripe'),
          stripe_payment_intent_id: paymentMethod === 'stripe' ? undefined : null,
        } as never)

      if (paymentError) {
        console.error('Erreur lors de l\'enregistrement du paiement:', paymentError)
        // Ne pas faire échouer l'activation si l'enregistrement du paiement échoue
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de l\'activation de l\'abonnement:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Prolonge un abonnement existant
 */
export async function extendSubscription(
  userId: string,
  months: number = 1
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // Récupérer la date d'expiration actuelle
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_expires_at')
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    const profileData = profile as {
      subscription_expires_at: string | null
    } | null

    // Calculer la nouvelle date d'expiration
    const currentExpiresAt = profileData?.subscription_expires_at
      ? new Date(profileData.subscription_expires_at)
      : new Date()

    const newExpiresAt = new Date(currentExpiresAt)
    newExpiresAt.setMonth(newExpiresAt.getMonth() + months)

    // Mettre à jour le profil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_expires_at: newExpiresAt.toISOString(),
        is_premium: true,
        subscription_tier: 'pro',
      } as never)
      .eq('id', userId)

    if (updateError) throw updateError

    // Mettre à jour l'entrée dans subscriptions
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        current_period_end: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .eq('user_id', userId)

    if (subscriptionError) throw subscriptionError

    return { success: true }
  } catch (error) {
    console.error('Erreur lors de la prolongation de l\'abonnement:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
