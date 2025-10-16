# 🚀 Guide de démarrage - TradingJournal

## 📋 Ce qui a été créé

Félicitations ! Votre application de journal de trading est maintenant structurée avec :

### ✅ Infrastructure de base
- ✅ Next.js 15 + React 19 + TypeScript
- ✅ Tailwind CSS avec thème sombre par défaut
- ✅ Configuration Supabase complète
- ✅ Middleware d'authentification
- ✅ Architecture de dossiers organisée

### ✅ Système d'authentification
- ✅ Page de connexion (`/login`)
- ✅ Page d'inscription (`/register`)
- ✅ Connexion avec Google (OAuth)
- ✅ Context d'authentification React
- ✅ Protection des routes
- ✅ Callback OAuth

### ✅ Interface utilisateur
- ✅ Page d'accueil avec présentation
- ✅ Dashboard principal avec statistiques
- ✅ Sidebar de navigation
- ✅ Composants UI réutilisables (Button, Card, Input)
- ✅ Design system avec variables CSS
- ✅ Thème sombre/clair avec next-themes
- ✅ Notifications avec Sonner

### ✅ Base de données
- ✅ Schéma SQL complet avec :
  - Tables pour profils utilisateurs
  - Tables pour trades
  - Tables pour stratégies
  - Tables pour journal psychologique
  - Tables pour calendrier et événements
  - Tables pour objectifs
  - Tables pour notifications
  - Tables pour abonnements (Stripe)
  - Row Level Security (RLS)
  - Triggers et fonctions automatiques

## 🛠️ Configuration initiale

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Attendez que le projet soit prêt (environ 2 minutes)

### 2. Configurer la base de données

1. Dans Supabase, allez dans **SQL Editor**
2. Copiez tout le contenu du fichier `DATABASE_SCHEMA.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur "Run" pour créer toutes les tables

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# Dans le terminal
touch .env.local
```

Puis ajoutez vos clés Supabase (trouvables dans **Settings** > **API**) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TradingJournal
```

### 4. Configurer l'authentification Google (optionnel)

Dans Supabase :

1. Allez dans **Authentication** > **Providers**
2. Activez **Google**
3. Suivez les instructions pour créer un projet Google OAuth
4. Ajoutez l'URL de callback : `https://votre-projet.supabase.co/auth/v1/callback`

### 5. Lancer l'application en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
trading_web/
├── src/
│   ├── app/                    # Pages Next.js
│   │   ├── login/             # Page de connexion
│   │   ├── register/          # Page d'inscription
│   │   ├── dashboard/         # Dashboard protégé
│   │   │   ├── trades/        # [À créer] Gestion des trades
│   │   │   ├── analytics/     # [À créer] Analyses
│   │   │   ├── journal/       # [À créer] Journal psycho
│   │   │   ├── calendar/      # [À créer] Calendrier
│   │   │   ├── plan/          # [À créer] Plan de trading
│   │   │   └── settings/      # [À créer] Paramètres
│   │   ├── auth/callback/     # Callback OAuth
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Page d'accueil
│   ├── components/
│   │   ├── ui/                # Composants UI de base
│   │   ├── layout/            # Sidebar, Header
│   │   ├── trades/            # [À créer] Composants trades
│   │   ├── analytics/         # [À créer] Graphiques
│   │   └── shared/            # [À créer] Composants partagés
│   ├── lib/
│   │   ├── supabase/          # Configuration Supabase
│   │   ├── utils/             # Fonctions utilitaires
│   │   └── hooks/             # [À créer] Hooks personnalisés
│   ├── contexts/
│   │   └── AuthContext.tsx    # Context d'authentification
│   └── types/                 # Types TypeScript
├── middleware.ts              # Middleware Next.js
├── DATABASE_SCHEMA.sql        # Schéma de BDD complet
└── package.json
```

## 🎯 Prochaines étapes de développement

### Phase 1 : Gestion des trades (Prioritaire)

1. **Page liste des trades** (`/dashboard/trades`)
   - Table avec TanStack Table
   - Filtres (date, symbole, statut, stratégie)
   - Recherche
   - Pagination

2. **Formulaire d'ajout de trade**
   - Modal ou page séparée
   - Tous les champs du schéma
   - Validation avec Zod
   - Upload d'images (screenshots)

3. **Détails d'un trade**
   - Vue complète
   - Édition
   - Suppression

4. **Import CSV/MT5**
   - Upload de fichier
   - Parsing avec PapaParse
   - Mapping des colonnes
   - Import batch

### Phase 2 : Analytics et statistiques

1. **Page d'analyses** (`/dashboard/analytics`)
   - Statistiques générales
   - Equity curve (Recharts)
   - Distribution des gains/pertes
   - Analyse par :
     - Stratégie
     - Instrument
     - Jour de la semaine
     - Heure de la journée
     - Émotions

2. **Graphiques avancés**
   - Heatmap de performance
   - Graphiques radar
   - Comparaisons temporelles

### Phase 3 : Journal psychologique

1. **Page journal** (`/dashboard/journal`)
   - Entrées quotidiennes
   - Suivi émotionnel
   - Notes et réflexions
   - Score de discipline

2. **Analyse psychologique**
   - Corrélation émotions/performance
   - Patterns récurrents

### Phase 4 : Calendrier et événements

1. **Calendrier interactif** (`/dashboard/calendar`)
   - Vue mensuelle/hebdomadaire
   - Événements économiques (API externe)
   - Trades planifiés
   - Alertes

### Phase 5 : Plan de trading

1. **Gestion des plans** (`/dashboard/plan`)
   - Créer/éditer des plans
   - Règles de trading
   - Objectifs
   - Checklist pré-trade

2. **Suivi des objectifs**
   - Progression vers objectifs
   - Alertes d'objectifs atteints

### Phase 6 : Paramètres et profil

1. **Page paramètres** (`/dashboard/settings`)
   - Profil utilisateur
   - Préférences
   - 2FA
   - Gestion du compte

### Phase 7 : Fonctionnalités avancées

1. **Notifications**
   - Push notifications
   - Emails
   - Alertes personnalisées

2. **Export de données**
   - PDF
   - Excel
   - Rapports automatiques

3. **Partage et communauté** (optionnel)
   - Partage de trades
   - Leaderboard
   - Forum

4. **Monétisation**
   - Intégration Stripe
   - Plans d'abonnement
   - Gestion des paiements

## 💻 Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint

# Générer les types Supabase (après installation de supabase CLI)
npx supabase gen types typescript --project-id "votre-project-id" > src/types/database.types.ts
```

## 🚀 Déploiement

### Déployer sur Vercel

1. Poussez votre code sur GitHub
2. Allez sur [vercel.com](https://vercel.com)
3. Importez votre repository
4. Ajoutez les variables d'environnement
5. Déployez !

### Variables d'environnement sur Vercel

Dans les paramètres du projet Vercel, ajoutez :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (votre URL Vercel)

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Recharts Documentation](https://recharts.org)

## 🐛 Dépannage

### Erreur de connexion Supabase
- Vérifiez que vos clés dans `.env.local` sont correctes
- Vérifiez que le schéma SQL a bien été exécuté
- Vérifiez les policies RLS dans Supabase

### Erreur OAuth Google
- Vérifiez la configuration dans Supabase
- Vérifiez l'URL de callback
- Vérifiez que le provider est activé

### Erreur de build
- Supprimez `node_modules` et `.next`
- Réinstallez : `npm install`
- Rebuild : `npm run build`

## 🎨 Personnalisation

### Couleurs du thème

Modifiez les variables CSS dans `src/app/globals.css` :

```css
:root {
  --primary: 142 76% 36%; /* Votre couleur primaire */
  --profit: 142 76% 36%;  /* Couleur pour les profits */
  --loss: 0 84.2% 60.2%;  /* Couleur pour les pertes */
}
```

### Logo

Remplacez le texte "TradingJournal" dans :
- `src/app/page.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/app/layout.tsx` (metadata)

## 📝 Prochaine session de développement

Pour continuer le développement, je recommande de commencer par :

1. **Créer la page de gestion des trades** avec :
   - Liste des trades
   - Formulaire d'ajout
   - Hooks personnalisés pour Supabase

2. **Implémenter les hooks de données** :
   - `useTradesQuery` pour récupérer les trades
   - `useTradesActions` pour CRUD trades
   - `useTradeStats` pour les statistiques

3. **Créer les composants de visualisation** :
   - Table de trades avec TanStack Table
   - Graphiques avec Recharts

Voulez-vous que je continue avec l'une de ces fonctionnalités ?

