"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirection après un court délai pour montrer le logo
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="mb-8">
        <Image
          src="/OSI_logo.png"
          alt="OSI Logo"
          width={200}
          height={200}
          priority
        />
      </div>
      <h1 className="text-2xl font-bold mb-4">Bienvenue sur le Dashboard Admin OSI</h1>
      <p className="text-muted-foreground">Redirection vers la page de connexion...</p>
    </div>
  );
}
