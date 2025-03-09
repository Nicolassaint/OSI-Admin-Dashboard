import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useTheme } from "next-themes";
import { useRef, useState, useEffect } from "react";

const SatisfactionChart = ({ data, period = "daily" }) => {
  // Utiliser le hook useTheme pour obtenir le thème actuel
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  
  // Ajouter un effet pour forcer le rafraîchissement quand les données ou la période changent
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  
  useEffect(() => {
    if (chartRef.current && chartInstance) {
      chartInstance.update();
    }
  }, [data, period, chartInstance]);

  // Déterminer le titre en fonction de la période
  const getChartTitle = () => {
    switch(period) {
      case "hourly": return "Satisfaction par heure";
      case "daily": return "Satisfaction quotidienne";
      case "weekly": return "Satisfaction hebdomadaire";
      case "monthly": return "Satisfaction mensuelle";
      case "yearly": return "Satisfaction annuelle";
      case "all_time": return "Satisfaction (toutes périodes)";
      default: return "Satisfaction utilisateur";
    }
  };

  // Filtrer les données pour n'inclure que celles avec un taux de satisfaction
  const chartData = data?.filter(item => item.satisfaction_rate !== null && item.satisfaction_rate !== undefined)
    .map(item => ({
      date: item.date,
      satisfactionRate: item.satisfaction_rate || 0,
      evaluations: item.evaluations || 0
    })) || [];

  // Si aucune donnée, afficher un message
  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getChartTitle()}</CardTitle>
          <CardDescription>Taux de satisfaction et nombre d'évaluations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Aucune donnée de satisfaction disponible pour cette période</p>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getChartTitle()}</CardTitle>
        <CardDescription>Taux de satisfaction et nombre d'évaluations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              ref={chartRef}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis yAxisId="left" domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={value => formatDate(value)}
                formatter={(value, name) => {
                  if (name === 'satisfactionRate') {
                    return [`${value}%`, 'Satisfaction'];
                  }
                  if (name === 'evaluations') return [value, 'Évaluations'];
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#2a2a3c' : 'white',
                  color: isDarkMode ? 'white' : '#334155',
                  border: `2px solid ${isDarkMode ? '#3b82f6' : '#0070f3'}`,
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '14px',
                  boxShadow: isDarkMode 
                    ? '0 0 10px rgba(0, 0, 0, 0.7)' 
                    : '0 0 10px rgba(0, 0, 0, 0.2)',
                  minWidth: '200px'
                }}
                itemStyle={{
                  color: isDarkMode ? 'white' : '#334155',
                  padding: '3px 0'
                }}
                labelStyle={{
                  color: isDarkMode ? '#3b82f6' : '#0070f3',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  fontSize: '15px'
                }}
                cursor={{ stroke: isDarkMode ? '#666' : '#ccc', strokeWidth: 1 }}
                isAnimationActive={false}
              />
              <Line 
                yAxisId="left"
                type="monotone"
                dataKey="satisfactionRate" 
                stroke="#8884d8" 
                name="Satisfaction"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
              />
              <Line 
                yAxisId="right"
                type="monotone"
                dataKey="evaluations" 
                stroke="#82ca9d" 
                name="Évaluations"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#82ca9d', strokeWidth: 2 }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{
                  paddingTop: '10px',
                  fontSize: '14px',
                  color: isDarkMode ? 'white' : '#334155'
                }}
                formatter={(value) => {
                  return <span style={{ color: isDarkMode ? 'white' : '#334155' }}>{value}</span>;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SatisfactionChart; 