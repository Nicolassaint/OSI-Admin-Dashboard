"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { MessageList, MessageFilter, MessageSearch, MessageSort, MessageEvaluationFilter } from "@/components/messages";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Cache global pour stocker les messages entre les navigations
let messagesCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // Durée de validité du cache en millisecondes (1 minute)

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [wsConnected, setWsConnected] = useState(false);
  const [evaluationFilter, setEvaluationFilter] = useState("all");

  // Fonction pour récupérer les conversations
  const fetchConversations = useCallback(async (forceRefresh = false) => {
    // Vérifier si le cache a été invalidé manuellement
    if (typeof window !== 'undefined') {
      const cacheInvalidated = window.localStorage.getItem('messagesCacheInvalidated');
      if (cacheInvalidated) {
        // Supprimer le marqueur d'invalidation
        window.localStorage.removeItem('messagesCacheInvalidated');
        forceRefresh = true;
      }
    }

    // Vérifier si nous avons des données en cache et si elles sont encore valides
    const now = Date.now();
    if (!forceRefresh && messagesCache && (now - lastFetchTime < CACHE_DURATION)) {
      console.log("Utilisation des messages en cache");
      setMessages(messagesCache);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Récupération des conversations via le proxy');
      
      // Vérifier si nous sommes côté client avant de faire la requête
      if (typeof window !== 'undefined') {
        console.log('Envoi de la requête à /api/proxy/conversations');
        const response = await fetch(`/api/proxy/conversations`, {
          headers: {
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000),
          cache: 'no-store' // S'assurer d'obtenir les données les plus récentes
        });
        
        console.log('Réponse reçue:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => "Aucun détail disponible");
          console.error(`Erreur HTTP: ${response.status} - ${response.statusText}. Détails:`, errorText);
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}. Détails: ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log("Données reçues du proxy:", responseData);
        console.log("Type de données:", typeof responseData, Array.isArray(responseData) ? "Array" : "Not Array");
        console.log("Nombre d'éléments:", Array.isArray(responseData) ? responseData.length : "N/A");
        
        // Déterminer la structure correcte des données
        let conversationsArray = responseData;
        
        // Si les données sont dans un format différent, adapter en conséquence
        if (responseData.data && Array.isArray(responseData.data)) {
          conversationsArray = responseData.data;
        } else if (!Array.isArray(responseData)) {
          console.error("Format de données inattendu:", responseData);
          throw new Error("Format de données inattendu");
        }
        
        // Transformer les données pour correspondre à notre format
        const formattedMessages = conversationsArray.map(conv => {
          // S'assurer que toutes les propriétés nécessaires existent
          if (!conv) return null;
          
          return {
            id: conv.id || conv._id,
            user: "Utilisateur",
            message: conv.user_message || "",
            response: conv.response || "",
            timestamp: conv.timestamp || new Date().toISOString(),
            status: conv.status || (conv.evaluation?.rating === 1 ? 'resolu' : 'en_attente'),
            evaluation: conv.evaluation?.rating === 1 ? 1 : conv.evaluation?.rating === 0 ? 0 : null,
            video: conv.video,
            image: conv.image,
            buttons: conv.buttons || []
          };
        }).filter(msg => msg !== null); // Filtrer les éléments null
        
        // Mettre à jour le cache
        messagesCache = formattedMessages;
        lastFetchTime = now;
        
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des conversations:", err);
      
      // Vérifier si l'erreur est liée à un problème de connexion
      if (err.name === 'AbortError') {
        setError("La requête a expiré. Le serveur API est peut-être indisponible ou surchargé.");
      } else if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
        setError("Impossible de se connecter au backend. Veuillez vérifier votre connexion réseau et les variables d'environnement API_URL et API_TOKEN.");
      } else if (err.message.includes('Erreur HTTP')) {
        setError(`Erreur de l'API: ${err.message}`);
      } else {
        setError(`Impossible de charger les messages: ${err.message}`);
      }
      
      // Afficher des informations de débogage dans la console
      console.debug("Tentative de connexion à l'API via le proxy échouée");
      
      // Ne pas définir de messages par défaut en cas d'erreur
      // setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les conversations depuis l'API au chargement
  useEffect(() => {
    // Ajouter un petit délai pour s'assurer que tout est initialisé
    const timer = setTimeout(() => {
      console.log("Démarrage de la récupération des conversations après délai...");
      fetchConversations();
    }, 500);
    
    // Nettoyer le timer si le composant est démonté
    return () => clearTimeout(timer);
  }, [fetchConversations]);

  // Ajouter un écouteur d'événement pour détecter quand l'utilisateur revient sur cette page
  useEffect(() => {
    const handleFocus = () => {
      // Si le cache est périmé, recharger les données
      if (Date.now() - lastFetchTime > CACHE_DURATION) {
        fetchConversations(true);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchConversations]);

  // Configurer la connexion WebSocket
  useEffect(() => {
    // Vérifier si nous sommes côté client
    if (typeof window === 'undefined') return;
    
    let ws = null;
    let reconnectTimeout = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    
    const connectWebSocket = () => {
      // Éviter les connexions multiples
      if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
        // console.log('Connexion WebSocket déjà établie ou en cours d\'établissement');
        return;
      }
      
      // Limiter les tentatives de reconnexion
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error("Nombre maximum de tentatives de reconnexion atteint. Le backend n'est probablement pas disponible.");
        setError("Le serveur de messages n'est pas joignable. Veuillez vérifier que le backend est en cours d'exécution.");
        setWsConnected(false);
        return;
      }
      
      // console.log('Création d\'une nouvelle connexion WebSocket');
      
      try {
        // Utiliser le proxy pour obtenir l'URL WebSocket
        fetch('/api/proxy/ws')
          .then(response => {
            if (!response.ok) {
              throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            if (!data.wsUrl) {
              throw new Error('URL WebSocket non disponible');
            }
            
            ws = new WebSocket(data.wsUrl);
            
            ws.onopen = () => {
              // console.log('WebSocket connecté');
              reconnectAttempts = 0; // Réinitialiser le compteur après une connexion réussie
              setWsConnected(true);
              setError(null); // Effacer les erreurs précédentes
            };
            
            ws.onmessage = (event) => {
              try {
                const message = JSON.parse(event.data);
                
                switch (message.type) {
                  case 'update_conversation':
                    if (message.data) {
                      setMessages(prevMessages => {
                        const updatedMessages = prevMessages.map(msg => {
                          if (msg.id === message.data.id) {
                            return {
                              ...msg,
                              status: message.data.status || msg.status,
                              evaluation: message.data.evaluation?.rating === 1 ? 1 :
                                         message.data.evaluation?.rating === 0 ? 0 : null
                            };
                          }
                          return msg;
                        });
                        
                        // Mettre à jour le cache avec les nouvelles données
                        messagesCache = updatedMessages;
                        lastFetchTime = Date.now();
                        
                        return updatedMessages;
                      });
                    }
                    break;
                    
                  case 'evaluation_update':
                    if (message.data) {
                      setMessages(prevMessages => {
                        const updatedMessages = prevMessages.map(msg => {
                          if (msg.id === message.data.id) {
                            // Déterminer le nouveau statut en fonction de l'évaluation
                            // Une évaluation positive (1) marque comme résolu, une évaluation négative (0) reste en attente
                            const newStatus = message.data.evaluation?.rating === 1 ? 'resolu' : 'en_attente';
                            
                            return {
                              ...msg,
                              evaluation: message.data.evaluation?.rating,
                              status: newStatus
                            };
                          }
                          return msg;
                        });
                        
                        // Mettre à jour le cache avec les nouvelles données
                        messagesCache = updatedMessages;
                        lastFetchTime = Date.now();
                        
                        return updatedMessages;
                      });
                    }
                    break;
                    
                  case 'new_conversation':
                    if (message.data) {
                      setMessages(prevMessages => {
                        // Vérifier si la conversation existe déjà
                        const exists = prevMessages.some(msg => msg.id === message.data.id);
                        if (exists) return prevMessages;
                        
                        // Formater la nouvelle conversation
                        const newConversation = {
                          id: message.data.id,
                          user: "Utilisateur",
                          message: message.data.user_message || "",
                          response: message.data.response || "",
                          timestamp: message.data.timestamp || new Date().toISOString(),
                          status: message.data.status || 'en_attente',
                          evaluation: message.data.evaluation?.rating === 1 ? 1 : 
                                     message.data.evaluation?.rating === 0 ? 0 : null,
                          video: message.data.video,
                          image: message.data.image,
                          buttons: message.data.buttons || []
                        };
                        
                        // Ajouter la nouvelle conversation au début de la liste
                        const updatedMessages = [newConversation, ...prevMessages];
                        
                        // Mettre à jour le cache avec les nouvelles données
                        messagesCache = updatedMessages;
                        lastFetchTime = Date.now();
                        
                        return updatedMessages;
                      });
                    }
                    break;
                    
                  case 'delete_conversation':
                    if (message.data && message.data.id) {
                      setMessages(prevMessages => {
                        const updatedMessages = prevMessages.filter(msg => msg.id !== message.data.id);
                        
                        // Mettre à jour le cache avec les nouvelles données
                        messagesCache = updatedMessages;
                        lastFetchTime = Date.now();
                        
                        return updatedMessages;
                      });
                    }
                    break;
                    
                  default:
                    console.log('Message WebSocket non géré:', message);
                }
              } catch (error) {
                console.error('Erreur lors du traitement du message WebSocket:', error);
              }
            };
            
            ws.onclose = (event) => {
              console.log(`WebSocket fermé avec le code: ${event.code}`);
              setWsConnected(false);
              
              // Tenter de se reconnecter après un délai, sauf si la fermeture est intentionnelle
              if (event.code !== 1000) {
                reconnectAttempts++;
                const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
                console.log(`Tentative de reconnexion dans ${reconnectDelay}ms (tentative ${reconnectAttempts}/${maxReconnectAttempts})`);
                
                reconnectTimeout = setTimeout(() => {
                  connectWebSocket();
                }, reconnectDelay);
              }
            };
            
            ws.onerror = (error) => {
              console.error('Erreur WebSocket:', error);
              // La gestion des erreurs est déjà faite dans onclose
            };
          })
          .catch(error => {
            console.error('Erreur lors de la récupération de l\'URL WebSocket:', error);
            setError("Impossible de se connecter au serveur de messages en temps réel.");
            
            // Tenter de se reconnecter après un délai
            reconnectAttempts++;
            const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            reconnectTimeout = setTimeout(() => {
              connectWebSocket();
            }, reconnectDelay);
          });
      } catch (error) {
        console.error('Erreur lors de la création de la connexion WebSocket:', error);
      }
    };
    
    // Établir la connexion WebSocket
    connectWebSocket();
    
    // Nettoyer la connexion WebSocket lors du démontage du composant
    return () => {
      if (ws) {
        ws.close(1000, "Composant démonté");
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // Modifier la fonction de filtrage pour inclure le tri
  const filteredMessages = useMemo(() => {
    let result = [...messages];
    
    // Filtrage par statut
    if (filter !== "all") {
      result = result.filter((message) => {
        // S'assurer que le status est bien défini
        const messageStatus = message.status || 'en_attente';
        return messageStatus === filter;
      });
    }
    
    // Filtrage par évaluation
    if (evaluationFilter !== "all") {
      switch (evaluationFilter) {
        case "positive":
          result = result.filter(message => message.evaluation === 1);
          break;
        case "negative":
          result = result.filter(message => message.evaluation === 0);
          break;
        case "no-feedback":
          result = result.filter(message => message.evaluation === null);
          break;
      }
    }
    
    // Filtrage par recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (message) =>
          message.message?.toLowerCase().includes(term) ||
          message.response?.toLowerCase().includes(term) ||
          message.user?.toLowerCase().includes(term)
      );
    }
    
    // Tri par date
    return result.sort((a, b) => {
      if (sortOrder === "desc") {
        return new Date(b.timestamp) - new Date(a.timestamp);
      } else {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
    });
  }, [messages, filter, searchTerm, sortOrder, evaluationFilter]);

  // Fonction pour réessayer le chargement
  const handleRetry = () => {
    fetchConversations(true); // Force le rechargement des données
  };

  // Fonction pour mettre à jour le statut d'un message
  const updateMessageStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/proxy/conversations/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Mettre à jour l'état local
      setMessages(prevMessages => {
        const updatedMessages = prevMessages.map(msg => {
          if (msg.id === id) {
            return { ...msg, status };
          }
          return msg;
        });
        
        // Mettre à jour le cache avec les nouvelles données
        messagesCache = updatedMessages;
        lastFetchTime = Date.now();
        
        return updatedMessages;
      });
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut du message ${id}:`, error);
      return false;
    }
  };

  // Mettre à jour les fonctions de gestion des statuts
  const markAsResolved = (id, newStatus = 'resolu') => updateMessageStatus(id, newStatus);
  const archiveMessage = (id) => updateMessageStatus(id, 'archive');

  // Fonction pour supprimer un message
  const deleteMessage = async (id) => {
    try {
      const response = await fetch(`/api/proxy/conversations/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Mettre à jour l'état local
      setMessages(prevMessages => {
        const updatedMessages = prevMessages.filter(msg => msg.id !== id);
        
        // Mettre à jour le cache avec les nouvelles données
        messagesCache = updatedMessages;
        lastFetchTime = Date.now();
        
        return updatedMessages;
      });
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du message ${id}:`, error);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <div className="flex space-x-2">
          <MessageSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <MessageFilter filter={filter} setFilter={setFilter} />
          <MessageEvaluationFilter evaluationFilter={evaluationFilter} setEvaluationFilter={setEvaluationFilter} />
          <MessageSort sortOrder={sortOrder} setSortOrder={setSortOrder} />
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                disabled={loading}
              >
                Réessayer
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des messages */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des messages ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageList
            messages={filteredMessages}
            loading={loading}
            error={null} // On gère l'erreur au-dessus maintenant
            onMarkAsResolved={markAsResolved}
            onDelete={deleteMessage}
            onArchive={archiveMessage}
          />
        </CardContent>
      </Card>
    </div>
  );
}