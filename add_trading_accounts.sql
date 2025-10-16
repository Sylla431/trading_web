-- =========================================
-- MIGRATION: Ajout de la gestion multi-comptes
-- =========================================

-- Table des comptes de trading
CREATE TABLE IF NOT EXISTS trading_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Informations du compte
    account_name TEXT NOT NULL,
    broker TEXT,
    account_number TEXT,
    account_type TEXT CHECK (account_type IN ('demo', 'real', 'paper')),
    currency TEXT DEFAULT 'USD',
    
    -- Soldes
    initial_balance DECIMAL(15,4),
    current_balance DECIMAL(15,4),
    
    -- Métadonnées
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte unique: un compte par nom et user
    UNIQUE(user_id, account_name)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_active ON trading_accounts(user_id, is_active);

-- Ajouter account_id à la table trades (si la colonne n'existe pas déjà)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'account_id'
    ) THEN
        ALTER TABLE trades ADD COLUMN account_id UUID REFERENCES trading_accounts(id) ON DELETE SET NULL;
        CREATE INDEX idx_trades_account_id ON trades(account_id);
    END IF;
END $$;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_trading_accounts_updated_at BEFORE UPDATE ON trading_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS pour trading_accounts
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON trading_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON trading_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON trading_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON trading_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour mettre à jour le solde du compte automatiquement
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.account_id IS NOT NULL AND NEW.status = 'closed' AND NEW.net_profit IS NOT NULL THEN
        UPDATE trading_accounts 
        SET current_balance = COALESCE(current_balance, initial_balance, 0) + NEW.net_profit
        WHERE id = NEW.account_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le solde (optionnel, vous pouvez le désactiver)
CREATE TRIGGER update_account_balance_trigger AFTER INSERT OR UPDATE ON trades
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Insérer un compte par défaut pour les utilisateurs existants (optionnel)
-- INSERT INTO trading_accounts (user_id, account_name, account_type, currency, is_active)
-- SELECT id, 'Compte Principal', 'real', 'USD', true
-- FROM profiles
-- WHERE NOT EXISTS (
--     SELECT 1 FROM trading_accounts WHERE trading_accounts.user_id = profiles.id
-- );

