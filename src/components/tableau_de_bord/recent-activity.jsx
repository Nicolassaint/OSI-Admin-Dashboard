import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function RecentActivity() {
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
        
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
        
        // Trier par date et prendre les 3 plus récents
        const sortedMessages = data
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 3);
        
        setRecentMessages(sortedMessages);
      } catch (err) {
        console.error("Erreur lors de la récupération des messages récents:", err);
        // Vérifier si l'erreur est liée à un problème de connexion
        if (err.name === 'AbortError' || err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
          setError("Le backend n'est pas joignable. Veuillez vérifier votre connexion.");
        } else {
          setError("Impossible de charger les messages récents.");
        }
      } finally {
        setLoading(false);
      }
    };

    // Connexion WebSocket pour les mises à jour en temps réel
    let ws = null;
    
    const connectWebSocket = () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const wsUrl = apiUrl.replace('http', 'ws');
        const wsToken = process.env.NEXT_PUBLIC_WEBSOCKET_TOKEN;
        
        ws = new WebSocket(`${wsUrl}/ws?token=${wsToken}`);
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'new_conversation' && message.data) {
              setRecentMessages(prevMessages => {
                // Vérifier si le message existe déjà
                const messageId = message.data.id || message.data._id;
                const messageExists = prevMessages.some(
                  msg => (msg.id || msg._id) === messageId
                );
                
                // Si le message existe déjà, ne pas le rajouter
                if (messageExists) {
                  return prevMessages;
                }
                
                // Sinon, ajouter le nouveau message
                const newMessages = [message.data, ...prevMessages].slice(0, 3);
                return newMessages;
              });
            }
          } catch (err) {
            console.error("Erreur lors du traitement du message WebSocket:", err);
          }
        };
        
        ws.onerror = (error) => {
          console.error('Erreur WebSocket pour les conversations:', error);
        };
      } catch (error) {
        console.error("Erreur lors de la création du WebSocket pour les conversations:", error);
      }
    };

    fetchRecentMessages();
    connectWebSocket();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const formatTimeAgo = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: fr });
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
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
          ) : recentMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune interaction récente</p>
          ) : (
            recentMessages.map((message) => (
              <div key={message.id || message._id} className="flex items-start gap-4 rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate max-w-[300px]">{message.user_message}</p>
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