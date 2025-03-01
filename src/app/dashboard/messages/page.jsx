"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrashIcon, MagnifyingGlassIcon, ArchiveIcon } from "@radix-ui/react-icons";
import React from "react";

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

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

  // Filtrer les messages en fonction de la recherche et du filtre
  const filteredMessages = messages.filter((message) => {
    // S'assurer que message a un id valide
    if (!message || !message.id) {
      console.warn("Message sans id détecté:", message);
      return false;
    }
    
    const matchesSearch =
      (message.user && message.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.message && message.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.response && message.response.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filter === "all") return matchesSearch;
    return matchesSearch && message.status === filter;
  });

  // Formater la date
  const formatDate = (dateString) => {
    try {
      // Vérifier si la date est valide
      if (!dateString) return "Date inconnue";
      
      // Essayer de créer une date directement
      let date = new Date(dateString);
      
      // Si la date n'est pas valide, essayer de nettoyer le format
      if (isNaN(date.getTime())) {
        // Essayer de supprimer les microsecondes si présentes
        const cleanDateString = dateString.split('.')[0];
        date = new Date(cleanDateString);
        
        // Si toujours pas valide, retourner un message d'erreur
        if (isNaN(date.getTime())) {
          console.warn("Date invalide:", dateString);
          return "Date invalide";
        }
      }
      
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return "Erreur de date";
    }
  };

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
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous</option>
            <option value="resolved">Résolus</option>
            <option value="pending">En attente</option>
            <option value="archived">Archivés</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des messages ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Aucun message trouvé
                </p>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id || `message-${Math.random()}`}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{message.user}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(message.timestamp)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => archiveMessage(message.id)}
                        >
                          <ArchiveIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMessage(message.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Question:</p>
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Réponse:</p>
                      <p className="text-sm">
                        {message.response || "Pas encore de réponse"}
                      </p>
                    </div>
                    
                    {/* Afficher les médias si présents */}
                    {message.image && (
                      <div>
                        <p className="font-medium text-sm">Image:</p>
                        <img 
                          src={message.image} 
                          alt="Image jointe" 
                          className="max-w-full h-auto rounded mt-1"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                    
                    {message.video && (
                      <div>
                        <p className="font-medium text-sm">Vidéo:</p>
                        <video 
                          controls 
                          className="max-w-full h-auto rounded mt-1"
                          style={{ maxHeight: '200px' }}
                        >
                          <source src={message.video} />
                          Votre navigateur ne supporte pas la lecture de vidéos.
                        </video>
                      </div>
                    )}
                    
                    {message.buttons && message.buttons.length > 0 && (
                      <div>
                        <p className="font-medium text-sm">Actions suggérées:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {message.buttons.map((btn, idx) => (
                            <Button key={idx} variant="outline" size="sm">
                              {btn.text || btn}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          message.status === "resolved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : message.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                        }`}
                      >
                        {message.status === "resolved"
                          ? "Résolu"
                          : message.status === "pending"
                          ? "En attente"
                          : "Archivé"}
                      </span>
                      {message.status !== "resolved" && (
                        <Button size="sm" onClick={() => markAsResolved(message.id)}>
                          Marquer comme résolu
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 