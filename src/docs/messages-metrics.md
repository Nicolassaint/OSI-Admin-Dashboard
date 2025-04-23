---
title: Analyse des métriques de conversations
category: messages
order: 3
---

# 📊 Métriques et analyse des conversations

Cette section détaille les métriques disponibles pour analyser la performance de votre chatbot et optimiser la qualité des réponses générées grâce au système RAG (Retrieval-Augmented Generation).

## 🔍 Comprendre les métriques RAG

Les métriques RAG vous permettent d'évaluer la qualité de la génération de réponses augmentée par la récupération d'informations :

### 🎯 Pertinence des sources
- **Score de pertinence** : Indique à quel point les documents récupérés sont pertinents par rapport à la question posée
- **Nombre de sources utilisées** : Affiche le nombre de documents consultés pour générer la réponse
- **Confiance de récupération** : Évalue la confiance du système dans les sources récupérées

### ⚖️ Qualité de la génération
- **Score de fidélité** : Mesure à quel point la réponse reste fidèle aux sources récupérées
- **Score de hallucination** : Estime le niveau d'informations générées sans support dans les sources
- **Couverture de la question** : Évalue si tous les aspects de la question ont été adressés

### ⏱️ Performance
- **Temps de récupération** : Durée nécessaire pour rechercher les documents pertinents
- **Temps de génération** : Durée nécessaire pour produire la réponse finale
- **Temps de réponse total** : Temps complet entre la réception de la question et l'envoi de la réponse

## 📈 Interface d'analyse des métriques

Pour accéder aux métriques d'une conversation :
1. Sélectionnez la conversation dans la liste des messages
2. Cliquez sur le bouton "Voir les métriques" ou l'icône 📊
3. Un dialogue s'ouvre présentant les métriques détaillées de cette conversation

### 📊 Visualisation des métriques
L'interface de visualisation propose :
- 📉 Des graphiques comparatifs pour situer la performance par rapport aux moyennes
- 🔍 Des détails sur les documents spécifiques utilisés dans la réponse
- 📝 Une analyse de la correspondance entre la question et la réponse
- ⚠️ Des alertes sur les potentiels problèmes de qualité détectés

## 🔎 Analyse avancée des conversations

### 📈 Tendances et patterns
Pour identifier des tendances sur l'ensemble des conversations :
- 📊 Consultez les statistiques globales dans la section "Analyse" du dashboard
- 📉 Observez l'évolution des métriques de performance sur le temps
- 🔍 Identifiez les types de questions générant les meilleurs/pires scores

### 🧮 Segmentation et filtrage
Utilisez les outils de segmentation pour approfondir votre analyse :
- 👥 Filtrez par profil utilisateur ou source de la conversation
- 📑 Groupez par thématique de question ou domaine
- 📅 Analysez les variations de performance selon les périodes

## 🚀 Optimisation basée sur les métriques

### 📚 Amélioration de la base de connaissances
Utilisez les données des métriques pour optimiser votre base RAG :
- 📝 Enrichissez les sources pour les questions avec faible score de pertinence
- 🔄 Actualisez les contenus obsolètes identifiés lors de l'analyse
- 🧹 Supprimez ou corrigez les sources générant des hallucinations

### ⚙️ Ajustement des paramètres
Optimisez la configuration du système :
- 🔧 Modifiez les paramètres de récupération pour les questions problématiques
- ⚖️ Ajustez le poids des différentes sources selon leur fiabilité
- 🧠 Affinez les paramètres du modèle de génération pour réduire les hallucinations

## 📋 Rapports et exportation des métriques

### 📊 Génération de rapports
Pour documenter la performance du système :
1. Accédez à la section "Rapports" depuis le menu principal
2. Sélectionnez "Métriques des conversations" comme type de rapport
3. Définissez la période et les filtres souhaités
4. Générez le rapport au format PDF ou CSV

### 📤 Exportation pour analyse externe
Pour approfondir l'analyse avec des outils externes :
1. Dans la vue des métriques, cliquez sur "Exporter les données"
2. Sélectionnez le format d'exportation (JSON, CSV)
3. Choisissez les métriques spécifiques à inclure
4. Utilisez ces données dans vos outils d'analyse préférés 