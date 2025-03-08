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
  
  // // Ajouter des console.log pour déboguer
  // console.log("GeneralMetricsCards - metrics:", metrics);
  // console.log("GeneralMetricsCards - timeseriesData:", timeseriesData);
  // console.log("GeneralMetricsCards - aggregatedData:", aggregatedData);
  
  // // Vérifier les valeurs spécifiques pour le taux d'évaluation
  // console.log("Taux d'évaluation - données:", {
  //   total_evaluations: aggregatedData?.total_evaluations,
  //   total_count: aggregatedData?.total_count,
  //   calculated: aggregatedData?.total_evaluations > 0 
  //     ? (aggregatedData.total_evaluations / aggregatedData.total_count * 100) 
  //     : "Utilisant metrics.evaluation_rate",
  //   metrics_rate: metrics?.evaluation_rate
  // });
  
  // Vérifier les valeurs pour le taux de satisfaction
  console.log("Taux de satisfaction - données:", {
    avg_satisfaction_rate: aggregatedData?.avg_satisfaction_rate,
    metrics_positive_rate: metrics?.positive_rate
  });
  
  // Déterminer si nous avons des évaluations dans la période sélectionnée
  const hasEvaluationsInPeriod = aggregatedData?.total_evaluations > 0;
  
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
        value={aggregatedData?.total_count > 0 
          ? (aggregatedData.total_evaluations / aggregatedData.total_count * 100 || 0)
          : metrics?.evaluation_rate} 
        unit="%"
      />
      <MetricCard 
        title="Taux de satisfaction" 
        value={hasEvaluationsInPeriod 
          ? aggregatedData.avg_satisfaction_rate 
          : (aggregatedData?.total_count > 0 ? "N/A" : metrics?.positive_rate)} 
        unit={hasEvaluationsInPeriod || (aggregatedData?.total_count === 0 && metrics?.positive_rate) ? "%" : ""}
      />
    </div>
  );
};

export default GeneralMetricsCards; 