-- =========================================
-- NETTOYER ET RÉINSÉRER LES DONNÉES
-- =========================================

-- Remplacez YOUR_USER_ID par votre ID : 9da23660-3d9f-49ad-bcea-ed5c13f816d9

-- 1. SUPPRIMER TOUTES VOS DONNÉES DE TEST
DELETE FROM notifications WHERE user_id = 'YOUR_USER_ID';
DELETE FROM calendar_events WHERE user_id = 'YOUR_USER_ID';
DELETE FROM goals WHERE user_id = 'YOUR_USER_ID';
DELETE FROM journal_entries WHERE user_id = 'YOUR_USER_ID';
DELETE FROM trading_plans WHERE user_id = 'YOUR_USER_ID';
DELETE FROM trades WHERE user_id = 'YOUR_USER_ID';
DELETE FROM trading_strategies WHERE user_id = 'YOUR_USER_ID';

-- 2. VÉRIFICATION
SELECT 'Données supprimées' as message;

-- 3. MAINTENANT, EXÉCUTEZ seed_data.sql
-- (avec votre ID à la place de YOUR_USER_ID)

