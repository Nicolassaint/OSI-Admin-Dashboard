/**
 * Générateur d'IDs uniques pour les messages RAG
 * Format: msg000xxx où xxx est un numéro incrémental
 */

/**
 * Génère un ID de message unique au format msg000xxx
 * @param {Array} existingMessages - Liste des messages existants pour vérifier l'unicité
 * @returns {string} ID unique au format msg000xxx
 */
export function generateUniqueMessageId(existingMessages = []) {
  // Extraire tous les IDs de messages existants qui matchent le pattern msg000xxx
  const existingIds = [];
  
  // Parcourir tous les messages de toutes les entrées pour collecter les IDs
  existingMessages.forEach(entry => {
    if (entry.details?.messages) {
      entry.details.messages.forEach(message => {
        if (message.label && message.label.match(/^msg\d{6}$/)) {
          existingIds.push(message.label);
        }
      });
    }
    // Support du format avec majuscules aussi
    if (entry.details?.Messages) {
      entry.details.Messages.forEach(message => {
        if (message.Label && message.Label.match(/^msg\d{6}$/)) {
          existingIds.push(message.Label);
        }
      });
    }
  });
  
  // Trouver le prochain numéro disponible
  let nextNumber = 1;
  
  if (existingIds.length > 0) {
    // Extraire les numéros des IDs existants et trouver le maximum
    const existingNumbers = existingIds
      .map(id => parseInt(id.replace('msg', '')))
      .filter(num => !isNaN(num))
      .sort((a, b) => b - a); // Tri décroissant
    
    if (existingNumbers.length > 0) {
      nextNumber = existingNumbers[0] + 1;
    }
  }
  
  // Formater le numéro avec des zéros pour avoir 6 chiffres
  const formattedNumber = nextNumber.toString().padStart(6, '0');
  
  return `msg${formattedNumber}`;
}

/**
 * Génère un ID de message unique en consultant l'API RAG
 * @returns {Promise<string>} ID unique au format msg000xxx
 */
export async function generateUniqueMessageIdFromAPI() {
  try {
    // Récupérer toutes les données RAG pour vérifier l'unicité
    const response = await fetch('/api/proxy/rag/data', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.warn('Impossible de récupérer les données RAG pour vérifier l\'unicité, utilisation d\'un ID basé sur le timestamp');
      return `msg${Date.now().toString().slice(-6).padStart(6, '0')}`;
    }
    
    const ragData = await response.json();
    const formattedData = Array.isArray(ragData) ? ragData : [];
    
    return generateUniqueMessageId(formattedData);
  } catch (error) {
    console.warn('Erreur lors de la génération de l\'ID unique:', error);
    // Fallback sur un ID basé sur le timestamp
    return `msg${Date.now().toString().slice(-6).padStart(6, '0')}`;
  }
}

/**
 * Vérifie si un ID de message existe déjà
 * @param {string} messageId - L'ID à vérifier
 * @param {Array} existingMessages - Liste des messages existants
 * @returns {boolean} True si l'ID existe déjà
 */
export function isMessageIdExists(messageId, existingMessages = []) {
  for (const entry of existingMessages) {
    if (entry.details?.messages) {
      for (const message of entry.details.messages) {
        if (message.label === messageId) {
          return true;
        }
      }
    }
    // Support du format avec majuscules
    if (entry.details?.Messages) {
      for (const message of entry.details.Messages) {
        if (message.Label === messageId) {
          return true;
        }
      }
    }
  }
  return false;
}