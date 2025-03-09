"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTimeseriesMetrics } from "@/app/api/metrics/route";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { format, subDays } from "date-fns";
import ConversationsChart from "@/components/statistics/ConversationsChart";
import SatisfactionChart from "@/components/statistics/SatisfactionChart";
import GeneralMetricsCards from "@/components/statistics/GeneralMetricsCards";
import RAGMetricsCards from "@/components/statistics/RAGMetricsCards";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import TopChunksChart from "@/components/statistics/TopChunksChart";
import { Button } from "@/components/ui/button";

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState("daily");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [timeseriesData, setTimeseriesData] = useState(null);
  const [error, setError] = useState(null);
  
  // Initialiser avec une plage de dates par défaut selon la période
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), timeRange === "hourly" ? 0 : 30),
    to: new Date()
  });

  // Extraire la fonction fetchData pour pouvoir l'appeler depuis plusieurs endroits
  const fetchData = async (dates, currentTimeRange) => {
    setLoading(true);
    setError(null); // Réinitialiser l'erreur à chaque nouvelle requête
    
    try {
      // Vérifier que les dates sont valides
      if (!dates.from || !dates.to) {
        throw new Error("Plage de dates invalide");
      }
      
      // S'assurer que la date de début est antérieure à la date de fin
      if (dates.from > dates.to) {
        throw new Error("La date de début doit être antérieure à la date de fin");
      }
      
      // Formater les dates pour l'API
      const startDate = format(dates.from, 'yyyy-MM-dd');
      const endDate = format(dates.to, 'yyyy-MM-dd');
      
      const timeseries = await getTimeseriesMetrics(currentTimeRange, startDate, endDate);
      
      // Formater les données de timeseries seulement si elles existent
      if (timeseries && timeseries.data) {
        const formattedData = {
          ...timeseries,
          data: timeseries.data.map(item => ({
            ...item,
            satisfaction_rate: item.satisfaction_rate !== null ? parseFloat(item.satisfaction_rate.toFixed(2)) : null,
            avg_response_time: item.avg_response_time !== null ? parseFloat(item.avg_response_time.toFixed(2)) : null
          }))
        };
        setTimeseriesData(formattedData);
      } else {
        // Si les données sont vides mais la requête a réussi
        setTimeseriesData(timeseries || { data: [] });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des métriques:", error);
      const errorMessage = error.message || "Erreur inconnue";
      setError(`Impossible de charger les données statistiques: ${errorMessage}`);
      setTimeseriesData(null);
    } finally {
      setLoading(false);
    }
  };

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
    // Ne pas appeler fetchData ici, il sera appelé par l'effet qui surveille dateRange
  }, [timeRange]);

  // Charger les données des métriques quand dateRange change
  useEffect(() => {
    // Vérifier que dateRange contient des valeurs valides avant d'appeler fetchData
    if (dateRange.from && dateRange.to) {
      fetchData(dateRange, timeRange);
    }
  }, [dateRange, timeRange]);

  // Gérer le changement de plage de dates
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Gérer le changement de période
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
    
    // Mettre à jour immédiatement la plage de dates en fonction de la nouvelle période
    let newFrom;
    const today = new Date();
    
    switch(newTimeRange) {
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
    // Pas besoin d'appeler fetchData ici car l'effet qui surveille dateRange le fera
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
                {error && !timeseriesData && (
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
                      timeseriesData={timeseriesData}
                    />
                    
                    <TopChunksChart data={timeseriesData?.top_chunks} />
                  </>
                )}
                {error && !timeseriesData && (
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