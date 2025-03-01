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
  const [socket, setSocket] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");

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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
        setError("Impossible de charger les messages. Veuillez réessayer plus tard.");
        
        // Utiliser des données de test en cas d'erreur pour le développement
        setMessages([
          {
            id: "test-1",
            user: "Utilisateur Test",
            message: "Comment réinitialiser mon mot de passe ?",
            response: "Pour réinitialiser votre mot de passe, veuillez vous rendre sur la page de connexion et cliquer sur 'Mot de passe oublié'.",
            timestamp: new Date().toISOString(),
            status: "pending",
            evaluation: null,
            video: null,
            image: null,
            buttons: []
          }
        ]);
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
    
    // Si une connexion existe déjà, ne pas en créer une nouvelle
    if (socket !== null) {
      console.log('Connexion WebSocket déjà établie ou en cours d\'établissement');
      return;
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const wsUrl = apiUrl.replace('http', 'ws');
    const wsToken = process.env.NEXT_PUBLIC_WEBSOCKET_TOKEN;
    
    console.log('Création d\'une nouvelle connexion WebSocket');
    
    try {
      const newSocket = new WebSocket(`${wsUrl}/ws?token=${wsToken}`);
      
      newSocket.onopen = () => {
        console.log('WebSocket connecté');
      };
      
      newSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("Données WebSocket reçues:", message);
          
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
            console.log("Message WebSocket ignoré (type non géré):", message);
          }
        } catch (err) {
          console.error("Erreur lors du traitement du message WebSocket:", err, "Données brutes:", event.data);
        }
      };
      
      newSocket.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };
      
      newSocket.onclose = () => {
        console.log('WebSocket déconnecté');
      };
      
      setSocket(newSocket);
      
      // Nettoyer la connexion WebSocket lors du démontage du composant
      return () => {
        if (newSocket.readyState === WebSocket.OPEN) {
          console.log('Fermeture de la connexion WebSocket');
          newSocket.close();
        }
      };
    } catch (error) {
      console.error("Erreur lors de la création du WebSocket:", error);
    }
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