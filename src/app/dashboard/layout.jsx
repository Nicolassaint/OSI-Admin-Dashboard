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
} from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";
import { Suspense } from "react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r bg-card">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/OSI_logo.png"
                alt="OSI Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="font-bold text-xl">OSI Admin</span>
            </Link>
          </div>
          <div className="mt-8 flex flex-col flex-1">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
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
                );
              })}
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
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-card shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center md:hidden">
                <Button variant="ghost" size="sm">
                  <DashboardIcon className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center">
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          <Suspense fallback={<div>Chargement...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
} 