-- Ajouter les policies RLS pour la table payment_history
-- Cette table stocke l'historique des paiements

-- Vérifier si RLS est activé
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre aux utilisateurs de voir leur propre historique de paiement
CREATE POLICY "Users can view own payment history" ON payment_history
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy pour permettre aux admins de voir tous les paiements
-- Utilise la fonction is_admin() créée précédemment
CREATE POLICY "Admins can view all payment history" ON payment_history
    FOR SELECT 
    USING (is_admin(auth.uid()));

-- Policy pour permettre aux utilisateurs d'insérer leur propre paiement
-- (nécessaire pour les webhooks Stripe par exemple)
CREATE POLICY "Users can insert own payment" ON payment_history
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy pour permettre aux admins d'insérer des paiements
CREATE POLICY "Admins can insert payments" ON payment_history
    FOR INSERT 
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
WHERE tablename = 'payment_history'
ORDER BY policyname;
