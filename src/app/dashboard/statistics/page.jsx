"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, lazy, Suspense, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Chargement différé des composants de graphiques
const ChartComponents = lazy(() => import('@/components/charts/ChartComponents'));

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState("week");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overview: {},
    messages: {},
    rag: {}
  });

  // Simuler le chargement des données depuis une API
  useEffect(() => {
    setLoading(true);
    
    // Données simulées pour les statistiques
    setTimeout(() => {
      setStats({
        overview: {
          totalUsers: 456,
          totalMessages: 1234,
          responseRate: 98,
          avgResponseTime: 1.2,
          userSatisfaction: 87
        },
        messages: {
          messagesByDay: [
            { day: "Lun", count: 120 },
            { day: "Mar", count: 145 },
            { day: "Mer", count: 132 },
            { day: "Jeu", count: 167 },
            { day: "Ven", count: 189 },
            { day: "Sam", count: 95 },
            { day: "Dim", count: 87 }
          ],
          messageCategories: [
            { name: "Questions techniques", value: 45 },
            { name: "Support client", value: 30 },
            { name: "Documentation", value: 15 },
            { name: "Autres", value: 10 }
          ],
          responseQuality: [
            { name: "Excellent", value: 42 },
            { name: "Bon", value: 38 },
            { name: "Moyen", value: 15 },
            { name: "Insuffisant", value: 5 }
          ]
        },
        rag: {
          topSearchTerms: [
            { term: "configuration", count: 87 },
            { term: "api", count: 65 },
            { term: "documentation", count: 54 },
            { term: "erreur", count: 43 },
            { term: "connexion", count: 38 }
          ],
          ragUsage: [
            { day: "Lun", count: 98 },
            { day: "Mar", count: 112 },
            { day: "Mer", count: 105 },
            { day: "Jeu", count: 132 },
            { day: "Ven", count: 145 },
            { day: "Sam", count: 76 },
            { day: "Dim", count: 65 }
          ],
          ragPerformance: {
            precision: 92,
            recall: 88,
            latency: 1.2,
            coverage: 85
          }
        }
      });
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="rag">Base RAG</TabsTrigger>
        </TabsList>
        
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé des performances</CardTitle>
                    <CardDescription>
                      Métriques clés du chatbot
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Temps de réponse moyen</p>
                          <p className="text-2xl font-bold">{stats.overview.avgResponseTime}s</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Taux de réponse</p>
                          <p className="text-2xl font-bold">{stats.overview.responseRate}%</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Utilisateurs actifs</p>
                          <p className="text-2xl font-bold">{stats.overview.totalUsers}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Satisfaction utilisateur</p>
                          <p className="text-2xl font-bold">{stats.overview.userSatisfaction}%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Activité hebdomadaire</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={stats.messages.messagesByDay}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Catégories de messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.messages.messageCategories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {stats.messages.messageCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Qualité des réponses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.messages.responseQuality}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8">
                            {stats.messages.responseQuality.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="rag">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Termes les plus recherchés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.rag.topSearchTerms}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
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

                <Card>
                  <CardHeader>
                    <CardTitle>Performance RAG</CardTitle>
                    <CardDescription>
                      Métriques de la base de connaissances
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Précision</p>
                          <p className="text-2xl font-bold">{stats.rag.ragPerformance.precision}%</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Rappel</p>
                          <p className="text-2xl font-bold">{stats.rag.ragPerformance.recall}%</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Latence</p>
                          <p className="text-2xl font-bold">{stats.rag.ragPerformance.latency}s</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Couverture</p>
                          <p className="text-2xl font-bold">{stats.rag.ragPerformance.coverage}%</p>
                        </div>
                      </div>
                      <div className="h-60 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={stats.rag.ragUsage}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#0088FE" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
} 