"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MagnifyingGlassIcon, PlusIcon, Pencil1Icon, TrashIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import MessagePreview from "@/components/rag-database/message-preview";
import ReactMarkdown from 'react-markdown';
import { getRagCache, setRagCache, invalidateRagCache, isRagCacheInvalid, resetRagCacheInvalidation } from "@/lib/cache";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ItemsPerPageSelector } from "@/components/ui/items-per-page-selector";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button";

// Cache global pour stocker les données RAG entre les navigations
let ragDataCache = null;
let lastFetchTime = 0;
// La durée du cache est de 5 minutes car les mises à jour sont gérées par WebSocket
const CACHE_DURATION = 300000; // 5 minutes en millisecondes
const FETCH_TIMEOUT = 30000; // 30 secondes en millisecondes

export default function RagDatabasePage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Nouvel état pour le nombre d'entrées par page
  const [ragData, setRagData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(""); // Nouvelle variable d'état pour la catégorie sélectionnée
  const [categories, setCategories] = useState([]); // Pour stocker la liste des catégories disponibles
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false); // Pour contrôler l'état du popover de catégorie

  // Ajout d'un état pour gérer la confirmation de suppression
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, entryId: null });
  const [deleteLoading, setDeleteLoading] = useState(false);



  // Fonction pour récupérer les données depuis l'API backend
  const fetchRagData = useCallback(async (forceRefresh = false) => {
    try {
      // Vérifier si le cache est invalide
      if (isRagCacheInvalid()) {
        forceRefresh = true;
        resetRagCacheInvalidation();
      }

      // Vérifier si nous avons des données en cache et si elles sont encore valides
      if (!forceRefresh) {
        const cachedData = getRagCache();
        if (cachedData) {
          setRagData(cachedData);
          setFilteredData(cachedData);
          setTotalEntries(cachedData.length);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setApiError(null);
      
      // Créer un AbortController avec un timeout plus long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
      
      const response = await fetch(`/api/proxy/rag/data`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Formater les données pour l'affichage
      const formattedData = Array.isArray(data) ? data : [];
      
      // Mettre à jour le cache et le timestamp
      setRagCache(formattedData);
      lastFetchTime = Date.now();
      
      setRagData(formattedData);
      setFilteredData(formattedData);
      setTotalEntries(formattedData.length);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des données RAG:', error);
      
      // Gérer spécifiquement l'erreur de timeout
      if (error.name === 'AbortError') {
        setApiError("Le chargement prend trop de temps. Veuillez réessayer.");
      } else {
        setApiError("Impossible de charger les données. Veuillez vérifier que le backend est en cours d'exécution.");
      }
      
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Vérifier si le cache est valide avant de charger
    const cachedData = getRagCache();
    if (cachedData && !isRagCacheInvalid()) {
      setRagData(cachedData);
      setFilteredData(cachedData);
      setTotalEntries(cachedData.length);
      setLoading(false);
    } else {
      fetchRagData(true); // Forcer le rechargement si le cache est invalide
    }
    
    // Ajouter un écouteur d'événement pour détecter quand l'utilisateur revient sur cette page
    const handleFocus = () => {
      // Si le cache est périmé ou invalide, recharger les données
      if (isRagCacheInvalid() || Date.now() - lastFetchTime > CACHE_DURATION) {
        fetchRagData(true);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchRagData]);

  // Effet pour extraire les catégories uniques des données RAG
  useEffect(() => {
    if (!ragData || !ragData.length) return;
    
    // Extraire toutes les catégories uniques
    const uniqueCategories = [...new Set(
      ragData
        .map(entry => entry.categorie)
        .filter(category => category !== undefined && category !== null && category !== "")
    )];
    
    // Trier les catégories par ordre alphabétique
    uniqueCategories.sort();
    
    setCategories(uniqueCategories);
  }, [ragData]);

  // Effet modifié pour filtrer par terme de recherche ET catégorie avec pondération
  useEffect(() => {
    if (!ragData) return;

    const searchTermLower = searchTerm?.toLowerCase() || "";

    // Filtre initial par terme de recherche
    let filtered = ragData;

    if (searchTermLower !== "") {
      // Créer un tableau avec les entrées et leur score de pertinence
      const scoredEntries = ragData.map(entry => {
        let score = 0;
        let matches = false;

        // Score prioritaire pour le nom (name)
        if (typeof entry?.name === 'string') {
          const nameLower = entry.name.toLowerCase();

          // Score maximal pour correspondance exacte (insensible à la casse)
          if (nameLower === searchTermLower) {
            score = 10000;
            matches = true;
          }
          // Score normal pour correspondance partielle dans le nom
          else if (nameLower.includes(searchTermLower)) {
            score = 1000;
            matches = true;
          }
        }

        // Score normal pour les autres champs (seulement si pas de match dans name)
        if (!matches && (
          (typeof entry?.description === 'string' && entry.description.toLowerCase().includes(searchTermLower)) ||
          (typeof entry?.search === 'string' && entry.search.toLowerCase().includes(searchTermLower)) ||
          (typeof entry?.details?.label === 'string' && entry.details.label.toLowerCase().includes(searchTermLower)) ||
          (typeof entry?.details?.Label === 'string' && entry.details.Label.toLowerCase().includes(searchTermLower)) ||
          entry?.details?.messages?.some(message =>
            typeof message?.label === 'string' && message.label.toLowerCase().includes(searchTermLower)
          ) ||
          entry?.details?.Messages?.some(message =>
            typeof message?.Label === 'string' && message.Label.toLowerCase().includes(searchTermLower)
          )
        )) {
          score = 10;
          matches = true;
        }

        return { entry, score, matches };
      });

      // Filtrer uniquement les entrées qui matchent et trier par score décroissant
      filtered = scoredEntries
        .filter(item => item.matches)
        .sort((a, b) => b.score - a.score)
        .map(item => item.entry);
    }

    // Filtre supplémentaire par catégorie si une catégorie est sélectionnée
    if (selectedCategory) {
      filtered = filtered.filter(entry => entry.categorie === selectedCategory);
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Réinitialiser la pagination lors d'un changement de filtre
  }, [searchTerm, ragData, selectedCategory]);

  // Réinitialiser la page courante quand le nombre d'entrées par page change
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Scroller en haut de la page lors du changement de page
  useEffect(() => {
    // Scroller le conteneur main du layout
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo(0, 0);
    }
  }, [currentPage]);

  // Fonction pour réessayer le chargement
  const handleRetry = () => {
    fetchRagData(true); // Force le rechargement des données
  };

  // Fonction pour gérer la suppression
  const handleDelete = async (entryId) => {
    try {
      setDeleteLoading(true);
      
      const response = await fetch(`/api/proxy/rag/data?id=${entryId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Mettre à jour l'état local pour refléter la suppression
      const updatedData = ragData.filter(item => item.id !== entryId);
      setRagData(updatedData);
      setFilteredData(prevData => prevData.filter(item => item.id !== entryId));
      setTotalEntries(prev => prev - 1);
      
      // Mettre à jour le cache
      setRagCache(updatedData);
      
      // Fermer la boîte de dialogue de confirmation
      setDeleteConfirmation({ show: false, entryId: null });
      
      toast({
        title: "Entrée supprimée",
        description: "L'entrée a été supprimée avec succès.",
        variant: "default"
      });
      
      // Synchroniser la base de données RAG
      await fetch(`/api/proxy/rag/sync`, {
        method: 'POST'
      });
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'entrée. " + error.message,
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Calculer la pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedEntries = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

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
        <div className="flex items-center space-x-2">
          {/* Filtre par catégorie */}
          {categories.length > 0 && (
            <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {selectedCategory || "Catégorie"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <div className="max-h-[300px] overflow-auto">
                  <div
                    className="px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    onClick={() => {
                      setSelectedCategory("");
                      setCategoryPopoverOpen(false);
                    }}
                  >
                    Toutes les catégories
                  </div>
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(category);
                        setCategoryPopoverOpen(false);
                      }}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Button onClick={() => router.push("/dashboard/rag-database/edit/new")}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouvelle entrée
          </Button>
        </div>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rechercher</CardTitle>
          {(searchTerm || selectedCategory) && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Résultats ({filteredData.length})</CardTitle>
          <div className="flex items-center gap-4">
            {selectedCategory && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtré par catégorie :</span>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {selectedCategory}
                </span>
              </div>
            )}
            <ItemsPerPageSelector 
              itemsPerPage={itemsPerPage} 
              onItemsPerPageChange={setItemsPerPage} 
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredData.length === 0 ? (
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
                          {entry.categorie && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                              {entry.categorie}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
                          <ReactMarkdown>{entry.description}</ReactMarkdown>
                        </div>
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
                    {/* Si les messages sont dans Messages (majuscule) */}
                    {entry.details?.Messages && entry.details.Messages.length > 0 && !entry.details.messages && (
                      <div className="mt-4">
                        <MessagePreview message={entry.details.Messages[0]} />
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

      <ScrollToTopButton />

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
        isLoading={deleteLoading}
      />
    </div>
  );
}