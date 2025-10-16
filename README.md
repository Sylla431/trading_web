# 📊 TradingJournal - Application Web de Journal de Trading

Application web complète de gestion de journal de trading construite avec Next.js, React, TypeScript et Supabase.

## 🎯 Vue d'ensemble

**TradingJournal** est une application professionnelle permettant aux traders de :
- 📝 Enregistrer et gérer leurs trades (manuel ou import automatique)
- 📊 Analyser leurs performances avec des statistiques avancées
- 🧠 Suivre leur état psychologique et émotionnel
- 📅 Planifier leurs sessions de trading
- 🎯 Définir et suivre leurs objectifs
- 📈 Visualiser leur progression avec des graphiques interactifs

## ✅ Fonctionnalités implémentées

### 🔐 Authentification complète
- ✅ Inscription / Connexion par email et mot de passe
- ✅ Authentification OAuth avec Google
- ✅ Protection des routes avec middleware
- ✅ Gestion des sessions avec Supabase Auth
- ✅ Context React pour l'état d'authentification
- ✅ Callback OAuth configuré

### 💼 Gestion des trades
- ✅ Ajout manuel de trades avec formulaire complet
- ✅ Liste de tous les trades avec tableau interactif
- ✅ Suppression de trades
- ✅ Calcul automatique des profits/pertes
- ✅ Filtrage par statut (ouvert/fermé/annulé)
- ✅ Support pour long/short
- ✅ Gestion des émotions avant/après trade
- ✅ Notes et stratégies

### 📊 Analyses et statistiques
- ✅ Dashboard avec statistiques principales
- ✅ Courbe de capital (equity curve)
- ✅ Distribution des gains/pertes
- ✅ Statistiques détaillées :
  - Taux de réussite
  - Profit Factor
  - Drawdown maximal
  - Meilleur/pire trade
  - Gain/perte moyenne
  - Durée moyenne des trades
  - Performance quotidienne

### 🎨 Interface utilisateur
- ✅ Design moderne et responsive
- ✅ Thème sombre par défaut (configurable)
- ✅ Navigation avec sidebar
- ✅ Composants UI réutilisables (shadcn/ui style)
- ✅ Notifications toast (Sonner)
- ✅ Chargement et états d'erreur
- ✅ Formulaires avec validation (Zod + React Hook Form)

### 🗄️ Base de données
- ✅ Schéma SQL complet avec Supabase
- ✅ Tables pour profils, trades, stratégies, journal, etc.
- ✅ Row Level Security (RLS) configurée
- ✅ Triggers pour calculs automatiques
- ✅ Fonctions SQL pour statistiques

## 🛠️ Stack technique

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Graphiques**: Recharts
- **Formulaires**: React Hook Form + Zod
- **UI Components**: Composants personnalisés inspirés de shadcn/ui
- **Notifications**: Sonner
- **Dates**: date-fns
- **Icons**: Lucide React

## 📁 Structure du projet

```
trading_web/
├── src/
│   ├── app/                           # Pages Next.js
│   │   ├── (auth pages)              # Login, Register
│   │   ├── dashboard/                # Pages protégées
│   │   │   ├── page.tsx              ✅ Dashboard principal
│   │   │   ├── trades/page.tsx       ✅ Gestion des trades
│   │   │   ├── analytics/page.tsx    ✅ Analyses et stats
│   │   │   ├── journal/              ⏳ Journal psychologique
│   │   │   ├── calendar/             ⏳ Calendrier
│   │   │   ├── plan/                 ⏳ Plan de trading
│   │   │   └── settings/             ⏳ Paramètres
│   │   ├── auth/callback/            ✅ Callback OAuth
│   │   ├── layout.tsx                ✅ Layout principal
│   │   └── page.tsx                  ✅ Page d'accueil
│   ├── components/
│   │   ├── ui/                       ✅ Composants de base
│   │   ├── layout/                   ✅ Sidebar, Navigation
│   │   ├── trades/                   ✅ Formulaire de trade
│   │   ├── analytics/                ✅ Graphiques
│   │   └── shared/                   ⏳ Composants partagés
│   ├── lib/
│   │   ├── supabase/                 ✅ Config Supabase
│   │   ├── utils/                    ✅ Utilitaires
│   │   ├── hooks/                    ✅ Hooks personnalisés
│   │   └── validations/              ✅ Schémas Zod
│   ├── contexts/                     ✅ React Contexts
│   └── types/                        ✅ Types TypeScript
├── DATABASE_SCHEMA.sql               ✅ Schéma de BDD complet
├── ARCHITECTURE.md                   ✅ Documentation architecture
├── GUIDE_DEMARRAGE.md               ✅ Guide de démarrage
└── README.md                        ✅ Ce fichier

✅ = Implémenté  |  ⏳ = À implémenter
```

## 🚀 Installation et configuration

### 1. Cloner le projet

```bash
cd /Users/macpro/IdeaProjects/trading_web
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Supabase

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Dans le SQL Editor, exécutez le contenu de `DATABASE_SCHEMA.sql`
4. Récupérez vos clés API dans **Settings** > **API**

### 4. Configurer les variables d'environnement

Créez un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TradingJournal
```

### 5. Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📖 Guide d'utilisation

### 1. Créer un compte

1. Allez sur la page d'accueil
2. Cliquez sur "Commencer gratuitement"
3. Remplissez le formulaire d'inscription
4. Ou utilisez "Continuer avec Google"

### 2. Ajouter un trade

1. Dans le dashboard, cliquez sur "Ajouter un trade"
2. Remplissez les informations :
   - Symbole (EURUSD, BTCUSD, etc.)
   - Type (Long/Short)
   - Taille du lot
   - Prix d'entrée/sortie
   - Stop Loss / Take Profit
   - Dates
   - Notes et stratégie
3. Cliquez sur "Ajouter le trade"

### 3. Voir les analyses

1. Allez dans "Analyses" depuis le menu
2. Consultez vos statistiques :
   - Taux de réussite
   - Profit Factor
   - Courbe de capital
   - Distribution des gains/pertes
   - Et bien plus...

## 📊 Base de données

Le schéma de base de données inclut :

### Tables principales
- `profiles` - Profils utilisateurs
- `trades` - Enregistrement des trades
- `trading_strategies` - Stratégies de trading
- `trading_plans` - Plans de trading
- `journal_entries` - Journal psychologique
- `calendar_events` - Événements et calendrier
- `goals` - Objectifs de trading
- `notifications` - Notifications
- `subscriptions` - Abonnements (Stripe)

### Fonctionnalités de BDD
- ✅ Row Level Security (RLS)
- ✅ Triggers automatiques
- ✅ Fonctions de calcul
- ✅ Indexes optimisés
- ✅ Audit logs

## 🎨 Personnalisation

### Changer les couleurs

Modifiez les variables CSS dans `src/app/globals.css` :

```css
:root {
  --primary: 142 76% 36%;  /* Votre couleur primaire */
  --profit: 142 76% 36%;   /* Couleur profits */
  --loss: 0 84.2% 60.2%;   /* Couleur pertes */
}
```

### Ajouter un logo

Remplacez "TradingJournal" par votre logo dans :
- `src/components/layout/Sidebar.tsx`
- `src/app/page.tsx`

## 🔮 Fonctionnalités à venir

### Journal psychologique
- Entrées quotidiennes
- Suivi émotionnel
- Corrélation émotions/performance

### Calendrier de trading
- Événements économiques
- Sessions de trading
- Alertes personnalisées

### Plan de trading
- Création de plans
- Règles de money management
- Checklist pré-trade

### Paramètres avancés
- Authentification 2FA
- Gestion du profil
- Préférences utilisateur

### Import/Export
- Import CSV depuis MT4/MT5
- Import depuis TradingView
- Export PDF des rapports
- Export Excel

### Fonctionnalités premium
- Intégration Stripe
- Abonnements
- Analyses avancées
- API publique

## 🚀 Déploiement

### Déployer sur Vercel

1. Push votre code sur GitHub
2. Allez sur [vercel.com](https://vercel.com)
3. Importez votre repository
4. Configurez les variables d'environnement
5. Déployez !

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée
- [DATABASE_SCHEMA.sql](./DATABASE_SCHEMA.sql) - Schéma complet de la BDD
- [GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md) - Guide complet de démarrage
- [ENV_SETUP.md](./ENV_SETUP.md) - Configuration des variables d'environnement

## 🤝 Contribution

Ce projet est un template de base. N'hésitez pas à :
- Ajouter de nouvelles fonctionnalités
- Améliorer le design
- Optimiser les performances
- Corriger les bugs

## 📝 Licence

Ce projet est sous licence MIT.

## 🙏 Remerciements

Construit avec :
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)
- [shadcn/ui](https://ui.shadcn.com) (inspiration)

---

**Développé avec ❤️ pour les traders**

Pour toute question ou support, consultez la documentation ou ouvrez une issue.
