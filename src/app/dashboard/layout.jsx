"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  BarChartIcon,
  ChatBubbleIcon,
  GearIcon,
  ExitIcon,
  DashboardIcon,
  FileTextIcon,
  SunIcon,
  MoonIcon,
  Cross2Icon,
  QuestionMarkIcon,
} from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";
import { Suspense, useEffect } from "react";
import { useTheme } from "next-themes";
import { useState } from "react";
import SystemStatusIndicator from "@/components/layout/SystemStatusIndicator";
import { getCachedData, setCachedData } from "@/lib/cache";

// Fonction pour précharger les données du tableau de bord
async function preloadDashboardData() {
  try {
    // Vérifier si les données sont déjà en cache
    const cachedMetrics = getCachedData('metrics');
    const cachedActivity = getCachedData('recentActivity');
    
    if (cachedMetrics && cachedActivity) {
      return; // Les données sont déjà en cache
    }

    // Précharger les métriques
    const metricsResponse = await fetch(`/api/proxy/dashboard-metrics`, {
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(25000)
    });
    
    if (metricsResponse.ok) {
      const metricsData = await metricsResponse.json();
      const formattedMetrics = {
        totalMessages: metricsData.total_messages ? metricsData.total_messages.toLocaleString() : "0",
        responseTime: metricsData.avg_response_time ? metricsData.avg_response_time.toFixed(2) + 's' : "0s",
        satisfactionRate: metricsData.satisfaction_rate ? metricsData.satisfaction_rate.toFixed(0) + '%' : "Aucun avis",
        ragItems: metricsData.rag_entries ? metricsData.rag_entries.toLocaleString() : "0"
      };
      setCachedData('metrics', formattedMetrics);
    }

    // Précharger l'activité récente
    const activityResponse = await fetch(`/api/proxy/conversations?limit=3`, {
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(25000)
    });
    
    if (activityResponse.ok) {
      const activityData = await activityResponse.json();
      const formattedActivity = Array.isArray(activityData) 
        ? activityData.map(conv => ({
            id: conv.id || conv._id,
            user: "Utilisateur",
            message: conv.user_message 
              ? conv.user_message.substring(0, 100) + (conv.user_message.length > 100 ? "..." : "") 
              : (conv.messages && conv.messages.length > 0 
                ? conv.messages[0].content.substring(0, 100) + (conv.messages[0].content.length > 100 ? "..." : "") 
                : "Message vide"),
            timestamp: conv.created_at || conv.timestamp || new Date().toISOString(),
            status: conv.status || "completed"
          }))
        : [];
      
      setCachedData('recentActivity', formattedActivity);
    }
  } catch (error) {
    console.error('Erreur lors du préchargement des données:', error);
  }
}

// Ajout du composant de chargement avec logo rotatif
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin">
        <Image 
          src="/OSI_logo.png" 
          alt="OSI Logo Loading" 
          width={80} 
          height={80} 
          className="rounded-full"
        />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Précharger les données du tableau de bord dès que l'utilisateur est authentifié
  useEffect(() => {
    if (status === "authenticated") {
      preloadDashboardData();
    }
  }, [status]);

  useEffect(() => {
    // Synchroniser le thème avec la classe du document
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
  }, [theme]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const navigation = [
    { name: "Tableau de bord", href: "/dashboard", icon: DashboardIcon },
    { name: "Statistiques", href: "/dashboard/statistics", icon: BarChartIcon },
    { name: "Messages", href: "/dashboard/messages", icon: ChatBubbleIcon },
    { name: "Base RAG", href: "/dashboard/rag-database", icon: FileTextIcon },
    { name: "Paramètres", href: "/dashboard/settings", icon: GearIcon },
    { name: "Documentation", href: "/dashboard/documentation", icon: QuestionMarkIcon },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-card border-r border-border">
        {/* Logo et titre */}
        <div className="flex flex-col items-center pt-8 pb-6">
          <div className="mb-4 cursor-pointer">
            <Link href="/dashboard">
              <Image 
                src="/OSI_logo.png" 
                alt="OSI Admin Logo" 
                width={80} 
                height={80}
                priority
                className="rounded-full"
              />
            </Link>
          </div>
          <h1 className="text-xl font-semibold text-foreground">OSI Admin</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 mt-2">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <ExitIcon className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-card border-b border-border shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex items-center md:hidden">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    {isMobileMenuOpen ? (
                      <Cross2Icon className="h-5 w-5" />
                    ) : (
                      <DashboardIcon className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                
                {/* Groupe du milieu : toggle theme et utilisateur */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newTheme = theme === "dark" ? "light" : "dark";
                      setTheme(newTheme);
                      document.documentElement.classList.toggle("dark", newTheme === "dark");
                    }}
                    className="flex items-center gap-2"
                  >
                    {theme === "dark" ? (
                      <>
                        <SunIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Mode clair</span>
                      </>
                    ) : (
                      <>
                        <MoonIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Mode sombre</span>
                      </>
                    )}
                  </Button>
                  <div className="text-sm font-medium">
                    {session?.user?.name || "Utilisateur"} 
                    {session?.user?.role && (
                      <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                        {session.user.role === "admin" ? "Administrateur" : "Utilisateur"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* État du système à droite */}
              <SystemStatusIndicator />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 w-3/4 bg-card border-r border-border p-6">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Image 
                      src="/OSI_logo.png" 
                      alt="OSI Admin Logo" 
                      width={40} 
                      height={40}
                      priority
                      className="rounded-full"
                    />
                  </Link>
                  <h2 className="text-lg font-semibold">OSI Admin</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              </div>

              <nav className="flex-1">
                <ul className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <ExitIcon className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}