-- Script complet pour ajouter toutes les policies RLS nécessaires
-- pour le système d'abonnement

-- =========================================
-- 1. CRÉER LA FONCTION is_admin (si elle n'existe pas)
-- =========================================

-- Créer une fonction pour vérifier si l'utilisateur est admin (évite la récursion)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Cette fonction lit directement depuis profiles sans passer par les policies RLS
  -- grâce à SECURITY DEFINER
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND account_type = 'admin'
  );
END;
$$;

-- =========================================
-- 2. POLICIES POUR LA TABLE subscriptions
-- =========================================

-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent (pour éviter les conflits)
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Admins can insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON subscriptions;

-- Policy pour permettre aux utilisateurs de voir leur propre abonnement
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy pour permettre aux admins de voir tous les abonnements
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR SELECT 
    USING (is_admin(auth.uid()));

-- Policy pour permettre aux utilisateurs d'insérer leur propre abonnement
CREATE POLICY "Users can insert own subscription" ON subscriptions
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy pour permettre aux admins d'insérer des abonnements (pour n'importe quel utilisateur)
CREATE POLICY "Admins can insert subscriptions" ON subscriptions
    FOR INSERT 
    WITH CHECK (is_admin(auth.uid()));

-- Policy pour permettre aux utilisateurs de mettre à jour leur propre abonnement
CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy pour permettre aux admins de mettre à jour tous les abonnements
CREATE POLICY "Admins can update all subscriptions" ON subscriptions
    FOR UPDATE 
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- =========================================
-- 3. POLICIES POUR LA TABLE payment_history
-- =========================================

-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent (pour éviter les conflits)
DROP POLICY IF EXISTS "Users can view own payment history" ON payment_history;
DROP POLICY IF EXISTS "Admins can view all payment history" ON payment_history;
DROP POLICY IF EXISTS "Users can insert own payment" ON payment_history;
DROP POLICY IF EXISTS "Admins can insert payments" ON payment_history;

-- Policy pour permettre aux utilisateurs de voir leur propre historique de paiement
CREATE POLICY "Users can view own payment history" ON payment_history
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy pour permettre aux admins de voir tous les paiements
CREATE POLICY "Admins can view all payment history" ON payment_history
    FOR SELECT 
    USING (is_admin(auth.uid()));

-- Policy pour permettre aux utilisateurs d'insérer leur propre paiement
CREATE POLICY "Users can insert own payment" ON payment_history
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy pour permettre aux admins d'insérer des paiements (pour n'importe quel utilisateur)
CREATE POLICY "Admins can insert payments" ON payment_history
    FOR INSERT 
    WITH CHECK (is_admin(auth.uid()));

-- =========================================
-- 4. VÉRIFICATION
-- =========================================

-- Vérifier les policies pour subscriptions
SELECT 
    'subscriptions' as table_name,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'subscriptions'
ORDER BY policyname;

-- Vérifier les policies pour payment_history
SELECT 
    'payment_history' as table_name,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'payment_history'
ORDER BY policyname;

-- Tester la fonction is_admin
SELECT 
    is_admin(auth.uid()) as current_user_is_admin,
    auth.uid() as current_user_id;
