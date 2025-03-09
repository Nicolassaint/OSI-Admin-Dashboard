import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MetricCard = ({ title, value, description, unit = "" }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {typeof value === 'number' 
          ? Number.isInteger(value) ? value : value.toFixed(2) 
          : value}{unit}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

const RAGMetricsCards = ({ itemsCount, timeseriesData }) => {
  // Récupérer les données agrégées de timeseriesData
  const aggregatedData = timeseriesData?.aggregated?.rag_metrics || {};
  const totalConversations = timeseriesData?.aggregated?.total_count || 0;
  
  // Déterminer si nous avons des données dans la période sélectionnée
  const hasDataInPeriod = totalConversations > 0;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard 
        title="Conversations" 
        value={hasDataInPeriod ? totalConversations : "0"} 
        description="Nombre total de conversations"
      />
      <MetricCard 
        title="Temps de requête" 
        value={hasDataInPeriod && aggregatedData?.avg_query_time !== null ? aggregatedData.avg_query_time : "N/A"} 
        unit={hasDataInPeriod && aggregatedData?.avg_query_time !== null ? "s" : ""}
        description="Temps moyen de recherche vectorielle"
      />
      <MetricCard 
        title="Temps LLM" 
        value={hasDataInPeriod && aggregatedData?.avg_llm_time !== null ? aggregatedData.avg_llm_time : "N/A"} 
        unit={hasDataInPeriod && aggregatedData?.avg_llm_time !== null ? "s" : ""}
        description="Temps moyen de génération LLM"
      />
      <MetricCard 
        title="Taux message par défaut" 
        value={hasDataInPeriod && aggregatedData?.default_chunk_rate !== null ? aggregatedData.default_chunk_rate : "N/A"} 
        unit={hasDataInPeriod && aggregatedData?.default_chunk_rate !== null ? "%" : ""}
        description="Pourcentage d'utilisation du chunk par défaut"
      />
    </div>
  );
};

export default RAGMetricsCards; 