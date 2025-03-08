![image](/public/OSI_logo.png)

# Dashboard Admin OSI

Ce projet est un tableau de bord d'administration pour OSI, développé avec Next.js.

## Fonctionnalités
- **Authentification** : Système de connexion sécurisé avec gestion des rôles (admin/utilisateur) via NextAuth.js.
- **Interface responsive** : Design adaptatif pour une expérience fluide sur tous les appareils.
- **Mode sombre/clair** : Thème personnalisable selon les préférences de l'utilisateur.
- **Gestion des messages** : Interface pour visualiser et gérer les messages des utilisateurs.
- **Base de données RAG** : Gestion complète des entrées de la base de connaissances (création, édition, suppression).
- **Statistiques** : Visualisation des données d'utilisation avec des graphiques interactifs grâce à Recharts.
- **Paramètres** : Configuration personnalisable du système pour les administrateurs.

## Démarrage rapide

### Prérequis
- Node.js (version recommandée : 18+)
- npm ou yarn

### Installation
1. Clonez le dépôt :
   ```bash
   git clone https://github.com/nicolassaint/OSI-Admin-Dashboard.git
   cd OSI-Admin-Dashboard
   ```
2. Installez les dépendances :
   ```bash
   npm install
   # ou
   yarn install
   ```
3. Configurez les variables d'environnement en créant un fichier `.env.local` à la racine du projet :
   ```env
      NEXTAUTH_URL=http://localhost:3002
      NEXTAUTH_SECRET=votre_secret_securise_pour_nextauth

      NEXT_PUBLIC_API_URL=http://localhost:5000

      NEXT_PUBLIC_API_TOKEN=osi_dashboard_secret_token_2024
      NEXT_PUBLIC_WEBSOCKET_TOKEN=osi_dashboard_secret_token_2024
   ```
1. Lancez le serveur de développement :
   ```bash
   npm run dev
   # ou
   yarn dev
   ```
2. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir le tableau de bord.

## Identifiants de test
Pour vous connecter à l'application, utilisez l'un des comptes suivants :

### Administrateur :
- **Email** : admin
- **Mot de passe** : admin

## Structure du projet
```
/OSI-Admin-Dashboard
│── src/app               # Pages et routes de l'application
│── src/components        # Composants réutilisables
│── src/providers        # Fournisseurs de contexte (authentification, thème)
│── /public           # Ressources statiques (images, icônes)
│── .env.local        # Fichier de configuration des variables d'environnement
│── package.json      # Dépendances et scripts npm
│── next.config.js    # Configuration de Next.js
│── tailwind.config.js# Configuration de Tailwind CSS
│── README.md         # Documentation du projet
```

## Technologies utilisées
- **Next.js** : Framework React avec rendu côté serveur et statique.
- **NextAuth.js** : Gestion de l'authentification et des sessions utilisateurs.
- **Tailwind CSS** : Framework CSS pour un design moderne et responsive.
- **Recharts** : Bibliothèque de visualisation de données interactive.
- **React Markdown** : Rendu de contenu formaté en Markdown.

## Auteur
Ce projet a été développé par le Bercy HUB
