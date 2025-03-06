"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMetrics, getTimeseriesMetrics } from "@/app/api/metrics/route";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { addDays, format, subDays } from "date-fns";
import ConversationsChart from "@/components/statistics/ConversationsChart";
import SatisfactionChart from "@/components/statistics/SatisfactionChart";
import GeneralMetricsCards from "@/components/statistics/GeneralMetricsCards";
import RAGMetricsCards from "@/components/statistics/RAGMetricsCards";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import TopChunksChart from "@/components/statistics/TopChunksChart";

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState("daily");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState(null);
  const [timeseriesData, setTimeseriesData] = useState(null);
  const [error, setError] = useState(null);
  
  // Initialiser avec les 30 derniers jours par défaut
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  // Charger les données des métriques
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Réinitialiser l'erreur à chaque nouvelle requête
      
      try {
        // Formater les dates pour l'API
        const startDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
        const endDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;
        
        // Utiliser try/catch individuel pour chaque appel API
        let metrics = null;
        let timeseries = null;
        
        try {
          metrics = await getMetrics(startDate, endDate);
        } catch (metricsError) {
          console.error("Erreur lors du chargement des métriques générales:", metricsError);
          // Continuer avec les autres appels même si celui-ci échoue
        }
        
        try {
          timeseries = await getTimeseriesMetrics(timeRange, startDate, endDate);
          
          // Formater les données de timeseries seulement si elles existent
          if (timeseries && timeseries.data) {
            timeseries = {
              ...timeseries,
              data: timeseries.data.map(item => ({
                ...item,
                satisfaction_rate: item.satisfaction_rate !== null ? parseFloat(item.satisfaction_rate.toFixed(2)) : null,
                avg_response_time: item.avg_response_time !== null ? parseFloat(item.avg_response_time.toFixed(2)) : null
              }))
            };
          }
        } catch (timeseriesError) {
          console.error("Erreur lors du chargement des métriques temporelles:", timeseriesError);
          // Continuer même si cet appel échoue
        }
        
        // Mettre à jour l'état avec les données disponibles
        if (metrics) setMetricsData(metrics);
        if (timeseries) setTimeseriesData(timeseries);
        
        // Afficher une erreur seulement si les deux appels ont échoué
        if (!metrics && !timeseries) {
          setError("Impossible de charger les données statistiques. Veuillez vérifier votre connexion ou réessayer plus tard.");
        }
      } catch (error) {
        console.error("Erreur globale lors du chargement des métriques:", error);
        setError("Impossible de charger les données statistiques. Veuillez vérifier votre connexion ou réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, dateRange]);

  // Gérer le changement de plage de dates
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <DatePickerWithRange 
            dateRange={dateRange} 
            onDateRangeChange={handleDateRangeChange} 
            className="w-full md:w-auto"
          />
          {activeTab !== "rag" && (
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
            >
              <option value="hourly">Par heure</option>
              <option value="daily">Par jour</option>
              <option value="weekly">Par semaine</option>
              <option value="monthly">Par mois</option>
              <option value="yearly">Par année</option>
              <option value="all_time">Tout le temps</option>
            </select>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="rag">Base RAG</TabsTrigger>
        </TabsList>
        
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <TabsContent value="overview">
              <div className="space-y-6">
                <GeneralMetricsCards 
                  metrics={metricsData?.general} 
                  timeseriesData={timeseriesData}
                  dateRange={dateRange}
                  timeRange={timeRange}
                />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <ConversationsChart data={timeseriesData?.data} period={timeRange} />
                  <SatisfactionChart data={timeseriesData?.data} period={timeRange} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rag">
              <div className="space-y-6">
                <RAGMetricsCards 
                  metrics={metricsData?.rag} 
                  itemsCount={metricsData?.rag_items_count}
                  timeseriesData={timeseriesData}
                />
                
                <TopChunksChart data={timeseriesData?.top_chunks} />
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
} 