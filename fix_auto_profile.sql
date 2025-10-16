-- =========================================
-- FIX : CRÉATION AUTOMATIQUE DES PROFILS
-- =========================================

-- Cette fonction crée automatiquement un profil
-- quand un utilisateur s'inscrit

-- 1. Créer la fonction
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Créer les profils manquants pour les users existants
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
SELECT 
  u.id, 
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  u.created_at,
  NOW()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4. Vérification
SELECT 
  u.email as "Email utilisateur",
  CASE WHEN p.id IS NOT NULL THEN '✅ Profil créé' ELSE '❌ Profil manquant' END as "Statut"
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

