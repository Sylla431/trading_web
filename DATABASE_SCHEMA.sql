-- =========================================
-- SCHÉMA DE BASE DE DONNÉES SUPABASE
-- Application Trading Journal
-- =========================================

-- Active les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- 1. GESTION DES UTILISATEURS
-- =========================================

-- Table des profils utilisateurs (extension de auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Préférences de trading
    default_currency TEXT DEFAULT 'USD',
    timezone TEXT DEFAULT 'UTC',
    preferred_broker TEXT,
    
    -- Paramètres de compte
    account_type TEXT DEFAULT 'individual' CHECK (account_type IN ('individual', 'coach', 'analyst', 'admin')),
    is_premium BOOLEAN DEFAULT FALSE,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
    subscription_expires_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    
    -- Sécurité
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Préférences UI
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'auto')),
    language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'es', 'de'))
);

-- Table des paramètres de trading de l'utilisateur
CREATE TABLE user_trading_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Risk management
    max_risk_per_trade DECIMAL(5,2) DEFAULT 2.0, -- Pourcentage
    max_daily_loss DECIMAL(10,2),
    max_leverage DECIMAL(5,2),
    default_lot_size DECIMAL(10,4),
    
    -- Objectifs
    daily_profit_target DECIMAL(10,2),
    weekly_profit_target DECIMAL(10,2),
    monthly_profit_target DECIMAL(10,2),
    
    -- Paramètres par défaut
    default_sl_pips INTEGER,
    default_tp_pips INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =========================================
-- 2. GESTION DES INSTRUMENTS DE TRADING
-- =========================================

CREATE TABLE instruments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    symbol TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('forex', 'crypto', 'stocks', 'commodities', 'indices', 'futures', 'options')),
    base_currency TEXT,
    quote_currency TEXT,
    pip_value DECIMAL(10,6),
    contract_size DECIMAL(15,4),
    min_lot_size DECIMAL(10,4),
    max_lot_size DECIMAL(10,4),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 3. STRATÉGIES DE TRADING (doit être avant trades)
-- =========================================

CREATE TABLE trading_strategies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    
    -- Règles
    entry_rules TEXT,
    exit_rules TEXT,
    risk_management_rules TEXT,
    
    -- Paramètres
    timeframe TEXT,
    instruments TEXT[], -- Instruments compatibles
    session_preference TEXT, -- 'london', 'new_york', 'tokyo', 'sydney', 'all'
    
    -- Statistiques
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2),
    average_profit DECIMAL(15,4),
    profit_factor DECIMAL(10,4),
    
    -- Tags et couleur
    color TEXT, -- Couleur pour l'UI
    tags TEXT[],
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 4. GESTION DES TRADES
-- =========================================

CREATE TABLE trades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Informations de base
    instrument_id UUID REFERENCES instruments(id),
    symbol TEXT NOT NULL, -- Stocké aussi pour éviter les joins
    broker TEXT,
    account_number TEXT,
    
    -- Type de trade
    trade_type TEXT NOT NULL CHECK (trade_type IN ('long', 'short')),
    order_type TEXT CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')),
    
    -- Tailles et volumes
    lot_size DECIMAL(10,4) NOT NULL,
    position_size DECIMAL(15,4),
    contract_count INTEGER,
    
    -- Prix
    entry_price DECIMAL(15,6) NOT NULL,
    exit_price DECIMAL(15,6),
    stop_loss DECIMAL(15,6),
    take_profit DECIMAL(15,6),
    
    -- Dates et heures
    entry_time TIMESTAMPTZ NOT NULL,
    exit_time TIMESTAMPTZ,
    
    -- Résultats
    gross_profit DECIMAL(15,4),
    commission DECIMAL(10,4) DEFAULT 0,
    swap DECIMAL(10,4) DEFAULT 0,
    net_profit DECIMAL(15,4),
    profit_percentage DECIMAL(10,4),
    
    -- Pips/Points
    pips DECIMAL(10,2),
    points DECIMAL(10,2),
    
    -- Statistiques
    duration_minutes INTEGER,
    mae DECIMAL(15,4), -- Maximum Adverse Excursion
    mfe DECIMAL(15,4), -- Maximum Favorable Excursion
    
    -- Stratégie et tags
    strategy_id UUID REFERENCES trading_strategies(id),
    strategy_name TEXT,
    tags TEXT[], -- Array de tags
    
    -- Notes et commentaires
    notes TEXT,
    lesson_learned TEXT,
    
    -- Émotions
    emotion_before TEXT CHECK (emotion_before IN ('confident', 'neutral', 'anxious', 'fearful', 'greedy', 'euphoric', 'frustrated')),
    emotion_after TEXT CHECK (emotion_after IN ('confident', 'neutral', 'anxious', 'fearful', 'greedy', 'euphoric', 'frustrated')),
    discipline_score INTEGER CHECK (discipline_score BETWEEN 1 AND 10),
    
    -- Captures d'écran
    screenshots TEXT[], -- Array d'URLs
    
    -- Statut
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
    
    -- Import
    imported_from TEXT, -- 'manual', 'mt4', 'mt5', 'csv', 'tradingview', etc.
    external_id TEXT, -- ID externe du broker
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_entry_time ON trades(entry_time DESC);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_strategy ON trades(strategy_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);

-- =========================================
-- 5. PLANS DE TRADING
-- =========================================

CREATE TABLE trading_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    
    -- Règles générales
    trading_hours_start TIME,
    trading_hours_end TIME,
    trading_days INTEGER[], -- 1-7 (lundi-dimanche)
    
    -- Money management
    max_trades_per_day INTEGER,
    max_trades_per_week INTEGER,
    max_risk_per_trade DECIMAL(5,2),
    max_daily_loss DECIMAL(10,2),
    max_position_size DECIMAL(10,2),
    
    -- Objectifs
    daily_target DECIMAL(10,2),
    weekly_target DECIMAL(10,2),
    monthly_target DECIMAL(10,2),
    yearly_target DECIMAL(10,2),
    
    -- Règles psychologiques
    psychological_rules TEXT[],
    
    -- Checklist avant trade
    pre_trade_checklist TEXT[],
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 6. JOURNAL PSYCHOLOGIQUE
-- =========================================

CREATE TABLE journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    entry_date DATE NOT NULL,
    
    -- État mental et émotionnel
    mood TEXT CHECK (mood IN ('excellent', 'good', 'neutral', 'bad', 'terrible')),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 10),
    
    -- Réflexion
    what_went_well TEXT,
    what_to_improve TEXT,
    lessons_learned TEXT,
    market_analysis TEXT,
    
    -- Respect du plan
    followed_plan BOOLEAN,
    discipline_score INTEGER CHECK (discipline_score BETWEEN 1 AND 10),
    mistakes_made TEXT[],
    
    -- Notes générales
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, entry_date)
);

CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, entry_date DESC);

-- =========================================
-- 7. CALENDRIER & ÉVÉNEMENTS
-- =========================================

CREATE TABLE calendar_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT CHECK (event_type IN ('economic', 'earnings', 'dividend', 'custom', 'alert', 'reminder')),
    
    -- Date et heure
    event_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    all_day BOOLEAN DEFAULT FALSE,
    
    -- Impact (pour événements économiques)
    impact TEXT CHECK (impact IN ('low', 'medium', 'high')),
    affected_currencies TEXT[],
    affected_instruments TEXT[],
    
    -- Alertes
    alert_before_minutes INTEGER,
    is_alerted BOOLEAN DEFAULT FALSE,
    
    -- Données externes
    source TEXT,
    external_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX idx_calendar_events_user ON calendar_events(user_id, event_date);

-- =========================================
-- 8. OBJECTIFS
-- =========================================

CREATE TABLE goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    
    goal_type TEXT CHECK (goal_type IN ('profit', 'win_rate', 'trade_count', 'discipline', 'custom')),
    period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    
    -- Valeurs cibles
    target_value DECIMAL(15,4),
    current_value DECIMAL(15,4) DEFAULT 0,
    unit TEXT, -- 'USD', '%', 'trades', etc.
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Statut
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
    completed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_user_period ON goals(user_id, period, status);

-- =========================================
-- 9. NOTIFICATIONS
-- =========================================

CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error', 'reminder')),
    
    -- Lien d'action
    action_url TEXT,
    action_label TEXT,
    
    -- Statut
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Métadonnées
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- =========================================
-- 10. IMPORTS & EXPORTS
-- =========================================

CREATE TABLE import_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    source TEXT NOT NULL, -- 'mt4', 'mt5', 'csv', 'tradingview', etc.
    file_name TEXT,
    file_url TEXT,
    
    -- Résultats
    total_rows INTEGER,
    imported_rows INTEGER,
    failed_rows INTEGER,
    error_log JSONB,
    
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- =========================================
-- 11. PARTAGE & COMMUNAUTÉ (Optionnel)
-- =========================================

CREATE TABLE shared_trades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
    
    title TEXT,
    description TEXT,
    
    -- Visibilité
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Statistiques sociales
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(trade_id)
);

CREATE TABLE trade_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shared_trade_id UUID REFERENCES shared_trades(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    comment TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trade_likes (
    shared_trade_id UUID REFERENCES shared_trades(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (shared_trade_id, user_id)
);

-- =========================================
-- 12. ABONNEMENTS & PAIEMENTS
-- =========================================

CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    
    plan TEXT CHECK (plan IN ('free', 'pro', 'premium')),
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'unpaid')),
    
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    stripe_payment_intent_id TEXT UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 13. AUDIT LOG
-- =========================================

CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    
    old_values JSONB,
    new_values JSONB,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);

-- =========================================
-- FONCTIONS & TRIGGERS
-- =========================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables concernées
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON trading_strategies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON trading_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_updated_at BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer les statistiques d'un trade à la fermeture
CREATE OR REPLACE FUNCTION calculate_trade_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'closed' AND NEW.exit_price IS NOT NULL THEN
        -- Calculer la durée
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.exit_time - NEW.entry_time)) / 60;
        
        -- Calculer le profit/perte brut
        IF NEW.trade_type = 'long' THEN
            NEW.gross_profit = (NEW.exit_price - NEW.entry_price) * NEW.position_size;
        ELSE
            NEW.gross_profit = (NEW.entry_price - NEW.exit_price) * NEW.position_size;
        END IF;
        
        -- Calculer le profit net
        NEW.net_profit = NEW.gross_profit - COALESCE(NEW.commission, 0) - COALESCE(NEW.swap, 0);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_trade_metrics_trigger BEFORE INSERT OR UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION calculate_trade_metrics();

-- Fonction pour mettre à jour les statistiques de stratégie
CREATE OR REPLACE FUNCTION update_strategy_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_strategy_id UUID;
BEGIN
    IF NEW.status = 'closed' AND NEW.strategy_id IS NOT NULL THEN
        v_strategy_id = NEW.strategy_id;
        
        UPDATE trading_strategies SET
            total_trades = (SELECT COUNT(*) FROM trades WHERE strategy_id = v_strategy_id AND status = 'closed'),
            winning_trades = (SELECT COUNT(*) FROM trades WHERE strategy_id = v_strategy_id AND status = 'closed' AND net_profit > 0),
            losing_trades = (SELECT COUNT(*) FROM trades WHERE strategy_id = v_strategy_id AND status = 'closed' AND net_profit < 0),
            win_rate = (SELECT (COUNT(*) FILTER (WHERE net_profit > 0)::DECIMAL / NULLIF(COUNT(*), 0) * 100) FROM trades WHERE strategy_id = v_strategy_id AND status = 'closed'),
            average_profit = (SELECT AVG(net_profit) FROM trades WHERE strategy_id = v_strategy_id AND status = 'closed')
        WHERE id = v_strategy_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_strategy_stats_trigger AFTER INSERT OR UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION update_strategy_stats();

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trading_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policies pour trades
CREATE POLICY "Users can view own trades" ON trades
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON trades
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" ON trades
    FOR DELETE USING (auth.uid() = user_id);

-- Policies similaires pour les autres tables
CREATE POLICY "Users can manage own strategies" ON trading_strategies
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own plans" ON trading_plans
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own journal" ON journal_entries
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own calendar" ON calendar_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON goals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- =========================================
-- DONNÉES DE RÉFÉRENCE
-- =========================================

-- Insérer quelques instruments de trading populaires
INSERT INTO instruments (symbol, name, type, base_currency, quote_currency, pip_value, contract_size) VALUES
('EURUSD', 'Euro vs US Dollar', 'forex', 'EUR', 'USD', 0.0001, 100000),
('GBPUSD', 'British Pound vs US Dollar', 'forex', 'GBP', 'USD', 0.0001, 100000),
('USDJPY', 'US Dollar vs Japanese Yen', 'forex', 'USD', 'JPY', 0.01, 100000),
('BTCUSD', 'Bitcoin vs US Dollar', 'crypto', 'BTC', 'USD', 1, 1),
('ETHUSD', 'Ethereum vs US Dollar', 'crypto', 'ETH', 'USD', 1, 1),
('XAUUSD', 'Gold vs US Dollar', 'commodities', 'XAU', 'USD', 0.01, 100),
('SPX500', 'S&P 500 Index', 'indices', NULL, 'USD', 1, 1),
('NAS100', 'NASDAQ 100 Index', 'indices', NULL, 'USD', 1, 1);

