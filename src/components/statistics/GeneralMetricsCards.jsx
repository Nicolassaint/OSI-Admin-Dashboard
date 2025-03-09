import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const GeneralMetricsCards = ({ timeseriesData, dateRange, timeRange }) => {
  // Gérer le cas où timeseriesData ou aggregated n'existe pas
  const aggregatedData = timeseriesData?.aggregated || {};
  
  // Déterminer si nous avons des données dans la période sélectionnée
  const hasDataInPeriod = aggregatedData?.total_count > 0;
  const hasEvaluationsInPeriod = aggregatedData?.total_evaluations > 0;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard 
        title="Conversations totales" 
        value={hasDataInPeriod ? aggregatedData.total_count : "0"} 
      />
      <MetricCard 
        title="Temps de réponse moyen" 
        value={hasDataInPeriod && aggregatedData.avg_response_time !== null ? aggregatedData.avg_response_time : "N/A"} 
        unit={hasDataInPeriod && aggregatedData.avg_response_time !== null ? "s" : ""}
      />
      <MetricCard 
        title="Taux d'évaluation" 
        value={hasDataInPeriod 
          ? (aggregatedData.total_evaluations / aggregatedData.total_count * 100 || 0)
          : "0"} 
        unit="%"
      />
      <MetricCard 
        title="Taux de satisfaction" 
        value={hasEvaluationsInPeriod 
          ? aggregatedData.avg_satisfaction_rate 
          : "N/A"} 
        unit={hasEvaluationsInPeriod ? "%" : ""}
      />
    </div>
  );
};

export default GeneralMetricsCards; 