/**
 * Définition des catégories de documentation
 */
export const categories = [
  {
    id: "getting-started",
    name: "Démarrage",
    description: "Découvrez comment commencer avec le tableau de bord OSI Admin et utiliser ses fonctionnalités de base."
  },
  {
    id: "dashboard",
    name: "Tableau de bord",
    description: "Guide détaillé du tableau de bord principal et des métriques disponibles."
  },
  {
    id: "messages",
    name: "Messages",
    description: "Guide complet pour gérer efficacement les conversations utilisateurs, analyser les métriques et optimiser les réponses."
  },
  {
    id: "rag-database",
    name: "Base RAG",
    description: "Instructions pour gérer votre base de connaissances et optimiser les réponses du chatbot."
  },
  {
    id: "settings",
    name: "Paramètres",
    description: "Guide de configuration et de personnalisation du système."
  }
];

/**
 * Structure d'un document de documentation
 * @typedef {Object} DocItem
 * @property {string} id - Identifiant unique du document
 * @property {string} title - Titre du document
 * @property {string} content - Contenu Markdown du document
 * @property {string} category - Catégorie à laquelle appartient le document
 */ 