-- Vérifier le statut d'abonnement d'un utilisateur spécifique
-- Remplacez 'ms97970707@gmail.com' par l'email de l'utilisateur à vérifier

SELECT 
  p.id,
  p.email,
  p.full_name,
  p.account_type,
  p.is_premium,
  p.subscription_tier,
  p.subscription_expires_at,
  CASE 
    WHEN p.subscription_expires_at IS NULL THEN 'Aucun abonnement'
    WHEN p.subscription_expires_at > NOW() THEN 'Actif'
    ELSE 'Expiré'
  END as statut_abonnement,
  CASE 
    WHEN p.subscription_expires_at IS NOT NULL 
    THEN EXTRACT(DAY FROM (p.subscription_expires_at - NOW()))
    ELSE NULL
  END as jours_restants,
  CASE
    WHEN p.account_type = 'admin' THEN 'ADMIN - Accès autorisé'
    WHEN p.subscription_expires_at IS NULL THEN 'PAS D''ABONNEMENT - Accès refusé'
    WHEN p.subscription_expires_at > NOW() THEN 'ABONNEMENT ACTIF - Accès autorisé'
    ELSE 'ABONNEMENT EXPIRÉ - Accès refusé'
  END as acces_attendu
FROM profiles p
WHERE p.email = 'ms97970707@gmail.com';

-- Vérifier aussi dans la table subscriptions
SELECT 
  s.id,
  s.user_id,
  s.plan,
  s.status,
  s.current_period_start,
  s.current_period_end,
  p.email
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
WHERE p.email = 'ms97970707@gmail.com';

-- Mettre à jour le compte_type si nécessaire (pour retirer les droits admin)
-- ATTENTION: Ne décommentez que si vous voulez retirer les droits admin
-- UPDATE profiles 
-- SET account_type = 'individual'
-- WHERE email = 'ms97970707@gmail.com' AND account_type = 'admin';
