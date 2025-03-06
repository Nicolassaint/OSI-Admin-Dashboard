import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TopSearchTermsChart = ({ data }) => {
  // Formater les données pour le graphique
  const chartData = data?.map(item => ({
    term: item._id,
    count: item.count
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Termes de recherche populaires</CardTitle>
        <CardDescription>Les termes les plus fréquemment recherchés</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="term" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSearchTermsChart; 