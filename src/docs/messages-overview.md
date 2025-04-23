---
title: Vue d'ensemble des messages
category: messages
order: 1
---

# 💬 Gestion des messages utilisateurs

La section Messages du tableau de bord OSI Admin vous permet de surveiller et de gérer efficacement toutes les interactions entre les utilisateurs et votre chatbot. Cette interface centralisée offre un contrôle complet sur l'historique des conversations, vous permettant d'analyser la performance de vos réponses et d'identifier les points d'amélioration.

## 📋 Interface principale

L'interface des messages présente une liste organisée de toutes les conversations, affichant pour chacune :
- 📝 L'aperçu du message initial de l'utilisateur
- 🕒 La date et l'heure de la conversation
- 🚦 Le statut actuel (en attente, résolu, archivé, erreur)
- 👍👎 L'évaluation donnée par l'utilisateur (positive, négative ou absente)

## 🔍 Recherche et filtrage avancés

Optimisez votre flux de travail grâce aux puissantes fonctionnalités de filtrage :

### 🔎 Recherche par contenu
Trouvez rapidement des conversations spécifiques en recherchant par mots-clés présents dans les messages des utilisateurs ou les réponses du chatbot.

### 🏷️ Filtrage par statut
Filtrez les conversations selon leur état :
- 🟢 **Tous** - Affiche l'ensemble des conversations
- 🟡 **En attente** - Conversations nécessitant une attention particulière
- 🟢 **Résolues** - Conversations marquées comme traitées
- 📦 **Archivées** - Conversations archivées pour référence future
- 🔴 **Erreur** - Conversations ayant rencontré des problèmes techniques

### 📊 Filtrage par évaluation
Visualisez les conversations selon le feedback utilisateur :
- 👍 **Positives** - Interactions évaluées favorablement
- 👎 **Négatives** - Interactions nécessitant une amélioration
- ❓ **Sans évaluation** - Interactions sans retour utilisateur

### ⏱️ Options de tri
Organisez vos conversations selon différents critères :
- 🕒 **Chronologique** - Du plus récent au plus ancien ou inversement
- 🔄 **Par statut** - Regroupez par état de traitement
- 📈 **Par évaluation** - Priorisez les conversations problématiques

## 👁️ Vue détaillée des conversations

En cliquant sur une conversation, vous accédez à une vue détaillée qui présente :
- 👤 L'ensemble de l'échange entre l'utilisateur et le chatbot
- 📋 Les métadonnées et informations contextuelles de la conversation
- 📊 Les métriques RAG (Retrieval-Augmented Generation) pour analyser la qualité des réponses
- 🛠️ Des options pour modifier le statut, l'évaluation ou ajouter des notes

## ⚙️ Actions disponibles

Pour chaque conversation, plusieurs actions sont disponibles :
- ✅ **Marquer comme résolu** - Indiquer que la conversation a été traitée
- 📦 **Archiver** - Déplacer la conversation vers les archives pour référence future
- 📊 **Consulter les métriques** - Analyser les performances de la réponse RAG
- 🗑️ **Supprimer** - Effacer définitivement la conversation (avec confirmation)

## 🔄 Mise à jour en temps réel

L'interface des messages bénéficie de mises à jour en temps réel via WebSocket :
- ⚡ Les nouvelles conversations apparaissent instantanément sans rechargement
- 🔄 Les statuts et évaluations sont actualisés automatiquement
- 🗑️ Les suppressions sont reflétées immédiatement dans l'interface

## 📱 Pagination et performances

La pagination intelligente permet de :
- 🔄 Charger efficacement de grandes quantités de messages
- 📊 Consulter facilement l'historique complet par pages
- ⚡ Maintenir des performances optimales même avec des milliers de conversations
- ⚙️ Ajuster le nombre d'éléments par page selon vos préférences

## 📈 Analyse des performances

Utilisez les données des conversations pour :
- 📊 Identifier les questions fréquemment posées
- 👎 Repérer les sujets générant des évaluations négatives
- 🔍 Détecter les lacunes dans votre base de connaissances
- 📈 Suivre l'évolution de la satisfaction utilisateur dans le temps 