-- =========================================
-- SCRIPT D'INSERTION DE DONNÉES DE TEST
-- TradingJournal - Données réalistes
-- =========================================

-- Note: Remplacez 'YOUR_USER_ID' par votre vrai ID utilisateur
-- Pour obtenir votre ID: SELECT id FROM auth.users WHERE email = 'votre@email.com';

-- Variable pour l'ID utilisateur (à remplacer)
-- DO $$
-- DECLARE
--     v_user_id UUID := 'YOUR_USER_ID'; -- REMPLACEZ ICI

-- =========================================
-- 1. INSTRUMENTS (déjà créés, mais on s'assure)
-- =========================================

INSERT INTO instruments (symbol, name, type, base_currency, quote_currency, pip_value, contract_size) VALUES
('EURUSD', 'Euro vs US Dollar', 'forex', 'EUR', 'USD', 0.0001, 100000),
('GBPUSD', 'British Pound vs US Dollar', 'forex', 'GBP', 'USD', 0.0001, 100000),
('USDJPY', 'US Dollar vs Japanese Yen', 'forex', 'USD', 'JPY', 0.01, 100000),
('AUDUSD', 'Australian Dollar vs US Dollar', 'forex', 'AUD', 'USD', 0.0001, 100000),
('USDCAD', 'US Dollar vs Canadian Dollar', 'forex', 'USD', 'CAD', 0.0001, 100000),
('BTCUSD', 'Bitcoin vs US Dollar', 'crypto', 'BTC', 'USD', 1, 1),
('ETHUSD', 'Ethereum vs US Dollar', 'crypto', 'ETH', 'USD', 1, 1),
('XAUUSD', 'Gold vs US Dollar', 'commodities', 'XAU', 'USD', 0.01, 100),
('XAGUSD', 'Silver vs US Dollar', 'commodities', 'XAG', 'USD', 0.01, 5000),
('SPX500', 'S&P 500 Index', 'indices', NULL, 'USD', 1, 1),
('NAS100', 'NASDAQ 100 Index', 'indices', NULL, 'USD', 1, 1),
('US30', 'Dow Jones Industrial Average', 'indices', NULL, 'USD', 1, 1)
ON CONFLICT (symbol) DO NOTHING;

-- =========================================
-- 2. STRATÉGIES DE TRADING
-- =========================================

-- Remplacez YOUR_USER_ID par votre ID utilisateur
INSERT INTO trading_strategies (user_id, name, description, entry_rules, exit_rules, timeframe, color, is_active) VALUES
('YOUR_USER_ID', 'Breakout', 'Stratégie de cassure de niveaux clés', 'Attendre la cassure d''un niveau de support/résistance avec confirmation', 'TP à 2:1 ou trailing stop', 'H1, H4', '#10b981', true),
('YOUR_USER_ID', 'Scalping', 'Trades rapides sur petits mouvements', 'Entrée sur repli dans la tendance', 'TP rapide 5-10 pips', 'M5, M15', '#3b82f6', true),
('YOUR_USER_ID', 'Swing Trading', 'Positions sur plusieurs jours', 'Identification de tendance + pullback', 'TP à résistance majeure', 'D1, W1', '#8b5cf6', true),
('YOUR_USER_ID', 'Mean Reversion', 'Retour à la moyenne', 'Surachat/survente sur RSI', 'Retour à la moyenne mobile', 'H4', '#f97316', true);

-- =========================================
-- 3. TRADES EXEMPLE (30 derniers jours)
-- =========================================

-- Trades gagnants
-- NOTE: net_profit est maintenant fourni manuellement (pas de calcul auto)
INSERT INTO trades (user_id, symbol, trade_type, lot_size, entry_price, exit_price, entry_time, exit_time, stop_loss, take_profit, commission, swap, gross_profit, net_profit, status, strategy_name, notes, emotion_before, emotion_after, discipline_score) VALUES
-- Semaine 1
('YOUR_USER_ID', 'EURUSD', 'long', 0.5, 1.0850, 1.0920, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days' + INTERVAL '4 hours', 1.0820, 1.0920, 7, 0, 350, 343, 'closed', 'Breakout', 'Cassure nette du niveau 1.0850 avec volume', 'confident', 'euphoric', 8),
('YOUR_USER_ID', 'GBPUSD', 'short', 0.3, 1.2650, 1.2580, NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days' + INTERVAL '6 hours', 1.2680, 1.2580, 5, -2, 210, 203, 'closed', 'Scalping', 'Scalp rapide sur résistance', 'neutral', 'confident', 7),
('YOUR_USER_ID', 'BTCUSD', 'long', 0.1, 42000, 43500, NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days', 41500, 44000, 15, 0, 150, 135, 'closed', 'Swing Trading', 'Position swing sur support majeur', 'confident', 'confident', 9),

-- Semaine 2
('YOUR_USER_ID', 'EURUSD', 'short', 0.8, 1.0880, 1.0810, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days' + INTERVAL '3 hours', 1.0910, 1.0810, 10, -3, 560, 547, 'closed', 'Mean Reversion', 'Surachat détecté sur RSI 75', 'confident', 'euphoric', 9),
('YOUR_USER_ID', 'XAUUSD', 'long', 0.5, 1950.00, 1965.00, NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days' + INTERVAL '8 hours', 1945.00, 1970.00, 8, 0, 750, 742, 'closed', 'Breakout', 'Or en forte tendance haussière', 'confident', 'euphoric', 10),
('YOUR_USER_ID', 'USDJPY', 'long', 0.4, 148.50, 149.20, NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days' + INTERVAL '5 hours', 148.20, 149.50, 6, 1, 280, 275, 'closed', 'Scalping', 'Scalp sur session Tokyo', 'neutral', 'confident', 7),

-- Semaine 3
('YOUR_USER_ID', 'EURUSD', 'long', 1.0, 1.0820, 1.0890, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '6 hours', 1.0790, 1.0900, 12, 0, 700, 688, 'closed', 'Breakout', 'Breakout sur news économiques', 'confident', 'euphoric', 8),
('YOUR_USER_ID', 'GBPUSD', 'long', 0.5, 1.2580, 1.2650, NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days' + INTERVAL '4 hours', 1.2550, 1.2680, 7, 0, 350, 343, 'closed', 'Swing Trading', 'Swing sur pullback de tendance', 'confident', 'confident', 9),
('YOUR_USER_ID', 'SPX500', 'long', 2.0, 4500, 4550, NOW() - INTERVAL '18 days', NOW() - INTERVAL '17 days', 4480, 4580, 20, 0, 100, 80, 'closed', 'Swing Trading', 'Position sur indice US', 'confident', 'confident', 8),

-- Semaine 4
('YOUR_USER_ID', 'EURUSD', 'short', 0.6, 1.0900, 1.0850, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '3 hours', 1.0930, 1.0850, 8, -1, 300, 291, 'closed', 'Mean Reversion', 'Retour à la moyenne', 'neutral', 'confident', 8),
('YOUR_USER_ID', 'BTCUSD', 'long', 0.15, 43000, 44200, NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', 42500, 45000, 18, 0, 180, 162, 'closed', 'Breakout', 'Cassure résistance crypto', 'confident', 'euphoric', 7),
('YOUR_USER_ID', 'XAUUSD', 'long', 0.8, 1960.00, 1975.00, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '7 hours', 1955.00, 1980.00, 12, 0, 1200, 1188, 'closed', 'Swing Trading', 'Position or long terme', 'confident', 'euphoric', 10);

-- Trades perdants (réalistes)
INSERT INTO trades (user_id, symbol, trade_type, lot_size, entry_price, exit_price, entry_time, exit_time, stop_loss, take_profit, commission, swap, gross_profit, net_profit, status, strategy_name, notes, emotion_before, emotion_after, discipline_score) VALUES
('YOUR_USER_ID', 'EURUSD', 'long', 0.5, 1.0870, 1.0835, NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days' + INTERVAL '2 hours', 1.0830, 1.0920, 7, 0, -175, -182, 'closed', 'Breakout', 'Faux breakout, stop loss touché', 'confident', 'frustrated', 6),
('YOUR_USER_ID', 'GBPUSD', 'short', 0.4, 1.2600, 1.2640, NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days' + INTERVAL '3 hours', 1.2650, 1.2550, 6, -1, -160, -167, 'closed', 'Scalping', 'Mauvais timing sur l''entrée', 'anxious', 'frustrated', 5),
('YOUR_USER_ID', 'USDJPY', 'short', 0.3, 149.00, 149.40, NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days' + INTERVAL '2 hours', 149.50, 148.50, 5, 0, -120, -125, 'closed', 'Scalping', 'Contre tendance, erreur', 'greedy', 'frustrated', 4),
('YOUR_USER_ID', 'BTCUSD', 'short', 0.1, 43500, 44000, NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days' + INTERVAL '5 hours', 44500, 42500, 15, 0, -50, -65, 'closed', 'Mean Reversion', 'Suivi la tendance trop tard', 'fearful', 'frustrated', 5),
('YOUR_USER_ID', 'XAUUSD', 'short', 0.5, 1970.00, 1980.00, NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days' + INTERVAL '4 hours', 1985.00, 1960.00, 8, 0, -500, -508, 'closed', 'Scalping', 'Pris à contre-pied', 'greedy', 'frustrated', 3);

-- Trades récents (dernière semaine)
INSERT INTO trades (user_id, symbol, trade_type, lot_size, entry_price, exit_price, entry_time, exit_time, stop_loss, take_profit, commission, swap, gross_profit, net_profit, status, strategy_name, notes, emotion_before, emotion_after, discipline_score) VALUES
('YOUR_USER_ID', 'EURUSD', 'long', 0.7, 1.0860, 1.0910, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '5 hours', 1.0830, 1.0920, 9, 0, 350, 341, 'closed', 'Breakout', 'Excellent setup sur H4', 'confident', 'confident', 9),
('YOUR_USER_ID', 'GBPUSD', 'long', 0.5, 1.2620, 1.2680, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '6 hours', 1.2590, 1.2700, 7, 0, 300, 293, 'closed', 'Swing Trading', 'Position swing bien planifiée', 'confident', 'confident', 10),
('YOUR_USER_ID', 'BTCUSD', 'long', 0.2, 44000, 45000, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 43500, 46000, 20, 0, 200, 180, 'closed', 'Breakout', 'Crypto en tendance haussière', 'confident', 'euphoric', 8),
('YOUR_USER_ID', 'XAUUSD', 'short', 0.6, 1975.00, 1968.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '4 hours', 1980.00, 1965.00, 10, 0, 420, 410, 'closed', 'Mean Reversion', 'Rejet sur résistance', 'confident', 'confident', 9);

-- Trade ouvert (en cours) - pas de profit pour les trades ouverts
INSERT INTO trades (user_id, symbol, trade_type, lot_size, entry_price, entry_time, stop_loss, take_profit, status, strategy_name, notes, emotion_before, discipline_score) VALUES
('YOUR_USER_ID', 'EURUSD', 'long', 0.5, 1.0875, NOW() - INTERVAL '3 hours', 1.0845, 1.0925, 'open', 'Breakout', 'Trade en cours, surveillé', 'confident', 8),
('YOUR_USER_ID', 'GBPUSD', 'short', 0.4, 1.2670, NOW() - INTERVAL '1 hour', 1.2700, 1.2620, 'open', 'Scalping', 'Scalp rapide', 'neutral', 7);

-- =========================================
-- 4. STRATÉGIES (avec statistiques)
-- =========================================

-- Les statistiques seront calculées automatiquement par les triggers

-- =========================================
-- 5. PLAN DE TRADING
-- =========================================

INSERT INTO trading_plans (user_id, title, description, trading_hours_start, trading_hours_end, trading_days, max_trades_per_day, max_risk_per_trade, max_daily_loss, daily_target, weekly_target, monthly_target, psychological_rules, pre_trade_checklist, is_active) VALUES
('YOUR_USER_ID', 
 'Plan Principal 2025', 
 'Mon plan de trading pour l''année 2025',
 '08:00:00',
 '17:00:00',
 ARRAY[1,2,3,4,5], -- Lundi à vendredi
 3,
 2.0,
 500.00,
 100.00,
 500.00,
 2000.00,
 ARRAY['Ne pas trader sous stress', 'Respecter le stop loss', 'Pas de revenge trading'],
 ARRAY['Vérifier le calendrier économique', 'Confirmer la tendance', 'Calculer le risk/reward', 'Définir SL et TP'],
 true);

-- =========================================
-- 6. JOURNAL PSYCHOLOGIQUE
-- =========================================

INSERT INTO journal_entries (user_id, entry_date, mood, energy_level, stress_level, confidence_level, what_went_well, what_to_improve, lessons_learned, followed_plan, discipline_score) VALUES
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '7 days', 'good', 8, 3, 8, 'Bien respecté mon plan, 3 trades gagnants', 'Sortir plus tôt sur le dernier trade', 'La patience paie toujours', true, 8),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '6 days', 'excellent', 9, 2, 9, 'Trade parfait sur EURUSD, discipline au top', 'Rien à redire', 'Suivre son plan = succès', true, 10),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '5 days', 'neutral', 6, 5, 6, 'Trade rentable mais stressant', 'Mieux gérer mes émotions', 'Ne pas overtrader', true, 7),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '3 days', 'bad', 5, 7, 4, 'Pertes dues à l''impatience', 'Attendre les bons setups', 'La discipline est cruciale', false, 4),
('YOUR_USER_ID', CURRENT_DATE - INTERVAL '1 day', 'good', 8, 3, 8, 'Retour à la discipline, 2 trades gagnants', 'Continuer comme ça', 'La patience et la discipline', true, 9)
ON CONFLICT (user_id, entry_date) DO NOTHING;

-- =========================================
-- 7. OBJECTIFS
-- =========================================

INSERT INTO goals (user_id, title, description, goal_type, period, target_value, current_value, unit, start_date, end_date, status) VALUES
('YOUR_USER_ID', 'Profit mensuel', 'Atteindre 2000$ de profit ce mois', 'profit', 'monthly', 2000, 1450, 'USD', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'active'),
('YOUR_USER_ID', 'Taux de réussite', 'Maintenir un win rate de 60%', 'win_rate', 'monthly', 60, 65, '%', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'active'),
('YOUR_USER_ID', 'Discipline', 'Score de discipline moyen de 8/10', 'discipline', 'weekly', 8, 7.5, 'score', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '4 days', 'active');

-- =========================================
-- 8. ÉVÉNEMENTS CALENDRIER
-- =========================================

INSERT INTO calendar_events (user_id, title, description, event_type, event_date, impact, affected_currencies) VALUES
('YOUR_USER_ID', 'FOMC Meeting', 'Réunion de la Fed - Taux d''intérêt', 'economic', NOW() + INTERVAL '2 days' + INTERVAL '14 hours', 'high', ARRAY['USD']),
('YOUR_USER_ID', 'NFP (Non-Farm Payrolls)', 'Rapport emploi US', 'economic', NOW() + INTERVAL '5 days' + INTERVAL '13.30 hours', 'high', ARRAY['USD']),
('YOUR_USER_ID', 'BCE Taux directeurs', 'Décision de taux BCE', 'economic', NOW() + INTERVAL '7 days' + INTERVAL '12.15 hours', 'high', ARRAY['EUR']),
('YOUR_USER_ID', 'Session Londres', 'Ouverture session Londres', 'custom', NOW() + INTERVAL '1 day' + INTERVAL '8 hours', 'medium', ARRAY['GBP', 'EUR']),
('YOUR_USER_ID', 'Revue hebdomadaire', 'Analyser les trades de la semaine', 'reminder', NOW() + INTERVAL '3 days' + INTERVAL '18 hours', 'low', NULL);

-- =========================================
-- 9. NOTIFICATIONS
-- =========================================

INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
('YOUR_USER_ID', 'Objectif atteint !', 'Vous avez atteint 70% de votre objectif mensuel', 'success', false),
('YOUR_USER_ID', 'Rappel', 'N''oubliez pas de remplir votre journal aujourd''hui', 'reminder', false),
('YOUR_USER_ID', 'Alerte risque', 'Attention : vous approchez de votre limite de perte quotidienne', 'warning', true);

-- =========================================
-- NOTES IMPORTANTES
-- =========================================

-- ⚠️ AVANT D'EXÉCUTER CE SCRIPT :
-- 
-- 1. Connectez-vous à votre application pour créer votre compte
-- 2. Récupérez votre ID utilisateur avec cette requête :
--    SELECT id, email FROM auth.users WHERE email = 'votre@email.com';
-- 
-- 3. Remplacez TOUTES les occurrences de 'YOUR_USER_ID' par votre vrai ID
--    Vous pouvez le faire avec Find & Replace dans l'éditeur SQL
-- 
-- 4. Exécutez ce script dans le SQL Editor de Supabase
--
-- Les statistiques des stratégies seront calculées automatiquement
-- grâce aux triggers SQL !

-- =========================================
-- FIN DU SCRIPT
-- =========================================

