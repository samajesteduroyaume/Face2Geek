---
description: Comment déployer Face2Geek sur Vercel
---

# Guide de Déploiement Face2Geek 🚀

Face2Geek est optimisé pour être déployé sur **Vercel** avec une base de données **PostgreSQL**.

## 1. Préparation du Dépôt GitHub

Si ce n'est pas déjà fait, initialisez votre repo et poussez-le sur GitHub.

```bash
git init
git add .
git commit -m "Initial commit Face2Geek"
# Créez un repo sur GitHub et suivez les instructions pour 'git remote add origin'
git push -u origin main
```

## 2. Configuration sur Vercel

1. Connectez-vous à [Vercel](https://vercel.com).
2. Cliquez sur **"Add New"** -> **"Project"**.
3. Importez votre dépôt GitHub.
4. Dans **"Environment Variables"**, ajoutez les variables suivantes :

| Variable | Description |
| :--- | :--- |
| `AUTH_SECRET` | Clé secrète pour Auth.js (Générée via `openssl rand -base64 32`) |
| `AUTH_GITHUB_ID` | Client ID de votre application GitHub OAuth |
| `AUTH_GITHUB_SECRET` | Client Secret de votre application GitHub OAuth |
| `POSTGRES_URL` | L'URL de votre base de données (Fournie par Vercel Postgres) |

## 3. Configuration de la Base de Données

1. Sur Vercel, allez dans l'onglet **"Storage"** du projet.
2. Cliquez sur **"Connect Database"** -> **"Postgres"**.
3. Une fois créée, les variables `POSTGRES_URL`, etc., seront automatiquement injectées.

## 4. Migration du Schéma

Pour synchroniser votre schéma Drizzle local avec la base de données en ligne, lancez :

```bash
npx drizzle-kit push
```

## 5. Synchronisation des Badges

Une fois le site en ligne, visitez l'URL suivante (ou faites un curl POST) pour initialiser les badges de la plateforme :

`https://votre-domaine.com/api/admin/seed-badges`

---
**Face2Geek est maintenant en ligne !** 🌌
