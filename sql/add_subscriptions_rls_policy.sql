-- Ajouter les policies RLS pour la table subscriptions
-- Cette table stocke l'historique des abonnements

-- Vérifier si RLS est activé
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre aux utilisateurs de voir leur propre abonnement
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy pour permettre aux admins de voir tous les abonnements
-- Utilise la fonction is_admin() créée précédemment
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR SELECT 
    USING (is_admin(auth.uid()));

-- Policy pour permettre aux utilisateurs d'insérer leur propre abonnement
-- (nécessaire pour les webhooks Stripe par exemple)
CREATE POLICY "Users can insert own subscription" ON subscriptions
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy pour permettre aux admins d'insérer des abonnements
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

-- Vérifier les policies existantes
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
WHERE tablename = 'subscriptions'
ORDER BY policyname;
