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

// Fonction pour récupérer les métriques depuis Prometheus
async function fetchPrometheusMetrics() {
  try {
    // Récupération des métriques pertinentes
    const totalRequests = await fetch('http://localhost:9091/api/v1/query?query=osi_total_requests_total').then(res => res.json());
    const ragItemsCount = await fetch('http://localhost:9091/api/v1/query?query=osi_rag_items_count').then(res => res.json());
    
    // Calcul du temps de réponse moyen
    const responseTimeSum = await fetch('http://localhost:9091/api/v1/query?query=osi_response_time_seconds_sum').then(res => res.json());
    const responseTimeCount = await fetch('http://localhost:9091/api/v1/query?query=osi_response_time_seconds_count').then(res => res.json());
    
    // Extraction des valeurs
    const requestsValue = totalRequests.data.result[0]?.value[1] || '0';
    const ragItemsValue = ragItemsCount.data.result[0]?.value[1] || '0';
    
    const sumValue = parseFloat(responseTimeSum.data.result[0]?.value[1] || '0');
    const countValue = parseFloat(responseTimeCount.data.result[0]?.value[1] || '1');
    const avgResponseTime = (sumValue / countValue).toFixed(2);
    
    // Le taux de satisfaction est une donnée fictive pour l'instant
    // Dans un cas réel, vous pourriez avoir une métrique spécifique pour cela
    const satisfactionRate = "95%";
    
    return {
      totalMessages: parseInt(requestsValue).toLocaleString(),
      responseTime: avgResponseTime + 's',
      satisfactionRate: satisfactionRate,
      ragItems: parseInt(ragItemsValue).toLocaleString()
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    return null;
  }
}

export default function DashboardPage() {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      const data = await fetchPrometheusMetrics();
      setMetricsData(data);
      setLoading(false);
    }
    
    loadMetrics();
    
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Stats par défaut (affichées pendant le chargement)
  const defaultStats = [
    { name: "Total des messages", value: "...", icon: ChatBubbleIcon },
    { name: "Délai moyen de réponse", value: "...", icon: TimerIcon },
    { name: "Taux de satisfaction", value: "...", icon: BarChartIcon },
    { name: "Entrées RAG", value: "...", icon: FileTextIcon },
  ];

  // Stats avec les données de Prometheus
  const stats = loading || !metricsData ? defaultStats : [
    { name: "Total des messages", value: metricsData.totalMessages, icon: ChatBubbleIcon },
    { name: "Délai moyen de réponse", value: metricsData.responseTime, icon: TimerIcon },
    { name: "Taux de satisfaction", value: metricsData.satisfactionRate, icon: BarChartIcon },
    { name: "Entrées RAG", value: metricsData.ragItems, icon: FileTextIcon },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader />

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