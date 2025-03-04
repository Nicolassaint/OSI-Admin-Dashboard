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

// Fonction pour récupérer les métriques depuis l'API
async function fetchDashboardMetrics() {
  try {
    // Utilisation des variables d'environnement pour l'API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
    
    const response = await fetch(`${apiUrl}/api/dashboard-metrics?token=${apiToken}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    // console.log("Données métriques reçues:", data);
    
    // Formatage des données pour l'affichage avec vérification des valeurs undefined
    return {
      totalMessages: data.total_messages ? data.total_messages.toLocaleString() : "0",
      responseTime: data.avg_response_time ? data.avg_response_time.toFixed(2) + 's' : "0s",
      satisfactionRate: data.satisfaction_rate ? data.satisfaction_rate.toFixed(0) + '%' : "Aucun avis",
      ragItems: data.rag_entries ? data.rag_entries.toLocaleString() : "0"
    };
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
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
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
    
    loadMetrics();
    
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
    
    const connectWebSocket = () => {
      // Éviter les connexions multiples
      if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
        // console.log('Connexion WebSocket déjà établie ou en cours d\'établissement');
        return;
      }
      
      // Limiter les tentatives de reconnexion
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error("Nombre maximum de tentatives de reconnexion atteint. Le backend n'est probablement pas disponible.");
        setMetricsError("Le serveur de métriques n'est pas joignable. Veuillez vérifier que le backend est en cours d'exécution.");
        setWsConnected(false);
        return;
      }
      
      // console.log('Création d\'une nouvelle connexion WebSocket pour les métriques');
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const wsUrl = apiUrl.replace('http', 'ws');
        const wsToken = process.env.NEXT_PUBLIC_WEBSOCKET_TOKEN;
        
        ws = new WebSocket(`${wsUrl}/ws?token=${wsToken}`);
        
        ws.onopen = () => {
          // console.log('WebSocket connecté pour les métriques');
          reconnectAttempts = 0; // Réinitialiser le compteur après une connexion réussie
          setWsConnected(true);
          setMetricsError(null);
        };
        
        ws.onmessage = (event) => {
          try {
            // console.log("Message WebSocket brut reçu:", event.data);
            const message = JSON.parse(event.data);
            // console.log("Message WebSocket parsé:", message);
            
            // Vérifier si c'est un message de type 'metrics_update'
            if (message.type === 'metrics_update' && message.data) {
              // console.log("Mise à jour des métriques reçue:", message.data);
              
              const data = message.data;
              
              // Mettre à jour les métriques avec les nouvelles données et vérification des undefined
              setMetricsData({
                totalMessages: data.total_messages ? data.total_messages.toLocaleString() : "0",
                responseTime: data.avg_response_time ? data.avg_response_time.toFixed(2) + 's' : "0s",
                satisfactionRate: data.satisfaction_rate ? data.satisfaction_rate.toFixed(0) + '%' : "Aucun avis",
                ragItems: data.rag_entries ? data.rag_entries.toLocaleString() : "0"
              });
            }
          } catch (err) {
            console.error("Erreur lors du traitement du message WebSocket:", err, "Données brutes:", event.data);
          }
        };
        
        ws.onerror = (error) => {
          console.error('Erreur WebSocket pour les métriques:', error);
          setWsConnected(false);
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
    { name: "Entrées RAG", value: "...", icon: FileTextIcon },
  ];

  // Stats avec les données de l'API
  const stats = loading || !metricsData ? defaultStats : [
    { name: "Total des messages", value: metricsData.totalMessages, icon: ChatBubbleIcon },
    { name: "Délai moyen de réponse", value: metricsData.responseTime, icon: TimerIcon },
    { name: "Taux de satisfaction", value: metricsData.satisfactionRate, icon: BarChartIcon },
    { name: "Entrées RAG", value: metricsData.ragItems, icon: FileTextIcon },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader />

      {metricsError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{metricsError}</p>
            </div>
          </div>
        </div>
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