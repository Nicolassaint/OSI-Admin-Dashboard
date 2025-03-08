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
import { Button } from "@/components/ui/button";

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState("daily");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState(null);
  const [timeseriesData, setTimeseriesData] = useState(null);
  const [error, setError] = useState(null);
  
  // Initialiser avec une plage de dates par défaut selon la période
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), timeRange === "hourly" ? 0 : 30),
    to: new Date()
  });

  // Mettre à jour la plage de dates lorsque la période change
  useEffect(() => {
    let newFrom;
    const today = new Date();
    
    switch(timeRange) {
      case "hourly":
        // Pour les données horaires, on se concentre sur la journée en cours
        newFrom = new Date(today);
        newFrom.setHours(0, 0, 0, 0);
        break;
      case "daily":
        newFrom = subDays(today, 30);
        break;
      case "weekly":
        newFrom = subDays(today, 90); // ~3 mois
        break;
      case "monthly":
        newFrom = subDays(today, 365); // ~1 an
        break;
      case "yearly":
      case "all_time":
        newFrom = subDays(today, 1825); // ~5 ans
        break;
      default:
        newFrom = subDays(today, 30);
    }
    
    const newDateRange = {
      from: newFrom,
      to: today
    };
    
    setDateRange(newDateRange);
    
    // Appeler directement fetchData avec les nouvelles dates
    fetchData(newDateRange, timeRange);
  }, [timeRange]);

  // Extraire la fonction fetchData pour pouvoir l'appeler depuis plusieurs endroits
  const fetchData = async (dates, currentTimeRange) => {
    setLoading(true);
    setError(null); // Réinitialiser l'erreur à chaque nouvelle requête
    
    try {
      // Formater les dates pour l'API
      const startDate = dates.from ? format(dates.from, 'yyyy-MM-dd') : null;
      const endDate = dates.to ? format(dates.to, 'yyyy-MM-dd') : null;
      
      // Utiliser try/catch individuel pour chaque appel API
      let metrics = null;
      let timeseries = null;
      
      try {
        metrics = await getMetrics(startDate, endDate);
      } catch (metricsError) {
        console.error("Erreur lors du chargement des métriques générales:", metricsError);
        // Capturer le message d'erreur spécifique
        const errorMessage = metricsError.message || "Erreur inconnue";
        setError(`Impossible de charger les métriques générales: ${errorMessage}`);
      }
      
      try {
        timeseries = await getTimeseriesMetrics(currentTimeRange, startDate, endDate);
        
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
        // Capturer le message d'erreur spécifique si pas déjà défini
        if (!error) {
          const errorMessage = timeseriesError.message || "Erreur inconnue";
          setError(`Impossible de charger les métriques temporelles: ${errorMessage}`);
        }
      }
      
      // Mettre à jour l'état avec les données disponibles
      if (metrics) setMetricsData(metrics);
      if (timeseries) setTimeseriesData(timeseries);
      
      // Afficher une erreur générale seulement si les deux appels ont échoué et qu'aucun message spécifique n'a été défini
      if (!metrics && !timeseries && !error) {
        setError("Impossible de charger les données statistiques. Le serveur API est peut-être indisponible.");
      }
    } catch (error) {
      console.error("Erreur globale lors du chargement des métriques:", error);
      const errorMessage = error.message || "Erreur inconnue";
      setError(`Impossible de charger les données statistiques: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données des métriques quand dateRange change
  useEffect(() => {
    fetchData(dateRange, timeRange);
  }, [dateRange]);

  // Gérer le changement de plage de dates
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Gérer le changement de période
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
  };

  // Déterminer si le sélecteur de date doit être en mode jour unique
  const isSingleDayPicker = timeRange === "hourly";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <DatePickerWithRange 
            dateRange={dateRange} 
            onDateRangeChange={handleDateRangeChange} 
            className="w-full md:w-auto"
            singleDay={isSingleDayPicker}
          />
          {activeTab !== "rag" && (
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
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
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Erreur de connexion à l'API</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
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
                {!error && (
                  <>
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
                  </>
                )}
                {error && !metricsData && !timeseriesData && (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>Les données ne sont pas disponibles actuellement.</p>
                    <p>Veuillez réessayer plus tard ou contacter l'administrateur.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rag">
              <div className="space-y-6">
                {!error && (
                  <>
                    <RAGMetricsCards 
                      metrics={metricsData?.rag} 
                      itemsCount={metricsData?.rag_items_count}
                      timeseriesData={timeseriesData}
                    />
                    
                    <TopChunksChart data={timeseriesData?.top_chunks} />
                  </>
                )}
                {error && !metricsData && !timeseriesData && (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>Les données RAG ne sont pas disponibles actuellement.</p>
                    <p>Veuillez réessayer plus tard ou contacter l'administrateur.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
} 