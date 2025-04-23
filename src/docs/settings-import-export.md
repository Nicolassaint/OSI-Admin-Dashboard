---
title: Importation et exportation
category: settings
order: 3
---

# 📤 Importation et exportation des données

Le tableau de bord OSI Admin vous offre des fonctionnalités complètes pour importer et exporter vos données. Cette documentation vous guide à travers ces processus essentiels pour la gestion de vos données.

## 💬 Gestion des conversations

### 📥 Exportation des conversations
Pour exporter l'historique des conversations :

1. Accédez à la section **Paramètres**
2. Dans le panneau **Paramètres des conversations**, cliquez sur "Exporter les conversations"
3. Le fichier JSON sera automatiquement téléchargé sur votre appareil

Le fichier exporté contient :
- Tous les messages des utilisateurs
- Les réponses du chatbot
- Les horodatages et métadonnées
- Les évaluations des utilisateurs (si disponibles)

### 📤 Importation des conversations
Pour restaurer des conversations à partir d'un fichier :

1. Dans **Paramètres des conversations**, cliquez sur "Importer des conversations"
2. Sélectionnez un fichier JSON valide
3. Confirmez l'importation
4. Attendez la confirmation de traitement

**Note** : Le fichier d'importation doit respecter la structure attendue par le système. Les fichiers non conformes seront rejetés.

### 🗑️ Suppression des conversations
Pour effacer toutes les conversations :

1. Cliquez sur "Supprimer toutes les conversations"
2. Confirmez l'action dans la boîte de dialogue
3. Attendez la confirmation de suppression

**Attention** : Cette action est irréversible. Exportez vos données avant de procéder à une suppression complète.

## 📚 Gestion de la base RAG

### 📥 Exportation des entrées RAG
Pour sauvegarder votre base de connaissances :

1. Dans le panneau **Gestion de la base RAG**, cliquez sur "Exporter les données"
2. Le fichier JSON contenant toutes les entrées sera téléchargé

Cette fonction est utile pour :
- Sauvegarder vos données
- Migrer vers une autre instance
- Modifier les données en masse hors du système

### 📤 Importation d'entrées RAG
Pour charger des entrées dans la base de connaissances :

1. Cliquez sur "Importer des données"
2. Sélectionnez un fichier JSON
3. Confirmez l'importation

Le système prend en charge deux formats :
- **Format tableau** : Liste d'objets avec attributs "name", "description", etc.
- **Format objet** : Structure avec clés/valeurs où chaque clé correspond à une entrée

Après l'importation, le système synchronise automatiquement la base de données RAG pour que les nouvelles entrées soient immédiatement disponibles pour le chatbot.

### 📋 Format des données RAG
Chaque entrée RAG doit comporter les champs suivants :

```json
{
  "name": "Nom de l'entrée",
  "description": "Description concise",
  "search": "Termes de recherche",
  "details": {
    "Label": "Titre principal",
    "Messages": [
      {
        "Label": "Titre du message",
        "Description": "Description du message",
        "Bubbles": [
          {
            "Text": "Contenu textuel",
            "Image": "URL de l'image (optionnel)",
            "Video": "URL de la vidéo (optionnel)",
            "Order": 1
          }
        ],
        "Buttons": [
          {
            "Label": "Texte du bouton",
            "Link": "URL du lien",
            "Type": "primary",
            "Order": 1
          }
        ]
      }
    ]
  }
}
```

### 🗑️ Suppression des entrées RAG
Pour supprimer toutes les entrées de la base RAG :

1. Cliquez sur "Supprimer toutes les entrées"
2. Confirmez l'action
3. Attendez la confirmation de suppression

Cette fonction est utile pour repartir de zéro ou avant une importation massive de nouvelles données.

## 💡 Bonnes pratiques

### 📥 Pour les exportations
- Exportez régulièrement vos données comme sauvegarde additionnelle
- Conservez plusieurs versions de vos exports
- Vérifiez l'intégrité des fichiers exportés

### 📤 Pour les importations
- Validez vos fichiers JSON avant l'importation
- Effectuez une sauvegarde complète avant d'importer de nouvelles données
- Testez l'importation sur un environnement de test si possible
- Vérifiez les données après importation pour confirmer leur intégrité

### 🔒 Sécurité des données
- Protégez vos fichiers d'exportation qui peuvent contenir des informations sensibles
- Utilisez le chiffrement pour les fichiers contenant des données confidentielles
- Limitez l'accès aux fonctionnalités d'importation/exportation aux administrateurs 