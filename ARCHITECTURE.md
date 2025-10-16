# 🏗️ Architecture - Application Trading Journal

## 📋 Vue d'ensemble

Application web moderne de journal de trading construite avec :
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Charts**: Recharts / Chart.js
- **UI Components**: shadcn/ui
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table
- **Dates**: date-fns
- **Icons**: Lucide React

## 🗂️ Structure des dossiers

```
trading_web/
├── src/
│   ├── app/                      # Pages Next.js (App Router)
│   │   ├── (auth)/              # Routes d'authentification
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── verify-email/
│   │   ├── (dashboard)/         # Routes protégées
│   │   │   ├── dashboard/       # Tableau de bord principal
│   │   │   ├── trades/          # Gestion des trades
│   │   │   ├── analytics/       # Analyses et statistiques
│   │   │   ├── calendar/        # Calendrier de trading
│   │   │   ├── journal/         # Journal psychologique
│   │   │   ├── plan/            # Plan de trading
│   │   │   ├── settings/        # Paramètres utilisateur
│   │   │   └── admin/           # Administration
│   │   ├── api/                 # API Routes
│   │   │   ├── import/          # Import CSV/MT5
│   │   │   ├── export/          # Export données
│   │   │   └── webhooks/        # Webhooks externes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/              # Composants réutilisables
│   │   ├── ui/                  # Composants UI de base (shadcn)
│   │   ├── auth/                # Composants d'authentification
│   │   ├── trades/              # Composants de gestion des trades
│   │   ├── analytics/           # Composants de visualisation
│   │   ├── calendar/            # Composants de calendrier
│   │   ├── layout/              # Navigation, Header, Sidebar
│   │   └── shared/              # Composants partagés
│   ├── lib/                     # Utilitaires et configurations
│   │   ├── supabase/            # Configuration Supabase
│   │   │   ├── client.ts        # Client Supabase
│   │   │   ├── server.ts        # Server Supabase
│   │   │   └── middleware.ts    # Middleware auth
│   │   ├── utils/               # Fonctions utilitaires
│   │   ├── hooks/               # Hooks personnalisés
│   │   ├── constants/           # Constantes
│   │   └── validations/         # Schémas Zod
│   ├── types/                   # Types TypeScript
│   │   ├── database.types.ts    # Types générés Supabase
│   │   ├── trade.types.ts
│   │   ├── user.types.ts
│   │   └── analytics.types.ts
│   └── contexts/                # Contextes React
│       ├── AuthContext.tsx
│       ├── ThemeContext.tsx
│       └── TradeContext.tsx
├── supabase/
│   ├── migrations/              # Migrations SQL
│   ├── functions/               # Edge Functions
│   └── seed.sql                 # Données de test
├── public/
│   └── assets/
└── docs/
    ├── ARCHITECTURE.md
    ├── DATABASE.md
    └── API.md
```

## 🔐 Authentification

### Flux d'authentification
1. **Inscription**: Email + mot de passe / OAuth (Google, etc.)
2. **Vérification email**: Lien de confirmation
3. **Connexion**: Session Supabase
4. **2FA**: TOTP via authenticator app
5. **Récupération**: Reset password par email

### Protection des routes
- Middleware Next.js pour vérifier l'authentification
- Routes publiques: `/`, `/login`, `/register`
- Routes protégées: `/dashboard/*`

## 📊 Gestion des données

### Modèle de données principal

**Users** (Supabase Auth + profil étendu)
- Informations de base
- Préférences (devise, timezone, broker)
- Paramètres de trading
- Abonnement

**Trades**
- Détails du trade (instrument, type, prix, etc.)
- Résultat et statistiques
- Tags et stratégies
- Captures d'écran

**Journal Entries**
- Réflexions quotidiennes
- État émotionnel
- Discipline score

**Trading Plans**
- Stratégies
- Règles de money management
- Objectifs

**Calendrier**
- Événements économiques
- Alertes de trading

## 🎨 Thème et UI

### Design System
- **Thème sombre par défaut** (préférence utilisateur)
- Thème clair optionnel
- Palette de couleurs cohérente
- Composants accessibles (WCAG 2.1)

### Responsive Design
- Mobile-first
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- PWA ready

## 🔄 État de l'application

### Gestion de l'état
- **Server State**: Supabase Realtime + React Query
- **Client State**: React Context
- **Form State**: React Hook Form

### Cache et performance
- React Query pour le cache
- ISR (Incremental Static Regeneration) pour les pages statiques
- Edge caching avec Supabase

## 🚀 Performance

### Optimisations
- Code splitting automatique (Next.js)
- Image optimization (next/image)
- Lazy loading des composants
- Virtualisation des grandes listes
- Compression des assets

## 🔒 Sécurité

### Mesures de sécurité
- HTTPS obligatoire
- Row Level Security (RLS) Supabase
- Validation côté serveur
- Protection CSRF
- Rate limiting
- Sanitization des inputs
- Conformité RGPD

## 📈 Monitoring et Analytics

### Outils
- Vercel Analytics
- Sentry pour error tracking
- Supabase Analytics
- Custom event tracking

## 🌐 Internationalisation

### Support multilingue (optionnel)
- i18next
- Détection automatique de la langue
- Traductions FR/EN au minimum

## 💳 Monétisation

### Plans d'abonnement
- **Free**: Limité (ex: 50 trades/mois)
- **Pro**: Illimité + analyses avancées
- **Premium**: Tout + intégrations automatiques

### Paiements
- Stripe pour les abonnements
- Webhooks pour synchronisation
- Gestion des périodes d'essai

## 🔧 DevOps

### CI/CD
- GitHub Actions
- Tests automatisés
- Déploiement automatique sur Vercel
- Preview deployments

### Tests
- Unit tests: Jest + React Testing Library
- E2E tests: Playwright
- API tests: Supertest

## 📱 Progressive Web App

### Fonctionnalités PWA
- Manifest.json
- Service Worker
- Offline support
- Push notifications
- Installable sur mobile/desktop

