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
        setError(null);
        
        // Toujours vérifier le cache d'abord
        const cachedMessages = getCachedData('recentActivity');
        
        // Faire l'appel API en parallèle
        const fetchPromise = fetch(`/api/proxy/conversations?limit=3`, {
          headers: {
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000),
          cache: 'no-store'
        });

        // Si on a des données en cache valides, les afficher immédiatement
        if (cachedMessages && cachedMessages.length > 0) {
          setMessages(cachedMessages);
          setLoading(false);
        }

        // Attendre la réponse de l'API
        const response = await fetchPromise;
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Vérifier la structure des données
        if (!data || (Array.isArray(data) && data.length === 0) || 
            (data.conversations && Array.isArray(data.conversations) && data.conversations.length === 0)) {
          setMessages([]);
          setError("Aucune conversation récente disponible");
          setLoading(false);
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
        
        // Formater les données pour l'affichage
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
          .filter(msg => msg.message) // Filtrer les messages null ou undefined
          .sort((a, b) => {
            const dateA = normalizeTimestamp(a.timestamp);
            const dateB = normalizeTimestamp(b.timestamp);
            return dateB - dateA;
          })
          .slice(0, 3);
        
        if (formattedMessages.length === 0) {
          setError("Aucune conversation récente disponible");
          setMessages([]);
        } else {
          setMessages(formattedMessages);
          setCachedData('recentActivity', formattedMessages);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des messages récents:', error);
        // Si on a des données en cache, les garder en cas d'erreur
        if (messages.length === 0) {
          setError("Impossible de charger les messages récents");
        }
        setLoading(false);
      }
    };

    fetchRecentMessages();
    
    // Rafraîchir les données toutes les 30 secondes
    const refreshInterval = setInterval(fetchRecentMessages, 30000);
    
    return () => {
      clearInterval(refreshInterval);
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