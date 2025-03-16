"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import GeneralInfoTab from "@/components/rag-database/general-info-tab";
import MessagesTab from "@/components/rag-database/messages-tab";
import React from 'react';
import { toast } from "sonner";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Référence au cache global défini dans la page principale
// Cette variable sera undefined dans ce module, mais c'est normal
// Elle est utilisée uniquement pour indiquer qu'il faut invalider le cache
let ragDataCache = null;

export default function EditRagEntryPage({ params }) {
  const router = useRouter();
  const id = React.use(params).id;
  const isNewEntry = id === "new";
  
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [confirmSave, setConfirmSave] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (isNewEntry) {
      // Créer une nouvelle entrée vide
      setEntry({
        id: `entry_${Date.now()}`,
        name: "Nouvelle entrée",
        description: "",
        search: "",
        isDecisionTree: false,
        details: {
          label: "",
          messages: [{
            label: "Message principal",
            description: "",
            bubbles: [{
              text: "",
              image: "",
              video: "",
              order: 0
            }],
            buttons: []
          }]
        }
      });
      setLoading(false);
    } else {
      // Charger les données depuis l'API
      fetchEntry();
    }
  }, [id, isNewEntry]);

  const fetchEntry = async () => {
    try {
      setLoading(true);
      setApiError(null);
      setLoadError(null);
      
      const decodedId = decodeURIComponent(id);
      
      // Utiliser la route spécifique pour récupérer une entrée par ID
      const response = await fetch(`/api/proxy/rag/data?id=${encodeURIComponent(decodedId)}`, {
        signal: AbortSignal.timeout(10000),
        cache: 'no-store' // S'assurer d'obtenir les données les plus récentes
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      const data = responseData.data; // Accéder aux données dans la propriété "data"
      
      // Convertir les données au format attendu
      const formattedEntry = {
        id: decodedId,
        name: data.name || "",
        description: data.description || "",
        search: data.search || "",
        isDecisionTree: Boolean(data.details?.Messages && data.details.Messages.length > 1),
        details: {
          label: data.details?.Label || "",
          messages: (data.details?.Messages || []).map(message => ({
            label: message.Label || "",
            description: message.Description || "",
            bubbles: (message.Bubbles || []).map(bubble => ({
              text: bubble.Text || "",
              image: bubble.Image || "",
              video: bubble.Video || "",
              order: bubble.Order || 0
            })),
            buttons: (message.Buttons || []).map(button => ({
              label: button.Label || "",
              link: button.Link || "",
              type: button.Type || "",
              order: button.Order || 0
            }))
          }))
        }
      };
      
      setEntry(formattedEntry);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement de l'entrée:", error);
      setLoadError(`Impossible de charger l'entrée: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      
      // Convertir les données au format attendu par l'API
      const apiData = {
        name: entry.name,
        description: entry.description,
        search: entry.search,
        details: {
          Label: entry.details.label,
          Messages: entry.details.messages.map(message => ({
            Label: message.label,
            Description: message.description,
            Bubbles: message.bubbles.map(bubble => ({
              Text: bubble.text,
              Image: bubble.image,
              Video: bubble.video,
              Order: bubble.order
            })),
            Buttons: message.buttons.map(button => ({
              Label: button.label,
              Link: button.link,
              Type: button.type,
              Order: button.order
            }))
          }))
        }
      };
      
      // Déterminer si c'est une création ou une mise à jour
      const method = isNewEntry ? 'POST' : 'PUT';
      const url = isNewEntry 
        ? `/api/proxy/rag/data` 
        : `/api/proxy/rag/data?id=${encodeURIComponent(entry.id)}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      // Invalider le cache global pour forcer un rechargement des données
      // lors du retour à la page principale
      if (typeof window !== 'undefined') {
        // Utiliser une approche qui fonctionne même si le cache n'est pas directement accessible
        window.localStorage.setItem('ragDataCacheInvalidated', Date.now().toString());
      }
      
      toast({
        title: "Enregistrement réussi",
        description: "Les modifications ont été enregistrées avec succès.",
        variant: "default"
      });
      
      // Synchroniser la base de données RAG
      await fetch(`/api/proxy/rag/sync`, {
        method: 'POST'
      });
      
      // Rediriger vers la page principale
      router.push('/dashboard/rag-database');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      setSaveError(`Impossible d'enregistrer les modifications: ${error.message}`);
    } finally {
      setSaving(false);
      setConfirmSave(false);
    }
  };

  // Fonction pour réessayer le chargement
  const handleRetry = () => {
    if (isNewEntry) {
      setApiError(null);
    } else {
      fetchEntry();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de l'entrée...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {isNewEntry ? "Nouvelle entrée" : "Modifier l'entrée"}
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/rag-database")}>
            Retour à la liste
          </Button>
          <Button 
            onClick={() => setConfirmSave(true)}
            disabled={saving || loadError}
          >
            Enregistrer
          </Button>
        </div>
      </div>

      {loadError && (
        <Alert variant="destructive">
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            {loadError}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/dashboard/rag-database")}
              >
                Retourner à la liste
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!loadError && (
        <>
          {apiError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Erreur de connexion à l'API</AlertTitle>
              <AlertDescription>
                <p>{apiError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={handleRetry}
                >
                  Réessayer
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {saveError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Erreur lors de l'enregistrement</AlertTitle>
              <AlertDescription>
                <p>{typeof saveError === 'object' ? JSON.stringify(saveError) : saveError}</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="w-full border-b mb-6">
            <div className="flex">
              <button 
                className={`px-4 py-2 font-medium ${activeTab === "general" ? "border-b-2 border-primary" : ""}`}
                onClick={() => setActiveTab("general")}
              >
                Informations générales
              </button>
              <button 
                className={`px-4 py-2 font-medium ${activeTab === "messages" ? "border-b-2 border-primary" : ""}`}
                onClick={() => setActiveTab("messages")}
              >
                Messages
              </button>
            </div>
          </div>
          
          {activeTab === "general" && (
            <div className="space-y-4">
              <GeneralInfoTab entry={entry} setEntry={setEntry} />
            </div>
          )}
          
          {activeTab === "messages" && (
            <div className="space-y-4">
              <MessagesTab entry={entry} setEntry={setEntry} />
            </div>
          )}
        </>
      )}

      <ConfirmationDialog
        isOpen={confirmSave}
        onClose={() => setConfirmSave(false)}
        onConfirm={handleSave}
        title="Confirmer l'enregistrement"
        message={`Êtes-vous sûr de vouloir enregistrer les modifications pour "${entry?.name}" ?`}
        confirmLabel="Enregistrer"
        isLoading={saving}
      />
    </div>
  );
}