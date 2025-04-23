---
title: Guide d'utilisation de la base RAG
category: rag-database
order: 3
---

# 📘 Guide d'utilisation de la base RAG

La base de données RAG (Retrieval-Augmented Generation) est le cœur de la connaissance de votre chatbot OSI. Elle contient tous les documents et informations que le système utilise pour générer des réponses précises et contextuelles.

## 🔍 Comprendre le RAG

Le RAG est une approche qui combine:
- La **récupération** d'informations pertinentes depuis une base de connaissances
- La **génération** de réponses à l'aide d'un modèle de langage

Cette méthode permet au chatbot de fournir des réponses basées sur des informations spécifiques et à jour, plutôt que de se limiter aux connaissances générales avec lesquelles il a été entraîné.

## ➕ Ajouter une nouvelle entrée

Pour ajouter une nouvelle entrée dans la base RAG:

1. Accédez à la section "Base RAG" dans le menu latéral
2. Cliquez sur le bouton "Ajouter une entrée"
3. Remplissez le formulaire avec:
   - Un titre descriptif
   - Le contenu textuel de l'information
   - Des tags pour faciliter la recherche (facultatif)
4. Cliquez sur "Enregistrer"

```
Conseil: Préférez des documents courts et ciblés plutôt que de longs textes. 
Cela améliore la précision de la récupération et la qualité des réponses.
```

## ✏️ Modifier ou supprimer une entrée

Pour modifier une entrée existante:
1. Trouvez l'entrée dans la liste
2. Cliquez sur le bouton "Modifier"
3. Apportez vos modifications et enregistrez

Pour supprimer une entrée:
1. Trouvez l'entrée dans la liste
2. Cliquez sur le bouton "Supprimer"
3. Confirmez la suppression

## 💡 Bonnes pratiques pour la base RAG

Pour optimiser les performances de votre chatbot:

- **Structurez clairement** vos documents
- **Évitez les doublons** d'informations
- **Mettez à jour régulièrement** les informations obsolètes
- **Utilisez des étiquettes** cohérentes pour faciliter la gestion
- **Testez la récupération** en posant des questions liées à vos documents

## 📝 Format de texte supporté

La base RAG supporte le format Markdown pour structurer vos documents. Vous pouvez utiliser:

- **Titres**: `# Titre principal`, `## Sous-titre`, etc.
- **Listes**: `- élément` ou `1. élément`
- **Emphase**: `*italique*` ou `**gras**`
- **Liens**: `[texte du lien](URL)`
- **Code**: ``` code ```

En utilisant ces fonctionnalités, vous pouvez créer une base de connaissances riche et structurée qui améliorera considérablement les capacités de votre chatbot. 