import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import { HelpCircle } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TopChunksChart = ({ data }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Vérifier si nous avons des données
  const hasData = data && data.length > 0;

  // Préparer les données si elles existent
  const sortedData = hasData 
    ? [...data]
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)
        .map(item => ({
          ...item,
          // Tronquer le texte du chunk s'il est trop long
          _id: item._id.length > 50 ? item._id.substring(0, 47) + '...' : item._id
        }))
    : [];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Top 15 messages les plus utilisés</CardTitle>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Représente les premiers morceaux de texte fournis au LLM parmi un top 3 de résultats pour chaque requête
                </p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={sortedData}
                margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="_id" 
                  width={190}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Utilisations']}
                  labelFormatter={(label) => `${label}`}
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
                  cursor={{ fill: isDarkMode ? 'rgba(136, 132, 216, 0.1)' : 'rgba(136, 132, 216, 0.1)' }}
                  isAnimationActive={false}
                />
                <Bar 
                  dataKey="count" 
                  fill="#8884d8" 
                  name="Utilisations"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Aucune donnée disponible pour cette période</p>
              <p className="text-sm mt-2">Essayez de sélectionner une plage de dates différente</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopChunksChart; 