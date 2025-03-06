import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MetricCard = ({ title, value, description, unit = "" }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {typeof value === 'number' ? value.toFixed(2) : value}{unit}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

const RAGMetricsCards = ({ metrics, itemsCount }) => {
  if (!metrics) return null;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard 
        title="Documents RAG" 
        value={itemsCount} 
        description="Nombre total de documents dans la base RAG"
      />
      <MetricCard 
        title="Temps de requête" 
        value={metrics.avg_query_time} 
        unit="s"
        description="Temps moyen de recherche vectorielle"
      />
      <MetricCard 
        title="Temps LLM" 
        value={metrics.avg_llm_time} 
        unit="s"
        description="Temps moyen de génération LLM"
      />
      <MetricCard 
        title="Taux chunk défaut" 
        value={metrics.default_chunk_rate * 100} 
        unit="%"
        description="Pourcentage d'utilisation du chunk par défaut"
      />
    </div>
  );
};

export default RAGMetricsCards; 