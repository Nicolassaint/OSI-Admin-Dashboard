"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, lazy, Suspense } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Chargement différé des composants de graphiques
const ChartComponents = lazy(() => import('@/components/charts/ChartComponents'));

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState("week");

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

      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<div className="h-80 flex items-center justify-center">Chargement des graphiques...</div>}>
          <ChartComponents timeRange={timeRange} />
        </Suspense>

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
                  <p className="text-2xl font-bold">1.2s</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Taux de réponse</p>
                  <p className="text-2xl font-bold">98%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold">456</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Précision des réponses</p>
                  <p className="text-2xl font-bold">92%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 