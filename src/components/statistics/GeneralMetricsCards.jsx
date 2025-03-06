import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MetricCard = ({ title, value, unit = "" }) => (
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
    </CardContent>
  </Card>
);

const GeneralMetricsCards = ({ metrics, timeseriesData }) => {
  if (!metrics && !timeseriesData?.aggregated) return null;
  
  // Utiliser les données agrégées du timeseriesData si disponibles
  const aggregatedData = timeseriesData?.aggregated;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard 
        title="Conversations totales" 
        value={aggregatedData?.total_count || metrics?.total_conversations} 
      />
      <MetricCard 
        title="Temps de réponse moyen" 
        value={aggregatedData?.avg_response_time || metrics?.avg_response_time} 
        unit="s"
      />
      <MetricCard 
        title="Taux d'évaluation" 
        value={aggregatedData?.total_evaluations > 0 
          ? (aggregatedData.total_evaluations / aggregatedData.total_count * 100) 
          : metrics?.evaluation_rate} 
        unit="%"
      />
      <MetricCard 
        title="Taux de satisfaction" 
        value={aggregatedData?.avg_satisfaction_rate || metrics?.positive_rate} 
        unit="%"
      />
    </div>
  );
};

export default GeneralMetricsCards; 