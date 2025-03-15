"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { MessageList, MessageFilter, MessageSearch, MessageSort, MessageEvaluationFilter } from "@/components/messages";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
  const fetchConversations = async () => {
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
          signal: AbortSignal.timeout(10000)
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
      console.debug("Variables d'environnement (masquées):", {
        API_URL: process.env.NEXT_PUBLIC_API_URL ? "défini" : "non défini",
        API_TOKEN: process.env.NEXT_PUBLIC_API_TOKEN ? "défini" : "non défini"
      });
      
      // Ne pas définir de messages par défaut en cas d'erreur
      // setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les conversations depuis l'API au chargement
  useEffect(() => {
    // Ajouter un petit délai pour s'assurer que tout est initialisé
    const timer = setTimeout(() => {
      console.log("Démarrage de la récupération des conversations après délai...");
      fetchConversations();
    }, 500);
    
    // Nettoyer le timer si le composant est démonté
    return () => clearTimeout(timer);
  }, []);

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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const wsUrl = apiUrl.replace('http', 'ws');
        const wsToken = process.env.NEXT_PUBLIC_WEBSOCKET_TOKEN;
        
        ws = new WebSocket(`${wsUrl}/ws?token=${wsToken}`);
        
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
                    return prevMessages.map(msg => {
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
                  });
                }
                break;
                
              case 'evaluation_update':
                if (message.data) {
                  setMessages(prevMessages => {
                    return prevMessages.map(msg => {
                      if (msg.id === message.data.id) {
                        // Déterminer le nouveau statut en fonction de l'évaluation
                        // Une évaluation positive (1) marque comme résolu, une évaluation négative (0) reste en attente
                        const newStatus = message.data.evaluation?.rating === 1 ? 'resolu' : 'en_attente';
                        
                        return {
                          ...msg,
                          status: newStatus,
                          evaluation: message.data.evaluation?.rating === 1 ? 1 :
                                     message.data.evaluation?.rating === 0 ? 0 : null
                        };
                      }
                      return msg;
                    });
                  });
                }
                break;
                
              case 'new_conversation':
                if (message.data) {
                  const data = message.data;
                  
                  if (!data || (!data.id && !data._id)) {
                    console.error("Données WebSocket invalides:", data);
                    return;
                  }
                  
                  // Déterminer le statut en fonction de l'évaluation
                  const status = data.evaluation?.rating === 1 ? 'resolu' : 'en_attente';
                  
                  const formattedMessage = {
                    id: data.id || data._id,
                    user: "Utilisateur",
                    message: data.user_message || "",
                    response: data.response || "",
                    timestamp: data.timestamp || new Date().toISOString(),
                    status: data.status || status,
                    evaluation: data.evaluation?.rating === 1 ? 1 : 
                               data.evaluation?.rating === 0 ? 0 : null,
                    video: data.video,
                    image: data.image,
                    buttons: data.buttons || []
                  };
                  
                  setMessages(prevMessages => {
                    const exists = prevMessages.some(msg => msg.id === formattedMessage.id);
                    if (exists) {
                      return prevMessages.map(msg => 
                        msg.id === formattedMessage.id ? formattedMessage : msg
                      );
                    } else {
                      return [formattedMessage, ...prevMessages];
                    }
                  });
                }
                break;
                
              case 'metrics_update':
                // Gérer la mise à jour des métriques si nécessaire
                break;
            }
          } catch (err) {
            console.error("Erreur lors du traitement du message WebSocket:", err);
          }
        };
        
        ws.onerror = (error) => {
          console.error('Erreur WebSocket:', error);
          setWsConnected(false);
        };
        
        ws.onclose = () => {
          // console.log('WebSocket déconnecté');
          setWsConnected(false);
          
          // Tentative de reconnexion avec délai exponentiel
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Délai exponentiel plafonné à 30s
            
            // console.log(`Tentative de reconnexion WebSocket dans ${delay/1000} secondes (tentative ${reconnectAttempts}/${maxReconnectAttempts})`);
            
            reconnectTimeout = setTimeout(() => {
              connectWebSocket();
            }, delay);
          } else {
            setError("Le serveur de messages n'est pas joignable. Veuillez vérifier que le backend est en cours d'exécution.");
          }
        };
      } catch (error) {
        console.error("Erreur lors de la création du WebSocket:", error);
        setError("Impossible de se connecter au serveur de messages");
        setWsConnected(false);
      }
    };
    
    connectWebSocket();
    
    // Nettoyer la connexion WebSocket lors du démontage du composant
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        // console.log('Fermeture de la connexion WebSocket');
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []); // Dépendance vide pour n'exécuter qu'une seule fois

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

  // Mettre à jour la fonction markAsResolved pour utiliser le proxy
  const updateMessageStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/proxy/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'status',
          conversationId: id,
          status: status
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Mettre à jour l'état local en attendant la mise à jour via WebSocket
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === id ? { ...msg, status } : msg
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du status:", error);
      setError("Impossible de mettre à jour le status du message");
    }
  };

  // Mettre à jour les fonctions de gestion des statuts
  const markAsResolved = (id, newStatus = 'resolu') => updateMessageStatus(id, newStatus);
  const archiveMessage = (id) => updateMessageStatus(id, 'archive');

  // Supprimer un message en utilisant le proxy
  const deleteMessage = async (id) => {
    try {
      console.log(`Tentative de suppression du message avec l'ID: ${id}`);
      
      // Supprimer le message de l'interface immédiatement pour une meilleure expérience utilisateur
      setMessages(prevMessages => prevMessages.filter(message => message.id !== id));
      
      // Envoyer la requête de suppression au backend
      const response = await fetch(`/api/proxy/conversations?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Réponse de suppression reçue:`, response.status, response.statusText);
      
      // Si la requête échoue avec une erreur autre que 404, afficher un message d'erreur
      if (!response.ok && response.status !== 404) {
        const errorText = await response.text().catch(() => "Aucun détail disponible");
        console.error(`Erreur HTTP lors de la suppression: ${response.status} - ${response.statusText}. Détails:`, errorText);
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      
      console.log(`Message avec l'ID ${id} supprimé avec succès`);
      
    } catch (error) {
      console.error("Erreur lors de la suppression du message:", error);
      // Ne pas afficher d'erreur à l'utilisateur car le message a déjà été supprimé de l'interface
      // setError(`Impossible de supprimer le message: ${error.message}`);
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
                onClick={fetchConversations}
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