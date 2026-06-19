# Session de développement — AppSuiviCamp

**Date :** 19 juin 2026
**Stack :** React 19 + Vite 8 + TypeScript + Tailwind CSS 4 + Supabase

---

## Résumé de la session

Création complète d'une application web de gestion de camp scout avec 10 modules, déployable sur Vercel/Netlify, avec mode hors ligne.

---

## Projet complet — Fichiers créés

### Configuration (racine)
| Fichier | Rôle |
|---|---|
| `vite.config.ts` | Config Vite avec alias `@/` et plugin Tailwind |
| `tsconfig.app.json` | Config TypeScript avec path alias |
| `.env.example` | Modèle pour les variables Supabase |
| `README.md` | Documentation d'installation et déploiement |
| `GUIDE_DEPLOIEMENT.md` | Guide pas à pas : local, GitHub, Netlify |
| `CHAT_SESSION.md` | Ce fichier — sauvegarde de la session |
| `package.json` | Dépendances et scripts |

### Cœur applicatif (`src/`)
| Fichier | Description |
|---|---|
| `lib/types.ts` | Types TypeScript : Campeur, Passage, Activite, Incident, Message, SyncAction |
| `lib/supabase.ts` | Client Supabase |
| `lib/db.ts` | Base IndexedDB avec Dexie.js (cache offline + file sync) |
| `contexts/AuthContext.tsx` | Contexte d'authentification avec rôles (admin/chef) |
| `contexts/OfflineContext.tsx` | Contexte hors ligne : cache, file d'attente, sync auto |

### Composants UI (`src/components/ui/`)
| Fichier | Description |
|---|---|
| `Button.tsx` | Boutons (primary, secondary, danger, ghost, outline + loading spinner) |
| `Card.tsx` | Cartes avec titre optionnel et onClick |
| `Input.tsx` | Input, Select, Textarea avec label et erreur |
| `Badge.tsx` | Badges (success, warning, danger, info, default) |
| `Modal.tsx` | Fenêtre modale |
| `EmptyState.tsx` | État vide avec icône |

### Layout (`src/components/layout/`)
| Fichier | Description |
|---|---|
| `AppLayout.tsx` | Layout principal avec barre connexion offline/online |
| `Sidebar.tsx` | Sidebar desktop (cachée sur mobile) |
| `BottomNav.tsx` | Navigation mobile en bas (6 onglets) |

### Pages (`src/pages/`)
| Fichier | Description |
|---|---|
| `Login.tsx` | Connexion email + mot de passe |
| `Dashboard.tsx` | Stats (total, présents, activités, incidents) + graphiques Recharts |
| `Campeurs/CampeurList.tsx` | Liste des campeurs, recherche, import/export XLSX |
| `Campeurs/CampeurForm.tsx` | Ajout/modification d'un campeur |
| `Campeurs/CampeurDetail.tsx` | Fiche détail + QR code + historique passages |
| `Activities/ActivityList.tsx` | Liste des activités groupées par date, import/export |
| `Activities/ActivityForm.tsx` | Ajout/modification d'activité |
| `Scanner.tsx` | Scan QR code + saisie manuelle + actions check-in/out |
| `Incidents/IncidentList.tsx` | Liste filtrable + résolution |
| `Incidents/IncidentForm.tsx` | Formulaire de signalement |
| `Messagerie/Messagerie.tsx` | Chat temps réel via Supabase Realtime |
| `Repas/Repas.tsx` | Alertes allergies et restrictions alimentaires |
| `Settings/Settings.tsx` | Profil, sync status, gestion utilisateurs |
| `Settings/UserManagement.tsx` | CRUD utilisateurs (admin uniquement) |

### Base de données
| Fichier | Description |
|---|---|
| `supabase/schema.sql` | Tables (profiles, campeurs, passages, activites, incidents, messages) + RLS + seed data |

---

## Commandes essentielles

```bash
# Installer les dépendances
npm install

# Lancer en développement (http://localhost:5173)
npm run dev

# Build pour production (dossier dist/)
npm run build

# Aperçu de la version buildée
npm run preview
```

## Dépendances installées

**Production :** `@supabase/supabase-js`, `@supabase/ssr`, `react-router-dom`, `dexie`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`, `html5-qrcode`, `xlsx`, `jspdf`, `jspdf-autotable`, `react-hot-toast`, `recharts`, `qrcode`, `tailwindcss`, `@tailwindcss/vite`

**Développement :** `@types/react`, `@types/react-dom`, `@types/qrcode`, `vite`, `typescript`

## Statut du build

✅ **Build réussi** — `tsc -b && vite build` passe sans erreur.

## Pour rouvrir le projet

1. Ouvrir VS Code :
   ```bash
   code "C:\Users\chris\OneDrive\Documents\PROJETS\PROD IA\AppSuiviCamp"
   ```

2. Lancer l'app :
   ```bash
   npm run dev
   ```

3. Naviguer sur `http://localhost:5173`
