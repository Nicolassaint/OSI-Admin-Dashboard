"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState({ isChecking: true, isOnline: true });

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    setApiStatus({ isChecking: true, isOnline: true });
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
        },
      });
      
      setApiStatus({ isChecking: false, isOnline: response.ok });
    } catch (error) {
      console.error("API health check failed:", error);
      setApiStatus({ isChecking: false, isOnline: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password: password.trim(),
      });

      if (result.error) {
        setError("Identifiants invalides");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setError("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  // Si l'API est hors ligne, afficher un message d'erreur
  if (!apiStatus.isChecking && !apiStatus.isOnline) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Image
                src="/OSI_logo.png"
                alt="OSI Logo"
                width={150}
                height={150}
                priority
              />
            </div>
            <CardTitle className="text-2xl text-center">Service indisponible</CardTitle>
            <CardDescription className="text-center">
              Le serveur backend est actuellement inaccessible. Veuillez réessayer ultérieurement.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              onClick={checkApiHealth} 
              className="mt-4"
              disabled={apiStatus.isChecking}
            >
              {apiStatus.isChecking ? "Vérification..." : "Réessayer"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image
              src="/OSI_logo.png"
              alt="OSI Logo"
              width={150}
              height={150}
              priority
            />
          </div>
          <CardTitle className="text-2xl text-center">Dashboard Admin OSI</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous pour accéder au tableau de bord
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md 
                focus:outline-none focus:ring-2 focus:ring-primary 
                bg-background text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md 
                focus:outline-none focus:ring-2 focus:ring-primary 
                bg-background text-foreground"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 