"use client";

import { DashboardHeader } from "@/components/tableau_de_bord/dashboard-header";
import { StatCard } from "@/components/tableau_de_bord/stats-card";
import { RecentActivity } from "@/components/tableau_de_bord/recent-activity";
import { QuickAccess } from "@/components/tableau_de_bord/quick-access";
import {
  BarChartIcon,
  ChatBubbleIcon,
  FileTextIcon,
  TimerIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getCachedData, setCachedData } from "@/lib/cache";

// Fonction pour récupérer les métriques depuis l'API
async function fetchDashboardMetrics() {
  try {
    // Vérifier le cache d'abord
    const cachedMetrics = getCachedData('metrics');
    if (cachedMetrics) {
      return cachedMetrics;
    }

    const response = await fetch(`/api/proxy/dashboard-metrics`, {
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Formatage des données pour l'affichage avec vérification des valeurs undefined
    const formattedData = {
      totalMessages: data.total_messages ? data.total_messages.toLocaleString() : "0",
      responseTime: data.avg_response_time ? data.avg_response_time.toFixed(2) + 's' : "0s",
      satisfactionRate: data.satisfaction_rate ? data.satisfaction_rate.toFixed(0) + '%' : "Aucun avis",
      ragItems: data.rag_entries ? data.rag_entries.toLocaleString() : "0"
    };

    // Mettre en cache les données formatées
    setCachedData('metrics', formattedData);
    
    return formattedData;
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      totalMessages: "...",
      responseTime: "...",
      satisfactionRate: "...",
      ragItems: "..."
    };
  }
}

export default function DashboardPage() {
  // Initialiser avec le cache si disponible
  const cachedMetrics = getCachedData('metrics');
  const [metricsData, setMetricsData] = useState(cachedMetrics);
  const [loading, setLoading] = useState(!cachedMetrics);
  const [metricsError, setMetricsError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Récupérer les métriques initiales depuis l'API
  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await fetchDashboardMetrics();
        setMetricsData(data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement initial des métriques:', error);
        setMetricsError("Impossible de charger les métriques. Veuillez vérifier que le backend est en cours d'exécution.");
        setLoading(false);
      }
    }

    // Si pas de cache, charger immédiatement
    if (!cachedMetrics) {
      loadMetrics();
    }

    // Rafraîchir les données toutes les 60 secondes (fallback si WebSocket échoue)
    const interval = setInterval(loadMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  // Configurer la connexion WebSocket pour les mises à jour en temps réel
  useEffect(() => {
    // Vérifier si nous sommes côté client
    if (typeof window === 'undefined') return;
    
    let ws = null;
    let reconnectTimeout = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    
    const connectWebSocket = async () => {
      // Éviter les connexions multiples
      if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
        return;
      }
      
      // Limiter les tentatives de reconnexion
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error("Nombre maximum de tentatives de reconnexion atteint. Le backend n'est probablement pas disponible.");
        setMetricsError("Le serveur de métriques n'est pas joignable. Veuillez vérifier que le backend est en cours d'exécution.");
        setWsConnected(false);
        return;
      }
      
      try {
        // Récupérer l'URL WebSocket depuis notre proxy
        const wsResponse = await fetch('/api/proxy/ws');
        if (!wsResponse.ok) {
          throw new Error('Impossible de récupérer l\'URL WebSocket');
        }
        
        const { wsUrl } = await wsResponse.json();
        
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          reconnectAttempts = 0; // Réinitialiser le compteur après une connexion réussie
          setWsConnected(true);
          setMetricsError(null);
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'metrics_update' && message.data) {
              const data = message.data;
              
              const formattedData = {
                totalMessages: data.total_messages ? data.total_messages.toLocaleString() : "0",
                responseTime: data.avg_response_time ? data.avg_response_time.toFixed(2) + 's' : "0s",
                satisfactionRate: data.satisfaction_rate ? data.satisfaction_rate.toFixed(0) + '%' : "Aucun avis",
                ragItems: data.rag_entries ? data.rag_entries.toLocaleString() : "0"
              };

              setMetricsData(formattedData);
              setCachedData('metrics', formattedData);
            } else if (message.type === 'new_conversation') {
              const currentMetrics = getCachedData('metrics') || metricsData;
              if (currentMetrics) {
                const updatedMetrics = {
                  ...currentMetrics,
                  totalMessages: (parseInt(currentMetrics.totalMessages.replace(/,/g, '')) + 1).toLocaleString()
                };
                setMetricsData(updatedMetrics);
                setCachedData('metrics', updatedMetrics);
              }
            } else if (message.type === 'delete_conversation') {
              const currentMetrics = getCachedData('metrics') || metricsData;
              if (currentMetrics) {
                const updatedMetrics = {
                  ...currentMetrics,
                  totalMessages: Math.max(0, parseInt(currentMetrics.totalMessages.replace(/,/g, '')) - 1).toLocaleString()
                };
                setMetricsData(updatedMetrics);
                setCachedData('metrics', updatedMetrics);
              }
            }
          } catch (err) {
            console.error("Erreur lors du traitement du message WebSocket:", err, "Données brutes:", event.data);
          }
        };
        
        ws.onerror = (error) => {
          // Extraire plus d'informations de l'erreur
          const errorDetails = error.message || "Erreur de connexion";
          console.error('Erreur WebSocket pour les métriques:', errorDetails);
          setWsConnected(false);
          setMetricsError(`Erreur de connexion au serveur de métriques: ${errorDetails}`);
        };
        
        ws.onclose = () => {
          // console.log('WebSocket déconnecté pour les métriques');
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
            setMetricsError("Le serveur de métriques n'est pas joignable. Veuillez vérifier que le backend est en cours d'exécution.");
          }
        };
      } catch (error) {
        console.error("Erreur lors de la création du WebSocket pour les métriques:", error);
        setMetricsError("Impossible de se connecter au serveur de métriques");
        setWsConnected(false);
      }
    };
    
    connectWebSocket();
    
    return () => {
      // Nettoyage lors du démontage du composant
      if (ws && ws.readyState === WebSocket.OPEN) {
        // console.log('Fermeture de la connexion WebSocket pour les métriques');
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // Stats par défaut (affichées pendant le chargement)
  const defaultStats = [
    { name: "Total des messages", value: "...", icon: ChatBubbleIcon },
    { name: "Délai moyen de réponse", value: "...", icon: TimerIcon },
    { name: "Taux de satisfaction", value: "...", icon: BarChartIcon },
    { name: "Nombre d'entrées", value: "...", icon: FileTextIcon },
  ];

  // Stats avec les données de l'API
  const stats = loading || !metricsData ? defaultStats : [
    { name: "Total des messages", value: metricsData.totalMessages, icon: ChatBubbleIcon },
    { name: "Délai moyen de réponse", value: metricsData.responseTime, icon: TimerIcon },
    { name: "Taux de satisfaction", value: metricsData.satisfactionRate, icon: BarChartIcon },
    { name: "Nombre d'entrées", value: metricsData.ragItems, icon: FileTextIcon },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader />

      {metricsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Erreur de connexion à l'API</AlertTitle>
          <AlertDescription>
            <p>{metricsError}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard 
            key={stat.name} 
            name={stat.name} 
            value={stat.value} 
            icon={stat.icon} 
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity />
        <QuickAccess />
      </div>
    </div>
  );
} 