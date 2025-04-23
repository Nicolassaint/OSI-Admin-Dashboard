---
title: Système de sauvegarde
category: settings
order: 2
---

# 💾 Gestion des sauvegardes

Le système de sauvegarde du tableau de bord OSI vous permet de sécuriser vos données et de les restaurer en cas de besoin. Cette documentation explique comment utiliser efficacement ces fonctionnalités.

## 🆕 Création de sauvegardes

### Création manuelle
Pour créer une nouvelle sauvegarde complète :

1. Accédez à la section **Paramètres** du dashboard
2. Dans le panneau **Gestion des sauvegardes**, cliquez sur le bouton "Créer une sauvegarde"
3. Confirmez votre action dans la boîte de dialogue
4. Attendez la confirmation de création

La sauvegarde inclut :
- La base de connaissances RAG complète
- Les configurations système
- Autres données essentielles

## 📋 Gestion des sauvegardes existantes

### Visualisation
La liste des sauvegardes affiche :
- Le nom du fichier de sauvegarde
- La date et l'heure de création
- La taille du fichier
- Les actions disponibles

### Filtrage
Utilisez la barre de recherche au-dessus de la liste pour filtrer les sauvegardes par :
- Date (format JJ/MM/AAAA)
- Heure (format HH:MM)
- Nom de fichier

### Pagination
La liste utilise un système de pagination pour gérer un grand nombre de sauvegardes :
- Naviguez entre les pages à l'aide des boutons de pagination
- Modifiez le nombre d'éléments affichés par page dans les paramètres

## 🛠️ Actions sur les sauvegardes

### ↩️ Restauration
Pour restaurer votre système à partir d'une sauvegarde :

1. Localisez la sauvegarde souhaitée dans la liste
2. Cliquez sur l'icône de restauration
3. Confirmez l'action dans la boîte de dialogue d'avertissement
4. Attendez la fin du processus de restauration

**Attention** : La restauration remplace toutes les données actuelles par celles de la sauvegarde. Cette action est irréversible.

### 📥 Téléchargement
Pour obtenir une copie locale d'une sauvegarde :

1. Localisez la sauvegarde dans la liste
2. Cliquez sur l'icône de téléchargement
3. Le fichier sera automatiquement téléchargé sur votre appareil

### 🗑️ Suppression
Pour éliminer une sauvegarde obsolète :

1. Localisez la sauvegarde à supprimer
2. Cliquez sur l'icône de suppression
3. Confirmez la suppression dans la boîte de dialogue
4. Attendez la confirmation de suppression

## 📌 Bonnes pratiques

### Fréquence recommandée
- Créez une sauvegarde avant toute modification majeure de la base RAG
- Établissez un calendrier régulier de sauvegardes (hebdomadaire ou mensuel)
- Après l'importation de nouvelles données

### Conservation des sauvegardes
- Gardez au moins trois sauvegardes récentes dans le système
- Téléchargez et conservez les sauvegardes importantes hors du système
- Supprimez régulièrement les sauvegardes obsolètes pour économiser de l'espace

### Sécurité
- Stockez les sauvegardes téléchargées dans un emplacement sécurisé
- Protégez l'accès aux fichiers de sauvegarde avec des restrictions appropriées
- Vérifiez périodiquement que vos sauvegardes sont restaurables

## ⚠️ Résolution des problèmes

### Échec de création
Si la création de sauvegarde échoue :
1. Vérifiez la connexion au serveur backend
2. Assurez-vous que l'espace de stockage est suffisant
3. Consultez les logs du système pour plus de détails

### Échec de restauration
Si la restauration échoue :
1. Vérifiez l'intégrité du fichier de sauvegarde
2. Assurez-vous que le serveur dispose de suffisamment de ressources
3. Redémarrez le serveur et réessayez
4. Contactez l'administrateur système si le problème persiste 