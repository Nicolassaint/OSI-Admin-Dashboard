---
title: Base de connaissances RAG
category: rag-database
order: 1
---

# 📚 Gestion de la base RAG

La base de connaissances RAG (Retrieval-Augmented Generation) est le cœur de votre chatbot OSI. Elle contient toutes les informations que le chatbot peut utiliser pour fournir des réponses précises et contextuelles à vos utilisateurs.

## Exploration de la base de données

### 📋 Liste des entrées
L'interface principale affiche toutes les entrées disponibles dans votre base RAG avec:
- Le nom de l'entrée pour identification rapide
- Une description concise du contenu
- Des tags ou catégories associés (si configurés)
- La date de dernière modification

### 🔎 Recherche avancée
Utilisez la barre de recherche pour:
- Trouver rapidement des entrées spécifiques
- Rechercher par mot-clé dans le contenu
- Filtrer par catégorie ou tag

## ➕ Ajout de nouvelles entrées

Pour enrichir votre base de connaissances:

1. Cliquez sur le bouton "Ajouter une entrée" en haut de la page
2. Remplissez le formulaire avec:
   - Un nom descriptif unique
   - Une description concise
   - Le contenu détaillé (texte, markdown, etc.)
   - Des tags ou catégories pour faciliter l'organisation

## ✏️ Modification des entrées existantes

Pour mettre à jour une entrée RAG:

1. Localisez l'entrée dans la liste
2. Cliquez sur l'icône d'édition (✏️)
3. Modifiez les champs nécessaires
4. Enregistrez vos modifications

## 🗑️ Suppression d'entrées

Pour retirer une entrée de la base de connaissances:

1. Trouvez l'entrée à supprimer
2. Cliquez sur l'icône de suppression
3. Confirmez votre action dans la boîte de dialogue

⚠️ **Attention**: La suppression est définitive et ne peut pas être annulée.

## Prévisualisation et test

### 👁️ Voir le contenu
Cliquez sur une entrée pour afficher tous ses détails, notamment:
- Le contenu textuel complet
- L'historique des modifications
- Les statistiques d'utilisation

### Test d'efficacité
Pour vérifier la pertinence d'une entrée:
1. Accédez à la prévisualisation
2. Utilisez la fonction "Tester" pour simuler une requête
3. Analysez comment cette entrée influence les réponses

## Synchronisation et index

### Synchronisation manuelle
Après des modifications importantes:
1. Cliquez sur "Synchroniser la base RAG" en haut de la page
2. Attendez la confirmation de réindexation
3. Testez le chatbot pour vérifier les améliorations

### Synchronisation automatique
La base RAG est également synchronisée automatiquement:
- À intervalles réguliers (configurable dans les paramètres)
- Après un certain nombre de modifications
- Pendant les périodes de faible activité 