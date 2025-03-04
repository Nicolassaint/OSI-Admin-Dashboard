"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { MessageList, MessageFilter, MessageSearch, MessageSort } from "@/components/messages";

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [wsConnected, setWsConnected] = useState(false);

  // Récupérer les conversations depuis l'API
  useEffect(() => {
    // Créer la référence en dehors de useEffect
    const fetchInProgress = { current: false };
    
    const fetchConversations = async () => {
      // Si une requête est déjà en cours, ne pas en lancer une nouvelle
      if (fetchInProgress.current) return;
      
      fetchInProgress.current = true;
      
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
        
        console.log('Récupération des conversations depuis l\'API');
        
        // Vérifier si nous sommes côté client avant de faire la requête
        if (typeof window !== 'undefined') {
          const response = await fetch(`${apiUrl}/api/conversations?token=${apiToken}`, {
            headers: {
              'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(10000)
          });
          
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Transformer les données pour correspondre à notre format
          const formattedMessages = data.map(conv => ({
            id: conv.id || conv._id,
            user: "Utilisateur",
            message: conv.user_message,
            response: conv.response || "",
            timestamp: conv.timestamp,
            status: conv.evaluation ? "resolved" : "pending",
            evaluation: conv.evaluation,
            video: conv.video,
            image: conv.image,
            buttons: conv.buttons || []
          }));
          
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des conversations:", err);
        
        // Vérifier si l'erreur est liée à un problème de connexion
        if (err.name === 'AbortError' || err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
          setError("Le backend n'est pas joignable. Veuillez vérifier votre connexion.");
        } else {
          setError("Impossible de charger les messages. Veuillez réessayer plus tard.");
        }
        
        // Ne pas définir de messages par défaut en cas d'erreur
        setMessages([]);
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
      }
    };

    fetchConversations();
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
            // console.log("Données WebSocket reçues:", message);
            
            // Vérifier si c'est un message de type 'new_conversation'
            if (message.type === 'new_conversation' && message.data) {
              const data = message.data;
              
              // Vérifier si les données ont la structure attendue
              if (!data || (!data.id && !data._id)) {
                console.error("Données WebSocket invalides:", data);
                return;
              }
              
              // Transformer la nouvelle conversation au format attendu
              const formattedMessage = {
                id: data.id || data._id,
                user: "Utilisateur",
                message: data.user_message || "",
                response: data.response || "",
                timestamp: data.timestamp || new Date().toISOString(),
                status: data.evaluation ? "resolved" : "pending",
                evaluation: data.evaluation,
                video: data.video,
                image: data.image,
                buttons: data.buttons || []
              };
              
              // Ajouter le nouveau message ou mettre à jour un existant
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
            } else {
              // console.log("Message WebSocket ignoré (type non géré):", message);
            }
          } catch (err) {
            console.error("Erreur lors du traitement du message WebSocket:", err, "Données brutes:", event.data);
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
      result = result.filter((message) => message.status === filter);
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
    result.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [messages, filter, searchTerm, sortOrder]);

  // Marquer un message comme résolu
  const markAsResolved = (id) => {
    setMessages(
      messages.map((message) =>
        message.id === id ? { ...message, status: "resolved" } : message
      )
    );
    
    // Ici, vous pourriez également envoyer une requête à votre API
    // pour mettre à jour le statut dans la base de données
  };

  // Supprimer un message (pourrait être adapté pour appeler votre API)
  const deleteMessage = (id) => {
    setMessages(messages.filter((message) => message.id !== id));
  };

  // Archiver un message
  const archiveMessage = (id) => {
    setMessages(
      messages.map((message) =>
        message.id === id ? { ...message, status: "archived" } : message
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <div className="flex space-x-2">
          <MessageSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <MessageFilter filter={filter} setFilter={setFilter} />
          <MessageSort sortOrder={sortOrder} setSortOrder={setSortOrder} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Liste des messages ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageList 
            messages={filteredMessages}
            loading={loading}
            error={error}
            onMarkAsResolved={markAsResolved}
            onDelete={deleteMessage}
            onArchive={archiveMessage}
          />
        </CardContent>
      </Card>
    </div>
  );
} 