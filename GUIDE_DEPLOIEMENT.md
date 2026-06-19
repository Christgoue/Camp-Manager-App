# Guide complet : Installation, GitHub, Netlify

---

## Table des matières

1. [Prérequis](#1-prérequis)
2. [Comprendre le fichier .env](#2-comprendre-le-fichier-env)
3. [Lancer l'application en local](#3-lancer-lapplication-en-local)
4. [Héberger sur GitHub](#4-héberger-sur-github)
5. [Déployer sur Netlify](#5-déployer-sur-netlify)
6. [Annexe : Commandes utiles](#6-annexe-commandes-utiles)

---

## 1. Prérequis

Avant de commencer, tu dois installer ces deux outils sur ton PC :

### 1.1 Node.js (obligatoire)

Node.js permet d'exécuter du JavaScript en dehors du navigateur. C'est le moteur qui fait tourner l'application en développement.

➡️ Télécharge et installe Node.js (version 18 ou plus) :  
🔗 https://nodejs.org/

👉 Après installation, vérifie que c'est ok en ouvrant un terminal (PowerShell) :

```bash
node --version
```

Tu dois voir un numéro de version, par exemple : `v24.16.0`

👉 Vérifie aussi que npm est installé (npm = Node Package Manager, l'outil qui télécharge les librairies) :

```bash
npm --version
```

### 1.2 Git (obligatoire pour GitHub)

Git permet de suivre les modifications du code et de l'envoyer sur GitHub.

➡️ Télécharge et installe Git :  
🔗 https://git-scm.com/downloads

👉 Vérifie l'installation :

```bash
git --version
```

### 1.3 Un éditeur de code (recommandé)

VS Code est le plus simple pour modifier les fichiers :  
🔗 https://code.visualstudio.com/

---

## 2. Comprendre le fichier .env

### 2.1 C'est quoi un fichier .env ?

Le fichier `.env` (prononce "dot env") est un fichier de **configuration secrète**. Il contient des informations que ton application a besoin pour fonctionner, mais qu'on ne veut PAS partager publiquement.

**Exemple concret :** C'est comme le code PIN de ta carte bancaire. Tu dois le connaître pour retirer de l'argent, mais tu ne vas pas l'écrire sur un post-it collé à ta carte.

### 2.2 Que contient le .env de cette app ?

```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anonyme
```

- **VITE_SUPABASE_URL** : L'adresse web de ta base de données Supabase (le "numéro de téléphone" de la base)
- **VITE_SUPABASE_ANON_KEY** : La clé qui permet à l'app de se connecter à la base (le "mot de passe" de connexion)

> 💡 Le préfixe `VITE_` est obligatoire quand on utilise Vite (l'outil qui construit l'application). Sans ce préfixe, l'application ne pourra pas lire ces variables.

### 2.3 Pourquoi ne pas mettre ces infos directement dans le code ?

- **Sécurité** : Si tu publies ton code sur GitHub (publique), n'importe qui peut voir tes clés. Avec un `.env`, ces clés restent sur ton PC.
- **Flexibilité** : Tu peux avoir des configurations différentes selon les environnements (développement local, site de test, site en ligne).

### 2.4 Comment créer ton fichier .env

1. Dans l'explorateur de fichiers, ouvre le dossier `AppSuiviCamp`
2. Tu verras un fichier appelé `.env.example` — c'est le modèle
3. **Crée une copie** de ce fichier et renomme-la en `.env` (juste `.env`, sans rien après)
4. Ouvre ce fichier `.env` avec le Bloc-notes ou VS Code

**Au début, le fichier ressemble à ça :**
```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Tu dois le remplir avec les vraies infos de ton compte Supabase.**

### 2.5 Où trouver les infos Supabase ?

1. Va sur [https://supabase.com](https://supabase.com) et connecte-toi (ou crée un compte gratuit)
2. Crée un nouveau projet ("New project") :
   - Donne-lui un nom (ex: "Camp Suivi")
   - Choisis un mot de passe fort pour la base de données (note-le quelque part)
   - Choisis la région la plus proche de toi
   - Attends quelques secondes que le projet se crée
3. Une fois le projet créé, va dans **Settings → API** dans le menu de gauche
4. Tu trouveras deux choses :

   ```
   URL:    https://xxxxxxxxxxxx.supabase.co     ← c'est VITE_SUPABASE_URL
   anon key:  eyJhbGciOiJIUzI1NiIs...            ← c'est VITE_SUPABASE_ANON_KEY
   ```

5. **Copie-colle** ces deux valeurs dans ton fichier `.env`

**Ton fichier .env final doit ressembler à ça :**
```bash
VITE_SUPABASE_URL=https://abcdefghijklm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...
```

> ⚠️ **Important** : Ne mets PAS de guillemets autour des valeurs. Ne mets PAS d'espace après le `=`.

### 2.6 Initialiser la base de données Supabase

Pour que l'application fonctionne, il faut créer les tables dans Supabase :

1. Dans ton projet Supabase, va dans **SQL Editor** (éditeur SQL)
2. Ouvre le fichier `supabase/schema.sql` du projet avec VS Code
3. **Copie tout le contenu** de ce fichier
4. Colle-le dans l'éditeur SQL de Supabase
5. Clique sur **"Run"** (ou Ctrl+Entrée)
6. Tu verras un message de succès "Success. No rows returned" — c'est normal

✅ **C'est fait !** Les tables sont créées, les règles de sécurité sont en place, et des données de test sont insérées.

### 2.7 Créer un compte administrateur

1. Dans Supabase, va dans **Authentication → Users**
2. Clique sur **"Add user"**
3. Crée un utilisateur avec :
   - Email : l'adresse que tu veux utiliser pour te connecter
   - Password : un mot de passe (note-le)
4. Clique sur l'onglet **"SQL Editor"**
5. Exécute cette requête pour transformer ton compte en administrateur :

```sql
UPDATE public.profiles
SET role = 'admin', nom = 'Admin'
WHERE email = 'TON_EMAIL@EXAMPLE.COM';
```

(Remplace `TON_EMAIL@EXAMPLE.COM` par l'email que tu as utilisé)

Maintenant tu peux te connecter à l'app avec cet email et ce mot de passe.

---

## 3. Lancer l'application en local

### 3.1 Ouvrir le dossier dans le terminal

- **Option A** : Ouvre PowerShell et tape :
  ```bash
  cd "C:\Users\chris\OneDrive\Documents\PROJETS\PROD IA\AppSuiviCamp"
  ```

- **Option B** : Fais un clic droit dans le dossier `AppSuiviCamp` → "Ouvrir dans le terminal"

### 3.2 Installer les dépendances

Une seule fois au début (et après chaque `git pull`) :

```bash
npm install
```

Cette commande télécharge toutes les librairies nécessaires (React, Supabase, etc.) dans un dossier `node_modules`. Ça peut prendre 1 à 2 minutes.

### 3.3 Vérifier que le .env est présent

Assure-toi que le fichier `.env` existe bien dans le dossier :

```bash
ls .env
```

Si tu vois `.env` dans la liste, c'est bon. Si tu vois une erreur, crée le fichier comme expliqué plus haut.

### 3.4 Lancer l'application

```bash
npm run dev
```

Tu devrais voir quelque chose comme ça :

```
VITE v6.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### 3.5 Ouvrir dans le navigateur

- Ouvre Chrome, Firefox, ou Edge
- Tape dans la barre d'adresse : **`http://localhost:5173/`**
- Tu arrives sur la page de connexion
- Connecte-toi avec l'email et le mot de passe que tu as créés dans Supabase

### 3.6 Arrêter l'application

Pour arrêter le serveur, retourne dans le terminal et tape :

**Ctrl + C** (touche Contrôle et la lettre C en même temps)

> 💡 **Pour la présentation :** Laisse l'app tourner en fond pendant ta présentation. Tu peux même ouvrir l'app sur ton téléphone en utilisant l'adresse `Network` (ex: `http://192.168.x.x:5173/`) si tu es sur le même réseau WiFi.

---

## 4. Héberger sur GitHub

### 4.1 C'est quoi GitHub ?

GitHub est un site web qui permet de **stocker et partager** du code. C'est comme Google Drive pour les programmeurs. Ça permet aussi de **suivre les modifications** et de travailler à plusieurs.

### 4.2 Créer un compte GitHub

1. Va sur [https://github.com](https://github.com)
2. Clique sur **"Sign up"**
3. Suis les instructions (email, mot de passe, pseudo)
4. Vérifie ton email

### 4.3 Créer un dépôt (repository)

1. Une fois connecté, clique sur le **`+`** en haut à droite → **"New repository"**
2. Remplis le formulaire :
   - **Repository name** : `AppSuiviCamp` (ou le nom que tu veux)
   - **Description** : `Application de gestion de camp scout`
   - **Public** (coche cette case si tu veux que tout le monde puisse voir)
   - **Ne coche PAS** "Initialize this repository with a README", on en a déjà un
3. Clique sur **"Create repository"**

### 4.4 Envoyer le code sur GitHub

GitHub va t'afficher des instructions. Tu dois exécuter ces commandes dans le terminal (PowerShell).

Assure-toi d'être dans le dossier du projet :

```bash
cd "C:\Users\chris\OneDrive\Documents\PROJETS\PROD IA\AppSuiviCamp"
```

**Étape 1 : Initialiser Git (une seule fois)**

```bash
git init
```

**Étape 2 : Ajouter tous les fichiers**

```bash
git add .
```

> Le `.` signifie "tous les fichiers". Cette commande prépare les fichiers pour l'upload.

**Étape 3 : Créer un premier commit**

```bash
git commit -m "Premier commit : application complète"
```

> Un commit = un "instantané" de ton code à un moment donné.

**Étape 4 : Connecter à GitHub**

Remplace `TON-PSEUDO` par ton pseudo GitHub et `AppSuiviCamp` par le nom du dépôt :

```bash
git remote add origin https://github.com/TON-PSEUDO/AppSuiviCamp.git
```

**Étape 5 : Envoyer le code**

```bash
git branch -M main
git push -u origin main
```

Git va te demander de te connecter. Une fenêtre peut s'ouvrir — connecte-toi avec ton compte GitHub.

### 4.5 Vérifier sur GitHub

1. Va sur `https://github.com/TON-PSEUDO/AppSuiviCamp`
2. Tu devrais voir tous tes fichiers en ligne 🎉

### 4.6 Mettre à jour le code plus tard

Quand tu feras des modifications, répète ces 3 commandes :

```bash
git add .
git commit -m "Description de ce que tu as changé"
git push
```

---

## 5. Déployer sur Netlify

### 5.1 C'est quoi Netlify ?

Netlify est un service qui **héberge ton application sur Internet** gratuitement. Une fois déployée, elle sera accessible 24h/24 depuis n'importe quel appareil, sans avoir à lancer `npm run dev`.

👉 **Avantage** : Tu peux montrer l'app pendant ta présentation sans avoir ton PC allumé.

### 5.2 Créer un compte Netlify

1. Va sur [https://netlify.com](https://netlify.com)
2. Clique sur **"Sign up"**
3. Choisis **"GitHub"** comme méthode de connexion (c'est le plus simple)
4. Autorise Netlify à accéder à GitHub

### 5.3 Déployer depuis GitHub (méthode recommandée)

**Étape 1 : Connecter Netlify à ton dépôt GitHub**

1. Une fois connecté, clique sur **"Add new site"** → **"Import an existing project"**
2. Clique sur **"GitHub"**
3. Netlify va te demander d'installer l'intégration GitHub
   - Clique sur **"Configure"**
   - Choisis ton dépôt (`AppSuiviCamp`)
   - Clique sur **"Install"**
4. Sélectionne le dépôt `AppSuiviCamp` dans la liste

**Étape 2 : Configurer le déploiement**

Netlify va te demander des informations :

| Champ | Valeur |
|---|---|
| **Branch to deploy** | `main` |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

> **Explication :**
> - `npm run build` = commande qui construit l'app (crée le dossier `dist` avec les fichiers optimisés)
> - `dist` = le dossier qui contient les fichiers à mettre en ligne

**Étape 3 : Ajouter les variables d'environnement**

C'est une étape **TRÈS importante** ! Il faut dire à Netlify quelles sont les clés Supabase.

Clique sur **"Show advanced"** puis **"New variable"** :

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://ton-projet.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` |

> Ces valeurs sont les MÊMES que dans ton fichier `.env` local.
>
> ⚠️ **Pourquoi les remettre ?** Parce que le fichier `.env` n'est PAS envoyé sur GitHub (il est dans `.gitignore`). Donc Netlify ne le connaît pas. Il faut les lui donner manuellement.

**Étape 4 : Lancer le déploiement**

1. Clique sur **"Deploy site"**
2. Netlify va construire et déployer l'application automatiquement
3. Après 1-2 minutes, tu verras un message vert : **"Published"**

### 5.4 Accéder à ton site

Netlify te donne une URL du style :

```
https://ton-projet.netlify.app
```

Tu peux :
- Cliquer dessus pour ouvrir ton site
- La partager à qui tu veux
- L'ouvrir sur ton téléphone

### 5.5 Changer le nom de l'URL (optionnel)

1. Dans Netlify, va dans **Site settings** → **Site details**
2. Clique sur **"Change site name"**
3. Tape un nom plus sympa (ex: `camp-scout`)
4. Ton URL deviendra `https://camp-scout.netlify.app`

### 5.6 Mettre à jour le site après des modifications

Quand tu modifies le code et que tu fais `git push` :

1. Netlify détecte automatiquement les changements
2. Il reconstruit et redéploie le site tout seul
3. Après quelques secondes, les changements sont en ligne

✅ **Aucune action manuelle n'est nécessaire !**

### 5.7 Déploiement manuel (sans GitHub)

Si tu préfères ne pas connecter GitHub à Netlify :

1. Fais `npm run build` sur ton PC
2. Dans Netlify, va sur la page d'accueil → glisse-dépose le dossier `dist` sur la zone prévue
3. C'est en ligne en 30 secondes

> ⚠️ Inconvénient : les mises à jour automatiques ne marchent pas avec cette méthode.

---

## 6. Annexe : Commandes utiles

### 6.1 Résumé des commandes

```bash
# Installer les dépendances (1ère fois ou après un git pull)
npm install

# Lancer en local
npm run dev

# Construire pour la production
npm run build

# Voir l'état des fichiers modifiés
git status

# Voir les modifications
git diff

# Envoyer sur GitHub
git add .
git commit -m "message"
git push
```

### 6.2 J'ai une erreur, que faire ?

| Erreur | Cause | Solution |
|---|---|---|
| `'npm' n'est pas reconnu` | Node.js pas installé | Installe Node.js |
| `'git' n'est pas reconnu` | Git pas installé | Installe Git |
| `.env` manquant | Fichier de config absent | Crée `.env` depuis `.env.example` |
| `Supabase : 401 Unauthorized` | Mauvaises clés | Vérifie les clés dans `.env` |
| `Supabase : 404 Not Found` | Tables non créées | Exécute `supabase/schema.sql` |
| `Erreur 404 sur Netlify` | Problème de routage | Vérifie que `_redirects` existe ou qu'un fichier de config est présent |
| Build échoue sur Netlify | Erreur de compilation | Regarde les logs de build dans Netlify |

### 6.3 Fichier `.gitignore` — pourquoi certains fichiers ne sont pas sur GitHub ?

Le fichier `.gitignore` dit à Git : "ne prends pas ces fichiers". Dans notre projet, il va ignorer :

- `node_modules/` → Ces dossiers sont gros, on les regénère avec `npm install`
- `.env` → Contient les secrets, ne doit JAMAIS être partagé
- `dist/` → Se reconstruit avec `npm run build`

---

## Besoin d'aide ?

Si tu rencontres un problème :
1. **Lis le message d'erreur** — il dit souvent quoi faire
2. **Regarde les logs** de Netlify (Deploy → Deploy log)
3. **Vérifie ton `.env`** — c'est la cause la plus fréquente des problèmes

Bon déploiement ! 🚀
