"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MagnifyingGlassIcon, PlusIcon, Pencil1Icon, TrashIcon, ArrowLeftIcon } from "@radix-ui/react-icons";
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Importer le fichier JSON
import ragDataFile from '@/data/search_20250223_180928.json';

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

  // Ajout d'un état pour gérer la confirmation de suppression
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, entryId: null });

  useEffect(() => {
    try {
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
      
      setRagData({ entries });
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setLoading(false);
    }
  }, []);

  // Calculer les entrées filtrées et la pagination
  const filteredEntries = ragData.entries.filter(entry => 
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.search?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Fonction pour gérer la suppression
  const handleDelete = async (entryId) => {
    try {
      // Appel API pour supprimer l'entrée
      const response = await fetch(`/api/rag-database/${entryId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Animation de suppression et mise à jour de l'état
        const updatedEntries = ragData.entries.filter(entry => entry.id !== entryId);
        setRagData({ entries: updatedEntries });
        toast.success("Entrée supprimée avec succès");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      // Fermer la boîte de dialogue
      setDeleteConfirmation({ show: false, entryId: null });
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
        <h1 className="text-3xl font-bold tracking-tight">
          Base de données RAG
        </h1>
        <Link href="/dashboard/rag-database/edit/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouvelle entrée
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rechercher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, description ou termes..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
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
                          <p className="font-medium">{entry.name}</p>
                          {entry.isDecisionTree && (
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              Arbre de décision
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <ReactMarkdown>{entry.description}</ReactMarkdown>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild 
                        >
                          <Link href={`/dashboard/rag-database/edit/${encodeURIComponent(entry.id)}`}>
                            <Pencil1Icon className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => setDeleteConfirmation({ show: true, entryId: entry.id })}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Afficher uniquement le premier message dans la vue de recherche */}
                    {entry.details?.messages && entry.details.messages.length > 0 && (
                      <div className="mt-4">
                        <p className="font-medium text-sm">
                          Message: {entry.details.messages[0].label}
                          {entry.isDecisionTree && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (+{entry.details.messages.length - 1} messages supplémentaires)
                            </span>
                          )}
                        </p>
                        
                        {entry.details.messages[0].bubbles?.map((bubble, bidx) => (
                          <div key={bidx} className="ml-4 mt-2">
                            <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown>{bubble.text}</ReactMarkdown>
                            </div>
                            {bubble.image && <img src={bubble.image} alt="Bubble image" className="mt-2 max-w-md rounded-md" />}
                            {bubble.video && <video src={bubble.video} className="mt-2 max-w-md rounded-md" controls />}
                          </div>
                        ))}

                        {/* Affichage des boutons */}
                        {entry.details.messages[0].buttons?.length > 0 && (
                          <div className="ml-4 mt-3">
                            <p className="text-xs text-muted-foreground mb-1">Boutons:</p>
                            <div className="flex flex-wrap gap-1">
                              {entry.details.messages[0].buttons.map((button, idx) => (
                                <div key={idx} className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs border border-gray-200 dark:border-gray-700">
                                  {button.label}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full animate-in fade-in slide-in-from-bottom-10 duration-300">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette entrée ? Cette action est irréversible.</p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirmation({ show: false, entryId: null })}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDelete(deleteConfirmation.entryId)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 