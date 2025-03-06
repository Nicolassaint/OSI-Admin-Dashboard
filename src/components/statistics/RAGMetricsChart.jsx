import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const RAGMetricsChart = ({ data, period = "daily" }) => {
  // Formater les données pour le graphique
  const chartData = data?.filter(item => item.rag_metrics && Object.keys(item.rag_metrics).length > 0)
    .map(item => ({
      date: item.date,
      avgQueryTime: item.rag_metrics.avg_query_time || 0,
      avgLlmTime: item.rag_metrics.avg_llm_time || 0,
      avgTotalTime: item.rag_metrics.avg_total_time || 0,
      defaultChunkRate: item.rag_metrics.default_chunk_rate || 0
    })) || [];

  // Si aucune donnée, afficher un message
  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getChartTitle()}</CardTitle>
          <CardDescription>Temps de traitement et taux d'utilisation du chunk par défaut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Aucune donnée RAG disponible pour cette période</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formater la date pour l'affichage en fonction de la période
  const formatDate = (dateStr) => {
    try {
      if (period === "hourly") {
        return format(parseISO(dateStr), 'HH:00', { locale: fr });
      } else if (period === "daily") {
        return format(parseISO(dateStr), 'dd MMM', { locale: fr });
      } else if (period === "weekly") {
        return format(parseISO(dateStr), 'dd MMM', { locale: fr });
      } else if (period === "monthly") {
        return format(parseISO(dateStr), 'MMM yyyy', { locale: fr });
      } else if (period === "yearly" || period === "all_time") {
        return dateStr; // Année au format YYYY
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  // Déterminer le titre en fonction de la période
  const getChartTitle = () => {
    switch(period) {
      case "hourly": return "Performances RAG par heure";
      case "daily": return "Performances RAG quotidiennes";
      case "weekly": return "Performances RAG hebdomadaires";
      case "monthly": return "Performances RAG mensuelles";
      case "yearly": return "Performances RAG annuelles";
      case "all_time": return "Performances RAG (toutes périodes)";
      default: return "Performances RAG";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getChartTitle()}</CardTitle>
        <CardDescription>Temps de traitement et taux d'utilisation du chunk par défaut</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip 
                labelFormatter={value => formatDate(value)}
                formatter={(value, name) => {
                  if (name === 'avgQueryTime') return [value.toFixed(2) + 's', 'Temps de requête'];
                  if (name === 'avgLlmTime') return [value.toFixed(2) + 's', 'Temps LLM'];
                  if (name === 'avgTotalTime') return [value.toFixed(2) + 's', 'Temps total'];
                  if (name === 'defaultChunkRate') return [value.toFixed(1) + '%', 'Taux chunk défaut'];
                  return [value, name];
                }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="avgTotalTime" 
                stroke="#8884d8" 
                name="Temps total"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="defaultChunkRate" 
                stroke="#82ca9d" 
                name="Taux chunk défaut"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RAGMetricsChart; 