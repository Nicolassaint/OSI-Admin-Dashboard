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
    const fetchRecentMessages = async () => {
      try {
        setLoading(true);
        
        // Vérifier le cache d'abord
        const cachedMessages = getCachedData('recentActivity');
        if (cachedMessages) {
          setMessages(cachedMessages);
          setLoading(false);
        }
        
        const response = await fetch(`/api/proxy/conversations?limit=3`, {
          headers: {
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Formater les données pour l'affichage
        const formattedMessages = Array.isArray(data) 
          ? data.map(conv => ({
              id: conv.id || conv._id,
              user: "Utilisateur",
              message: conv.user_message 
                ? conv.user_message.substring(0, 100) + (conv.user_message.length > 100 ? "..." : "") 
                : (conv.messages && conv.messages.length > 0 
                  ? conv.messages[0].content.substring(0, 100) + (conv.messages[0].content.length > 100 ? "..." : "") 
                  : "Message vide"),
              timestamp: conv.created_at || conv.timestamp || new Date().toISOString(),
              status: conv.status || "completed"
            }))
          : data.conversations && Array.isArray(data.conversations)
            ? data.conversations.map(conv => ({
                id: conv.id || conv._id,
                user: "Utilisateur",
                message: conv.user_message 
                  ? conv.user_message.substring(0, 100) + (conv.user_message.length > 100 ? "..." : "") 
                  : (conv.messages && conv.messages.length > 0 
                    ? conv.messages[0].content.substring(0, 100) + (conv.messages[0].content.length > 100 ? "..." : "") 
                    : "Message vide"),
                timestamp: conv.created_at || conv.timestamp || new Date().toISOString(),
                status: conv.status || "completed"
              }))
            : [];
        
        // Limiter à 3 messages et s'assurer qu'ils sont triés par date (les plus récents d'abord)
        const sortedMessages = formattedMessages
          .sort((a, b) => {
            const dateA = normalizeTimestamp(a.timestamp);
            const dateB = normalizeTimestamp(b.timestamp);
            return dateB - dateA;
          })
          .slice(0, 3);
        
        setMessages(sortedMessages);
        setCachedData('recentActivity', sortedMessages);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des messages récents:', error);
        setError("Impossible de charger les messages récents");
        setLoading(false);
      }
    };
    
    fetchRecentMessages();
    
    // Configurer WebSocket pour les mises à jour en temps réel
    const connectWebSocket = async () => {
      try {
        // Récupérer l'URL WebSocket depuis notre proxy
        const wsResponse = await fetch('/api/proxy/ws');
        if (!wsResponse.ok) {
          throw new Error('Impossible de récupérer l\'URL WebSocket');
        }
        
        const { wsUrl } = await wsResponse.json();
        
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connecté pour les activités récentes');
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            // Vérifier si c'est un message de type 'new_conversation'
            if (message.type === 'new_conversation' && message.data) {
              // Ajouter le nouveau message au début de la liste
              setMessages(prevMessages => {
                const messageId = message.data.id || message.data._id;
                
                // Vérifier si le message existe déjà dans la liste
                const messageExists = prevMessages.some(msg => msg.id === messageId);
                if (messageExists) {
                  // Si le message existe déjà, ne pas le rajouter
                  return prevMessages;
                }
                
                const newMessage = {
                  id: messageId,
                  user: "Utilisateur",
                  message: message.data.user_message 
                    ? message.data.user_message.substring(0, 100) + (message.data.user_message.length > 100 ? "..." : "") 
                    : (message.data.messages && message.data.messages.length > 0 
                      ? message.data.messages[0].content.substring(0, 100) + (message.data.messages[0].content.length > 100 ? "..." : "") 
                      : "Message vide"),
                  timestamp: message.data.created_at || message.data.timestamp || new Date().toISOString(),
                  status: message.data.status || "completed"
                };
                
                // Ajouter au début et limiter à 3 éléments
                return [newMessage, ...prevMessages].slice(0, 3);
              });
            }
          } catch (err) {
            console.error("Erreur lors du traitement du message WebSocket:", err);
          }
        };
        
        ws.onerror = (error) => {
          console.error('Erreur WebSocket pour les activités récentes:', error);
        };
        
        return ws;
      } catch (error) {
        console.error("Erreur lors de la connexion WebSocket:", error);
        return null;
      }
    };
    
    const wsPromise = connectWebSocket();
    
    return () => {
      // Nettoyer la connexion WebSocket lors du démontage
      wsPromise.then(ws => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });
    };
  }, []);

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