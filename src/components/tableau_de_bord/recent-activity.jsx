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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
        setError("Impossible de charger les messages récents.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMessages();
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