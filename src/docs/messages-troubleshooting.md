---
title: Dépannage des conversations
category: messages
order: 2
---

# 🛠️ Résolution des problèmes de conversations

Cette section vous guide à travers les problèmes courants que vous pourriez rencontrer lors de la gestion des conversations et propose des solutions pratiques pour les résoudre efficacement.

## 🔄 Problèmes de connectivité

### 🌐 Perte de connexion en temps réel
Si les mises à jour en temps réel ne fonctionnent pas :
- ✅ Vérifiez votre connexion internet
- ✅ Confirmez que le service WebSocket est actif sur le serveur
- ✅ Actualisez la page pour rétablir la connexion WebSocket
- ✅ Vérifiez les logs côté serveur pour détecter des erreurs potentielles

### 🚫 Problèmes de chargement des messages
Si les messages ne se chargent pas correctement :
- ✅ Vérifiez la connexion entre le dashboard et le backend API
- ✅ Assurez-vous que le serveur API est en cours d'exécution
- ✅ Examinez les journaux du serveur pour identifier d'éventuelles erreurs
- ✅ Vérifiez les paramètres de pagination et de filtrage

## 🔍 Gestion des états des conversations

### 🟡 Conversations bloquées en statut "En attente"
Si des conversations restent bloquées en statut "En attente" :
- ✅ Vérifiez que le service de traitement des messages fonctionne correctement
- ✅ Examinez les logs système pour détecter d'éventuelles erreurs de traitement
- ✅ Essayez de changer manuellement le statut pour déverrouiller la conversation
- ✅ Vérifiez si un processus de mise à jour automatique n'est pas interrompu

### 📦 Problèmes d'archivage
Si l'archivage des conversations échoue :
- ✅ Vérifiez les permissions de l'utilisateur actuel
- ✅ Contrôlez que le service d'archivage est correctement configuré
- ✅ Examinez les logs d'erreur spécifiques à l'archivage
- ✅ Essayez d'archiver une conversation différente pour isoler le problème

## ⏱️ Problèmes de performance

### 🐢 Temps de réponse excessifs
Si les temps de réponse sont anormalement longs :
- ✅ Vérifiez la charge du serveur et les ressources disponibles
- ✅ Examinez si la base de connaissances RAG n'est pas trop volumineuse
- ✅ Réduisez le nombre d'éléments par page dans les paramètres
- ✅ Utilisez des filtres plus précis pour limiter les données chargées

### 📱 Interface lente ou qui freeze
Si l'interface ralentit avec un grand volume de données :
- ✅ Ajustez le nombre d'éléments par page dans les paramètres
- ✅ Envisagez d'archiver les anciennes conversations non essentielles
- ✅ Utilisez des filtres plus précis pour limiter les résultats affichés
- ✅ Vérifiez les ressources de votre navigateur (mémoire, CPU)

## 📊 Problèmes avec les métriques RAG

### 🔍 Métriques RAG non disponibles
Si les métriques RAG ne s'affichent pas :
- ✅ Vérifiez que le service RAG est correctement configuré et actif
- ✅ Assurez-vous que la conversation dispose de données RAG associées
- ✅ Examinez les logs serveur pour détecter des erreurs de récupération des métriques
- ✅ Essayez de recharger les détails de la conversation

### 📉 Métriques RAG incorrectes ou incomplètes
Si les métriques RAG semblent erronées :
- ✅ Vérifiez que les sources de données RAG sont à jour
- ✅ Contrôlez la configuration du système de génération de métriques
- ✅ Comparez avec d'autres conversations similaires pour détecter des anomalies
- ✅ Consultez les logs détaillés de l'analyse RAG pour cette conversation

## 🗑️ Gestion des conversations problématiques

### 🧹 Suppression des conversations
Pour supprimer des conversations problématiques :
1. Identifiez la conversation à supprimer dans la liste
2. Cliquez sur l'icône de suppression (🗑️)
3. Confirmez la suppression dans la boîte de dialogue
4. Vérifiez que la suppression a bien été effectuée dans la base de données

### 🔄 Réinitialisation des évaluations
Pour réinitialiser l'évaluation d'une conversation :
1. Ouvrez la conversation concernée
2. Cliquez sur "Modifier l'évaluation"
3. Sélectionnez "Réinitialiser" dans les options
4. Confirmez la modification

## 📤 Exportation et sauvegarde

### 📊 Exportation des conversations
Pour exporter les données de conversation :
1. Accédez à la page des messages
2. Utilisez le bouton "Exporter" dans le coin supérieur droit
3. Sélectionnez le format souhaité (CSV ou JSON)
4. Appliquez les filtres nécessaires pour cibler l'exportation

### 💾 Stratégie de sauvegarde
Il est recommandé de :
- ⏱️ Programmer des sauvegardes automatiques via les paramètres système
- 🔍 Exporter manuellement les conversations importantes après analyse
- 📂 Stocker les sauvegardes dans un emplacement sécurisé et redondant
- 🔄 Vérifier régulièrement que les sauvegardes sont exploitables

## 🔎 Analyse des retours négatifs

Pour améliorer la qualité des réponses aux utilisateurs :
- 📈 Utilisez les filtres pour afficher uniquement les conversations avec évaluations négatives
- 🔍 Identifiez les patterns récurrents dans les questions mal répondues
- 📚 Complétez la base de connaissances pour les sujets problématiques
- 🧪 Testez les améliorations en utilisant les conversations précédentes comme référence 