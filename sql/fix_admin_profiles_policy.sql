-- Fix: Supprimer les anciennes policies qui causent la récursion infinie
-- et créer de nouvelles policies avec une fonction SECURITY DEFINER

-- Étape 1: Supprimer les anciennes policies qui causent la récursion (si elles existent)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Étape 2: Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS is_admin(UUID);

-- Étape 3: Créer une fonction pour vérifier si l'utilisateur est admin
-- Cette fonction utilise SECURITY DEFINER pour contourner les policies RLS
-- et éviter la récursion infinie
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

-- Étape 4: Créer les nouvelles policies qui utilisent la fonction
-- Policy pour permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT 
    USING (is_admin(auth.uid()));

-- Policy pour permettre aux admins de mettre à jour tous les profils
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE 
    USING (is_admin(auth.uid()));

-- Étape 5: Vérifier les policies existantes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Étape 6: Tester la fonction
SELECT is_admin(auth.uid()) as current_user_is_admin;
