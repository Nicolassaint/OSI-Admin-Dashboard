import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const ChartComponents = ({ timeRange }) => {
  // Données fictives pour les graphiques (vous pouvez les déplacer depuis le composant parent)
  const messageData = [
    { name: "Lun", messages: 40 },
    { name: "Mar", messages: 30 },
    { name: "Mer", messages: 45 },
    { name: "Jeu", messages: 50 },
    { name: "Ven", messages: 35 },
    { name: "Sam", messages: 25 },
    { name: "Dim", messages: 20 },
  ];

  const userSatisfactionData = [
    { name: "Lun", satisfaction: 85 },
    { name: "Mar", satisfaction: 90 },
    { name: "Mer", satisfaction: 88 },
    { name: "Jeu", satisfaction: 92 },
    { name: "Ven", satisfaction: 89 },
    { name: "Sam", satisfaction: 91 },
    { name: "Dim", satisfaction: 87 },
  ];

  const topQuestionsData = [
    { name: "Comment utiliser X", value: 30 },
    { name: "Où trouver Y", value: 25 },
    { name: "Problème avec Z", value: 20 },
    { name: "Autres", value: 25 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Messages par jour</CardTitle>
          <CardDescription>Nombre de messages échangés</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={messageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="messages" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Satisfaction utilisateur</CardTitle>
          <CardDescription>Taux de satisfaction en pourcentage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userSatisfactionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="satisfaction" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions fréquentes</CardTitle>
          <CardDescription>Distribution des questions les plus posées</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topQuestionsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topQuestionsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default ChartComponents; 