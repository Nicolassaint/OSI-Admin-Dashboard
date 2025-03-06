"use client";

import { useState, useEffect } from "react";
import ConversationsSettings from "@/components/settings/ConversationsSettings";
import JsonFileSettings from "@/components/settings/JsonFileSettings";
import BackupManager from "@/components/settings/BackupManager";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
        
        const response = await fetch(`${apiUrl}/health?token=${apiToken}`, {
          signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        setError(null);
      } catch (err) {
        console.error("Erreur de connexion à l'API:", err);
        setError("Le serveur API n'est pas accessible. Veuillez vérifier votre connexion.");
      } finally {
        setLoading(false);
      }
    };

    checkApiConnection();
  }, []);

  const handleError = (errorMessage) => {
    console.error("Erreur dans les paramètres:", errorMessage);
    setError(errorMessage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Erreur de connexion à l'API</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <ConversationsSettings setError={handleError} />
          <JsonFileSettings setError={handleError} />
        </div>
        
        <div>
          <BackupManager setError={handleError} />
        </div>
      </div>
    </div>
  );
}