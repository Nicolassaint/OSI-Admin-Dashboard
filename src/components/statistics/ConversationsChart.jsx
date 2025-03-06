import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useTheme } from "next-themes";

const ConversationsChart = ({ data, period = "daily" }) => {
  // Utiliser le hook useTheme pour obtenir le thème actuel
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Formater les données pour le graphique en gérant les valeurs nulles
  const chartData = data?.map(item => ({
    date: item.date,
    count: item.count || 0
  })) || [];

  // Si aucune donnée, afficher un message
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getChartTitle()}</CardTitle>
          <CardDescription>Nombre de conversations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Aucune donnée disponible pour cette période</p>
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
        // Amélioration du format pour les semaines
        if (dateStr.includes('W')) {
          const [year, week] = dateStr.split('-W');
          return `S${week} ${year}`;
        }
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
      case "hourly": return "Conversations par heure";
      case "daily": return "Conversations quotidiennes";
      case "weekly": return "Conversations hebdomadaires";
      case "monthly": return "Conversations mensuelles";
      case "yearly": return "Conversations annuelles";
      case "all_time": return "Conversations (toutes périodes)";
      default: return "Conversations";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getChartTitle()}</CardTitle>
        <CardDescription>Nombre de conversations</CardDescription>
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
              <YAxis />
              <Tooltip 
                labelFormatter={value => formatDate(value)}
                formatter={(value, name) => {
                  if (name === 'count') return [value, 'Conversations'];
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
                cursor={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Conversations"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationsChart; 