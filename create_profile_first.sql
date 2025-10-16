-- =========================================
-- CRÉER LE PROFIL UTILISATEUR D'ABORD
-- =========================================

-- Remplacez ces valeurs par les vôtres :
-- ID : votre ID depuis auth.users
-- EMAIL : votre email

INSERT INTO profiles (id, email, full_name, default_currency, timezone, theme, language)
VALUES (
  '9da23660-3d9f-49ad-bcea-ed5c13f816d9',  -- REMPLACEZ par votre ID
  'votre@email.com',                        -- REMPLACEZ par votre email
  'Votre Nom',                              -- REMPLACEZ par votre nom
  'USD',
  'Europe/Paris',
  'dark',
  'fr'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Vérifier que le profil est créé
SELECT id, email, full_name FROM profiles WHERE id = '9da23660-3d9f-49ad-bcea-ed5c13f816d9';

