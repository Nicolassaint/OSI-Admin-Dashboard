"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MagnifyingGlassIcon, PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import MessagePreview from "@/components/rag-database/message-preview";
const ITEMS_PER_PAGE = 5; // Nombre d'entrées à afficher par page

export default function RagDatabasePage() {
  const router = useRouter();
  
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ragData, setRagData] = useState({
    entries: []
  });
  const [apiError, setApiError] = useState(null);

  // Ajout d'un état pour gérer la confirmation de suppression
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, entryId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRagData();
  }, []);

  // Fonction pour récupérer les données depuis l'API backend
  const fetchRagData = async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/rag/data?token=${apiToken}`;
      
      // console.log('Fetching data from:', apiUrl); // Debug log
      
      const response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(10000)
      });
      
      // console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText); // Debug log
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.detail || errorMessage;
          } catch (e) {
            // Si ce n'est pas du JSON, utiliser le texte brut
            errorMessage = errorText || errorMessage;
          }
        }
        
        // Afficher l'erreur dans l'interface utilisateur
        setApiError(errorMessage);
        return;
      }
      
      const responseData = await response.json();
      // console.log('Received data:', responseData); // Debug log
      
      // Vérification plus stricte du format des données
      if (!responseData || typeof responseData !== 'object') {
        setApiError("Format de données invalide reçu de l'API");
        return;
      }

      // Utiliser data si présent, sinon utiliser responseData directement
      const data = responseData.data || responseData;
      
      if (!data || Object.keys(data).length === 0) {
        setApiError("Aucune donnée n'a été retournée par l'API");
        return;
      }
      
      // Convertir les données du format backend au format utilisé par le frontend
      const entries = Object.entries(data).map(([key, value]) => {
        // Vérifier si la structure contient déjà details ou s'il faut l'adapter
        const hasStandardFormat = value.details && value.details.Messages;
        
        return {
          id: key,
          name: value.name,
          description: value.description,
          search: value.search,
          isDecisionTree: hasStandardFormat 
            ? value.details.Messages && value.details.Messages.length > 1
            : false,
          details: hasStandardFormat 
            ? {
                label: value.details.Label,
                messages: value.details.Messages?.map(message => ({
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
            : {
                label: value.name,
                messages: [{
                  label: "Message principal",
                  description: value.description,
                  bubbles: [{
                    text: value.description,
                    image: "",
                    video: "",
                    order: 0
                  }],
                  buttons: []
                }]
              }
        };
      });
      
      setRagData({ entries });
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      
      // Déterminer le type d'erreur
      if (error.name === "AbortError") {
        setApiError("La requête a expiré. Le serveur API est peut-être indisponible.");
      } else if (error.message === "API_NOT_FOUND") {
        setApiError("L'API n'est pas accessible. Vérifiez que le serveur backend est en cours d'exécution.");
      } else if (error.message.includes("404")) {
        setApiError("Entrée non trouvée: " + error.message);
      } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        setApiError("Impossible de se connecter au serveur API. Vérifiez votre connexion réseau.");
      } else {
        toast.error(`Erreur: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réessayer le chargement
  const handleRetry = () => {
    fetchRagData();
  };

  // Fonction pour gérer la suppression
  const handleDelete = async (entryId) => {
    try {
      setIsDeleting(true);
      
      const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
      
      // Appel à l'API backend pour supprimer l'entrée avec le token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rag/data/${encodeURIComponent(entryId)}?token=${apiToken}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(10000) // Timeout après 10 secondes
      });
      
      if (!response.ok) {
        // Vérifier si c'est une erreur 404 (ressource non trouvée)
        if (response.status === 404) {
          const errorText = await response.text().catch(() => "");
          let errorMessage = `Erreur 404: ${response.statusText}`;
          
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.detail || errorMessage;
            } catch (e) {
              // Si ce n'est pas du JSON, utiliser le texte brut
              errorMessage = errorText || errorMessage;
            }
          }
          
          toast.error(errorMessage);
          
          // Si l'entrée n'existe plus, la supprimer de l'interface
          const updatedEntries = ragData.entries.filter(entry => entry.id !== entryId);
          setRagData({ entries: updatedEntries });
          return;
        }
        
        const errorData = await response.json().catch(() => ({ detail: `Erreur ${response.status}: ${response.statusText}` }));
        toast.error(`Erreur lors de la suppression: ${errorData.detail || "Une erreur est survenue"}`);
        return;
      }
      
      // Animation de suppression et mise à jour de l'état
      const updatedEntries = ragData.entries.filter(entry => entry.id !== entryId);
      setRagData({ entries: updatedEntries });
      toast.success("Entrée supprimée avec succès");
      
      // Synchroniser les données RAG après la suppression
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rag/sync?token=${apiToken}`, {
          method: 'POST',
          signal: AbortSignal.timeout(5000)
        });
      } catch (syncError) {
        console.warn("Avertissement: Impossible de synchroniser les données après la suppression", syncError);
        // Ne pas bloquer le flux principal si la synchronisation échoue
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      
      if (error.name === "AbortError") {
        toast.error("La requête de suppression a expiré. Le serveur API est peut-être indisponible.");
      } else if (error.message === "API_NOT_FOUND") {
        toast.error("L'API n'est pas accessible. Vérifiez que le serveur backend est en cours d'exécution.");
      } else if (error.message.includes("404")) {
        toast.error("Entrée non trouvée: " + error.message);
      } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        toast.error("Impossible de se connecter au serveur API pour la suppression.");
      } else {
        toast.error(`Erreur lors de la suppression: ${error.message}`);
      }
    } finally {
      // Fermer la boîte de dialogue
      setDeleteConfirmation({ show: false, entryId: null });
      setIsDeleting(false);
    }
  };

  // Calculer les entrées filtrées et la pagination
  const searchTermLower = searchTerm?.toLowerCase() || "";

  const filteredEntries = ragData.entries.filter(entry => 
    (typeof entry?.name === 'string' ? entry.name.toLowerCase().includes(searchTermLower) : false) ||
    (typeof entry?.description === 'string' ? entry.description.toLowerCase().includes(searchTermLower) : false) ||
    (typeof entry?.search === 'string' ? entry.search.toLowerCase().includes(searchTermLower) : false) ||
    (typeof entry?.details?.label === 'string' ? entry.details.label.toLowerCase().includes(searchTermLower) : false) ||
    entry?.details?.messages?.some(message => 
      typeof message?.label === 'string' ? message.label.toLowerCase().includes(searchTermLower) : false
    )
  );
  
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Base de données RAG</h1>
        <Button onClick={() => router.push("/dashboard/rag-database/edit/new")}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvelle entrée
        </Button>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Rechercher</CardTitle>
          <CardDescription>
            Recherchez dans la base de données RAG par nom, description ou contenu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Réinitialiser la pagination lors d'une nouvelle recherche
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résultats ({filteredEntries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Aucune entrée trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{entry.name}</h3>
                          {entry.details?.messages && entry.details.messages.length > 1 && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Arbre de décision
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(`/dashboard/rag-database/edit/${encodeURIComponent(entry.id)}`);
                          }}
                          title="Modifier l'entrée"
                        >
                          <Pencil1Icon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm" 
                          onClick={() => setDeleteConfirmation({ show: true, entryId: entry.id })}
                          title="Supprimer l'entrée"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Afficher uniquement le premier message dans la vue de recherche */}
                    {entry.details?.messages && entry.details.messages.length > 0 && (
                      <div className="mt-4">
                        <MessagePreview message={entry.details.messages[0]} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <span className="flex items-center px-3">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Composant de confirmation de suppression */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.show}
        onClose={() => setDeleteConfirmation({ show: false, entryId: null })}
        onConfirm={() => handleDelete(deleteConfirmation.entryId)}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette entrée ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}