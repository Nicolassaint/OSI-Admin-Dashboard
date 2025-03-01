import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
      <div className="flex space-x-2">
        <Button asChild>
          <Link href="/dashboard/messages">Voir les messages</Link>
        </Button>
      </div>
    </div>
  );
} 