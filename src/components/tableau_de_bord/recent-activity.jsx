import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getCachedData, setCachedData } from "@/lib/cache";

// Fonction pour normaliser les timestamps
const normalizeTimestamp = (timestamp) => {
  if (!timestamp) return new Date();
  
  // Si c'est déjà un objet Date
  if (timestamp instanceof Date) return timestamp;
  
  // Si c'est un nombre (timestamp en millisecondes)
  if (typeof timestamp === 'number') return new Date(timestamp);
  
  // Si c'est une chaîne de caractères
  if (typeof timestamp === 'string') {
    // Essayer de parser la date
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) return date;
    
    // Si c'est un timestamp en secondes (10 chiffres)
    if (/^\d{10}$/.test(timestamp)) {
      return new Date(parseInt(timestamp) * 1000);
    }
    
    // Si c'est un timestamp en millisecondes (13 chiffres)
    if (/^\d{13}$/.test(timestamp)) {
      return new Date(parseInt(timestamp));
    }
  }
  
  // Par défaut, retourner la date actuelle
  console.error("Format de date non reconnu:", timestamp);
  return new Date();
};

export function RecentActivity() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isSubscribed = true; // Pour éviter les mises à jour si le composant est démonté
    let ws = null; // Pour stocker la référence WebSocket

    const setupWebSocket = async () => {
      try {
        const wsResponse = await fetch('/api/proxy/ws');
        if (!wsResponse.ok) {
          throw new Error('Impossible de récupérer l\'URL WebSocket');
        }
        
        const { wsUrl } = await wsResponse.json();
        ws = new WebSocket(wsUrl);
        
        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          
          try {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
              case 'new_conversation':
                if (message.data) {
                  setMessages(prevMessages => {
                    const messageId = message.data.id || message.data._id;
                    if (prevMessages.some(msg => msg.id === messageId)) {
                      return prevMessages;
                    }
                    
                    const newMessage = {
                      id: messageId,
                      user: "Utilisateur",
                      message: message.data.user_message 
                        ? message.data.user_message.substring(0, 100) + (message.data.user_message.length > 100 ? "..." : "") 
                        : message.data.message || "Aucun contenu disponible",
                      timestamp: message.data.created_at || message.data.timestamp || new Date().toISOString(),
                      status: message.data.status || "completed"
                    };
                    
                    setLoading(false);
                    setError(null);
                    
                    const updatedMessages = [newMessage, ...prevMessages].slice(0, 3);
                    setCachedData('recentActivity', updatedMessages);
                    return updatedMessages;
                  });
                }
                break;
              
              case 'delete_conversation':
                if (message.data && message.data.id) {
                  setMessages(prevMessages => {
                    const updatedMessages = prevMessages.filter(msg => msg.id !== message.data.id);
                    setCachedData('recentActivity', updatedMessages);
                    return updatedMessages;
                  });
                }
                break;
                
              case 'update_conversation':
                if (message.data && message.data.id) {
                  setMessages(prevMessages => {
                    const updatedMessages = prevMessages.map(msg => 
                      msg.id === message.data.id 
                        ? {
                            ...msg,
                            message: message.data.user_message 
                              ? message.data.user_message.substring(0, 100) + (message.data.user_message.length > 100 ? "..." : "") 
                              : message.data.message || msg.message,
                            status: message.data.status || msg.status
                          }
                        : msg
                    );
                    setCachedData('recentActivity', updatedMessages);
                    return updatedMessages;
                  });
                }
                break;
            }
          } catch (err) {
            console.error("Erreur lors du traitement du message WebSocket:", err);
          }
        };
      } catch (error) {
        console.error('Erreur lors de la configuration WebSocket:', error);
        if (isSubscribed) {
          setError("Impossible de se connecter aux mises à jour en temps réel");
        }
      }
    };

    const fetchInitialData = async () => {
      try {
        if (!isSubscribed) return;
        setLoading(true);
        setError(null);
        
        // Vérifier le cache d'abord
        const cachedMessages = getCachedData('recentActivity');
        if (cachedMessages && cachedMessages.length > 0) {
          setMessages(cachedMessages);
          setLoading(false);
          return;
        }
        
        // Faire l'appel API initial seulement si pas de cache
        const response = await fetch(`/api/proxy/conversations?limit=3`, {
          headers: {
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000),
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || (Array.isArray(data) && data.length === 0) || 
            (data.conversations && Array.isArray(data.conversations) && data.conversations.length === 0)) {
          if (isSubscribed) {
            setMessages([]);
            setLoading(false);
          }
          return;
        }

        // Fonction helper pour extraire le message
        const extractMessage = (conv) => {
          if (!conv) return '';
          
          if (conv.user_message) return conv.user_message;
          if (conv.message) return conv.message;
          if (conv.question) return conv.question;
          
          if (conv.messages && Array.isArray(conv.messages) && conv.messages.length > 0) {
            const firstMessage = conv.messages[0];
            if (typeof firstMessage === 'string') return firstMessage;
            return firstMessage.content || firstMessage.text || firstMessage.message || '';
          }
          
          return '';
        };
        
        // Formater et filtrer les messages comme avant...
        const formattedMessages = (Array.isArray(data) ? data : (data.conversations || []))
          .map(conv => {
            const message = extractMessage(conv);
            return {
              id: conv.id || conv._id,
              user: "Utilisateur",
              message: message 
                ? message.substring(0, 100) + (message.length > 100 ? "..." : "")
                : null,
              timestamp: conv.created_at || conv.timestamp || new Date().toISOString(),
              status: conv.status || "completed"
            };
          })
          .filter(msg => msg.message)
          .sort((a, b) => {
            const dateA = normalizeTimestamp(a.timestamp);
            const dateB = normalizeTimestamp(b.timestamp);
            return dateB - dateA;
          })
          .slice(0, 3);

        if (isSubscribed) {
          if (formattedMessages.length === 0) {
            setError("Aucune conversation récente disponible");
            setMessages([]);
          } else {
            setMessages(formattedMessages);
            setCachedData('recentActivity', formattedMessages);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
        if (isSubscribed) {
          setError("Impossible de charger les messages récents");
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    // Lancer le chargement initial et la configuration WebSocket
    fetchInitialData();
    setupWebSocket();

    // Fonction de nettoyage
    return () => {
      isSubscribed = false;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []); // Dépendances vides pour ne s'exécuter qu'au montage

  const formatTimeAgo = (timestamp) => {
    try {
      if (!timestamp) return "date inconnue";
      
      // Normaliser le timestamp
      const date = normalizeTimestamp(timestamp);
      
      // Calculer la différence en secondes
      const diffInSeconds = Math.floor((new Date() - date) / 1000);
      
      // Si moins de 60 secondes, afficher "À l'instant"
      if (diffInSeconds < 60) {
        return "À l'instant";
      }
      
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (error) {
      console.error("Erreur de formatage de date:", error, "pour timestamp:", timestamp);
      return "date inconnue";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
        <CardDescription>
          Les dernières interactions avec le chatbot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement des interactions récentes...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune interaction récente</p>
          ) : (
            messages.map((message) => (
              <div key={`message-${message.id}`} className="flex items-start gap-4 rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate max-w-[300px]">{message.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeAgo(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}