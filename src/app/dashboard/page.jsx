import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BarChartIcon,
  ChatBubbleIcon,
  FileTextIcon,
  PersonIcon,
} from "@radix-ui/react-icons";

export default function DashboardPage() {
  // Ces données seraient normalement chargées depuis une API
  const stats = [
    { name: "Total des messages", value: "1,234", icon: ChatBubbleIcon },
    { name: "Utilisateurs actifs", value: "456", icon: PersonIcon },
    { name: "Taux de réponse", value: "98%", icon: BarChartIcon },
    { name: "Entrées RAG", value: "5,678", icon: FileTextIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/dashboard/messages">Voir les messages</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Les dernières interactions avec le chatbot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 rounded-lg border p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Utilisateur #{i}</p>
                    <p className="text-sm text-muted-foreground">
                      A posé une question sur la documentation il y a {i} heure(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accès rapides</CardTitle>
            <CardDescription>
              Accédez rapidement aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/statistics">
                <BarChartIcon className="mr-2 h-4 w-4" />
                Voir les statistiques
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/messages">
                <ChatBubbleIcon className="mr-2 h-4 w-4" />
                Gérer les messages
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/rag-database">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Explorer la base RAG
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 