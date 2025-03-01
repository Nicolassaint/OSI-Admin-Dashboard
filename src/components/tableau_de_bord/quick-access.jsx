import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChartIcon, ChatBubbleIcon, FileTextIcon } from "@radix-ui/react-icons";

export function QuickAccess() {
  return (
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
  );
} 