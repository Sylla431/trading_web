# Configuration des variables d'environnement

## Créer le fichier .env.local

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TradingJournal

# Stripe Configuration (optionnel - pour les paiements)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Obtenir vos clés Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (gardez-la secrète!)

## Créer la base de données

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Copiez le contenu du fichier `DATABASE_SCHEMA.sql`
3. Exécutez le SQL pour créer toutes les tables, fonctions et policies

## Configuration OAuth (optionnel)

Pour activer la connexion Google :

1. Dans Supabase, allez dans **Authentication** > **Providers**
2. Activez **Google**
3. Suivez les instructions pour configurer Google OAuth

