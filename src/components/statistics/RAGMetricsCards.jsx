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

const RAGMetricsCards = ({ metrics, itemsCount, timeseriesData }) => {
  if (!metrics && !timeseriesData?.aggregated?.rag_metrics) return null;
  
  const aggregatedData = timeseriesData?.aggregated?.rag_metrics;
  const totalConversations = timeseriesData?.aggregated?.total_count || metrics?.total_conversations;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard 
        title="Conversations" 
        value={totalConversations} 
        description="Nombre total de conversations"
      />
      <MetricCard 
        title="Temps de requête" 
        value={aggregatedData?.avg_query_time || metrics?.avg_query_time} 
        unit="s"
        description="Temps moyen de recherche vectorielle"
      />
      <MetricCard 
        title="Temps LLM" 
        value={aggregatedData?.avg_llm_time || metrics?.avg_llm_time} 
        unit="s"
        description="Temps moyen de génération LLM"
      />
      <MetricCard 
        title="Taux message par défaut" 
        value={aggregatedData?.default_chunk_rate || metrics?.default_chunk_rate} 
        unit="%"
        description="Pourcentage d'utilisation du chunk par défaut"
      />
    </div>
  );
};

export default RAGMetricsCards; 