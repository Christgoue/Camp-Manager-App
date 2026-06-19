# AppSuiviCamp

Application web de gestion de camp scout — développée avec React + Vite + Supabase.

## Fonctionnalités

- Authentification sécurisée (admin / chef d'unité)
- Tableau de bord avec graphiques et alertes
- Gestion complète des campeurs (CRUD, import/export CSV/XLSX, QR code)
- Contrôle d'accès (check-in/check-out par scan QR ou manuel)
- Gestion des activités avec calendrier
- Signalement et suivi des incidents
- Messagerie interne temps réel
- Gestion des repas et alertes allergies
- Mode hors ligne avec synchronisation automatique (Dexie.js)
- Export XLSX et PDF

## Stack technique

- **Frontend** : React 19 + Vite 8 + TypeScript + Tailwind CSS 4
- **Backend/Base de données** : Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Hors ligne** : Dexie.js (IndexedDB)
- **UI** : Lucide React, Recharts
- **Export** : SheetJS (XLSX), jsPDF
- **QR Code** : html5-qrcode, qrcode

## Prérequis

- Node.js 18+
- Un compte Supabase (gratuit)

## Installation

```bash
# 1. Cloner le dépôt
git clone <url-du-depot>
cd appsuivicamp

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Configurer les variables d'environnement
#    Renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
```

## Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Dans l'éditeur SQL, exécutez le contenu de `supabase/schema.sql`
3. Activez l'authentification par email dans Authentication > Settings
4. Récupérez l'URL et la clé anon dans Settings > API
5. Activez Realtime pour les tables `messages`, `campeurs`, `passages`, `incidents`

## Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

## Déploiement (Vercel)

```bash
npm run build
```

Ou déployez directement depuis GitHub :

1. Connectez votre repo à Vercel
2. Ajoutez les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
3. Déployez

## Création du premier admin

1. Dans Supabase > Authentication > Users, créez un utilisateur
2. Dans l'éditeur SQL :
```sql
update public.profiles set role = 'admin' where email = 'votre@email.com';
```

## Structure du projet

```
src/
├── components/
│   ├── layout/       # AppLayout, Sidebar, BottomNav
│   └── ui/           # Button, Card, Input, Modal, Badge...
├── contexts/         # AuthContext, OfflineContext
├── hooks/            # Hooks personnalisés
├── lib/              # Supabase client, Dexie DB, types
└── pages/
    ├── Campeurs/     # Gestion des campeurs
    ├── Activities/   # Gestion des activités
    ├── Incidents/    # Signalement d'incidents
    ├── Messagerie/   # Messagerie interne
    ├── Repas/        # Gestion des repas
    └── Settings/     # Paramètres et gestion utilisateurs
```

## Licence

MIT
