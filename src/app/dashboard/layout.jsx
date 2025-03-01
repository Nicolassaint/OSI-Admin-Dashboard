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
} from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";
import { Suspense } from "react";
import { useTheme } from "next-themes";

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
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-card border-r border-border">
        {/* Logo et titre */}
        <div className="flex flex-col items-center pt-8 pb-6">
          <div className="mb-4">
            <Image 
              src="/OSI_logo.png" 
              alt="OSI Admin Logo" 
              width={80} 
              height={80} 
              className="rounded-full"
            />
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
              <div className="flex items-center md:hidden">
                <Button variant="ghost" size="sm">
                  <DashboardIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="mr-4 flex items-center gap-2"
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
                <div className="ml-4 flex items-center md:ml-6">
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
    </div>
  );
} 