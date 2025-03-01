"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GeneralInfoTab from "@/components/rag-database/general-info-tab";
import MessagesTab from "@/components/rag-database/messages-tab";
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

// Importer le fichier JSON
import ragDataFile from '@/data/search_20250223_180928.json';

export default function EditRagEntryPage({ params }) {
  const router = useRouter();
  const id = React.use(params).id;
  const isNewEntry = id === "new";
  
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

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
      // Charger l'entrée existante depuis le fichier JSON
      try {
        // Décoder l'ID pour gérer les caractères spéciaux
        const decodedId = decodeURIComponent(id);
        
        // Convertir les données du fichier JSON en tableau d'entrées
        const entries = Object.entries(ragDataFile).map(([key, value]) => ({
          id: key,
          name: value.name,
          description: value.description,
          search: value.search,
          isDecisionTree: value.details?.Messages && value.details?.Messages.length > 1,
          details: {
            label: value.details?.Label,
            messages: value.details?.Messages?.map(message => ({
              label: message.Label,
              description: message.Description,
              bubbles: message.Bubbles?.map(bubble => ({
                text: bubble.Text,
                image: bubble.Image,
                video: bubble.Video,
                order: bubble.Order
              })) || [],
              buttons: message.Buttons?.map(button => ({
                label: button.Label,
                link: button.Link,
                type: button.Type,
                order: button.Order
              })) || []
            })) || []
          }
        }));
        
        // Rechercher l'entrée par ID décodé
        const foundEntry = entries.find(e => e.id === decodedId);
        
        if (foundEntry) {
          setEntry(foundEntry);
        } else {
          console.error(`Entrée avec ID ${decodedId} non trouvée`);
          // Rediriger vers la liste si l'entrée n'est pas trouvée
          router.push("/dashboard/rag-database");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'entrée:", error);
        router.push("/dashboard/rag-database");
      }
      
      setLoading(false);
    }
  }, [id, isNewEntry, router]);

  const handleSave = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir enregistrer les modifications pour "${entry.name}" ?`)) {
      // Ici, vous pourriez implémenter la logique pour sauvegarder dans votre fichier JSON
      // Pour l'instant, nous allons simplement rediriger vers la liste
      router.push("/dashboard/rag-database");
    }
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
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/rag-database">
            <Button variant="outline" size="default" className="flex items-center gap-2 px-4 py-2 transition-colors hover:bg-muted">
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Retour</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNewEntry ? "Nouvelle entrée" : `Modifier: ${entry.name}`}
          </h1>
          {entry.isDecisionTree && (
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              Arbre de décision
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/rag-database")}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>

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
    </div>
  );
} 