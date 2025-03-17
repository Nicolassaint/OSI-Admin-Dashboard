"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { MessageList, MessageFilter, MessageSearch, MessageSort, MessageEvaluationFilter } from "@/components/messages";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";

// Cache global pour stocker les messages entre les navigations
let messagesCache = null;
let lastFetchTime = 0;
// La durée du cache est de 5 minutes car les mises à jour sont gérées par WebSocket
const CACHE_DURATION = 300000; // 5 minutes en millisecondes

// Cache pour les détails des messages
const messageDetailsCache = new Map();
const CACHE_DURATION_DETAILS = 300000; // 5 minutes

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [wsConnected, setWsConnected] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Fonction pour récupérer les conversations avec pagination
  const fetchConversations = useCallback(async (page = 1, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
        sort: sortOrder,
        filter: filter
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      console.log('Fetching conversations with params:', params.toString());

      const response = await fetch(`/api/proxy/conversations?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000),
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Aucun détail disponible");
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}. Détails: ${errorText}`);
      }
      
      const data = await response.json();
      // console.log('Received data:', data);
      
      // Mettre à jour les messages et la pagination
      setMessages(data.conversations);
      setPagination(data.pagination);
      
    } catch (err) {
      console.error("Erreur lors de la récupération des conversations:", err);
      
      if (err.name === 'AbortError') {
        setError("La requête a expiré. Le serveur API est peut-être indisponible ou surchargé.");
      } else if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
        setError("Impossible de se connecter au backend. Veuillez vérifier votre connexion réseau.");
      } else {
        setError(`Impossible de charger les messages: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [sortOrder, filter, searchTerm, pagination.itemsPerPage]);

  // Effet pour recharger les messages quand les filtres changent
  useEffect(() => {
    fetchConversations(1, true);
  }, [fetchConversations, sortOrder, filter, searchTerm]);

  // Gestionnaire de changement de page
  const handlePageChange = useCallback((newPage) => {
    fetchConversations(newPage);
  }, [fetchConversations]);

  // Optimiser la recherche avec debounce
  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

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
        // // console.log('Connexion WebSocket déjà établie ou en cours d\'établissement');
        return;
      }
      
      // Limiter les tentatives de reconnexion
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error("Nombre maximum de tentatives de reconnexion atteint. Le backend n'est probablement pas disponible.");
        setError("Le serveur de messages n'est pas joignable. Veuillez vérifier que le backend est en cours d'exécution.");
        setWsConnected(false);
        return;
      }
      
      // // console.log('Création d\'une nouvelle connexion WebSocket');
      
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
              // // console.log('WebSocket connecté');
              reconnectAttempts = 0; // Réinitialiser le compteur après une connexion réussie
              setWsConnected(true);
              setError(null); // Effacer les erreurs précédentes
            };
            
            ws.onmessage = (event) => {
              try {
                const message = JSON.parse(event.data);
                
                switch (message.type) {
                  case 'update_conversation':
                  case 'evaluation_update':
                  case 'new_conversation':
                  case 'delete_conversation':
                    if (message.data) {
                      setMessages(prevMessages => {
                        let updatedMessages;
                        
                        switch (message.type) {
                          case 'update_conversation':
                            updatedMessages = prevMessages.map(msg => 
                              msg.id === message.data.id 
                                ? { ...msg, status: message.data.status || msg.status, evaluation: message.data.evaluation?.rating === 1 ? 1 : message.data.evaluation?.rating === 0 ? 0 : null }
                                : msg
                            );
                            break;
                            
                          case 'evaluation_update':
                            updatedMessages = prevMessages.map(msg => 
                              msg.id === message.data.id 
                                ? { 
                                    ...msg, 
                                    evaluation: message.data.evaluation?.rating,
                                    status: message.data.evaluation?.rating === 1 ? 'resolu' : 'en_attente'
                                  }
                                : msg
                            );
                            break;
                            
                          case 'new_conversation':
                            if (!prevMessages.some(msg => msg.id === message.data.id)) {
                              const newConversation = {
                                id: message.data.id,
                                user: "Utilisateur",
                                message: message.data.user_message || "",
                                response: message.data.response || "",
                                timestamp: message.data.timestamp || new Date().toISOString(),
                                status: message.data.status || 'en_attente',
                                evaluation: message.data.evaluation?.rating === 1 ? 1 : message.data.evaluation?.rating === 0 ? 0 : null,
                                video: message.data.video,
                                image: message.data.image,
                                buttons: message.data.buttons || []
                              };
                              updatedMessages = [newConversation, ...prevMessages];
                            } else {
                              return prevMessages;
                            }
                            break;
                            
                          case 'delete_conversation':
                            updatedMessages = prevMessages.filter(msg => msg.id !== message.data.id);
                            break;
                        }
                        
                        // Mettre à jour le cache uniquement si les messages ont changé
                        if (JSON.stringify(updatedMessages) !== JSON.stringify(prevMessages)) {
                          messagesCache = updatedMessages;
                          lastFetchTime = Date.now();
                        }
                        
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
              // console.log(`WebSocket fermé avec le code: ${event.code}`);
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

  // Fonction de préchargement des données
  const preloadMessageData = useCallback(async (id) => {
    if (!id) return;
    
    // Vérifier si les données sont déjà en cache
    const cachedData = messageDetailsCache.get(id);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION_DETAILS)) {
      return cachedData.data;
    }
    
    try {
      const response = await fetch(`/api/proxy/conversations/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'force-cache',
        next: { revalidate: 300 }
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      // Stocker les données préchargées dans le cache
      messageDetailsCache.set(id, {
        data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Erreur de préchargement:', error);
      return null;
    }
  }, []);

  // Fonction pour nettoyer le cache des détails
  const cleanupDetailsCache = useCallback(() => {
    const now = Date.now();
    for (const [id, cache] of messageDetailsCache.entries()) {
      if (now - cache.timestamp > CACHE_DURATION_DETAILS) {
        messageDetailsCache.delete(id);
      }
    }
  }, []);

  // Nettoyer le cache périodiquement
  useEffect(() => {
    const cleanupInterval = setInterval(cleanupDetailsCache, 60000); // Nettoyer toutes les minutes
    return () => clearInterval(cleanupInterval);
  }, [cleanupDetailsCache]);

  // Fonction pour réessayer le chargement
  const handleRetry = () => {
    fetchConversations(1, true); // Force le rechargement des données
  };

  // Optimiser la fonction updateMessageStatus avec debounce
  const updateMessageStatus = useCallback(
    debounce(async (id, status) => {
      try {
        // console.log(`Mise à jour du statut pour ${id} vers ${status}`);
        
        // Mettre à jour l'état local immédiatement
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

        // Appel API en arrière-plan
        const response = await fetch(`/api/proxy/conversations/${id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
          // En cas d'erreur, on remet le statut précédent
          setMessages(prevMessages => {
            const updatedMessages = prevMessages.map(msg => {
              if (msg.id === id) {
                return { ...msg, status: msg.status };
              }
              return msg;
            });
            messagesCache = updatedMessages;
            lastFetchTime = Date.now();
            return updatedMessages;
          });
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        return true;
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du statut du message ${id}:`, error);
        return false;
      }
    }, 300),
    []
  );

  // Mettre à jour les fonctions de gestion des statuts
  const markAsResolved = useCallback((id, newStatus = 'resolu') => {
    // console.log(`markAsResolved appelé pour ${id} avec status ${newStatus}`);
    updateMessageStatus(id, newStatus);
  }, [updateMessageStatus]);

  const archiveMessage = useCallback((id) => {
    // console.log(`archiveMessage appelé pour ${id}`);
    updateMessageStatus(id, 'archive');
  }, [updateMessageStatus]);

  // Optimiser la fonction deleteMessage avec debounce
  const deleteMessage = useCallback(
    debounce(async (id) => {
      try {
        const response = await fetch(`/api/proxy/conversations/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // Mettre à jour l'état local de manière optimisée
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
    }, 300),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <div className="flex space-x-2">
          <MessageSearch searchTerm={searchTerm} setSearchTerm={debouncedSearch} />
          <MessageFilter filter={filter} setFilter={setFilter} />
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
          <CardTitle>Liste des messages ({pagination.totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageList
            messages={messages}
            loading={loading}
            error={null}
            onMarkAsResolved={markAsResolved}
            onDelete={deleteMessage}
            onArchive={archiveMessage}
            onEditHover={preloadMessageData}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}