// Nouveau composant: src/components/settings/BackupManager.jsx
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import MessageSearch from "@/components/messages/MessageSearch";
import Pagination from "@/components/ui/pagination";
// Importation des icônes Radix UI
import { 
  ArchiveIcon, 
  ReloadIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CheckCircledIcon,
  Cross2Icon,
  TrashIcon,
  UpdateIcon
} from "@radix-ui/react-icons";

export default function BackupManager() {
  const [backups, setBackups] = useState([]);
  const [filteredBackups, setFilteredBackups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleItems, setVisibleItems] = useState(0);
  const tableContainerRef = useRef(null);
  const [totalBackups, setTotalBackups] = useState(0);

  const fetchBackups = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/proxy/rag/backup`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur: ${response.status}`);
      }

      const data = await response.json();
      setBackups(data);
      setTotalBackups(data.length);
      setFilteredBackups(data || []);
      toast.success("Sauvegardes récupérées", {
        description: data.message
      });
      setCurrentPage(1);
    } catch (error) {
      console.error("Erreur lors de la récupération des sauvegardes:", error);
      setError("Impossible de récupérer les sauvegardes. " + error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  // Fonction améliorée de filtrage
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBackups(backups);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = backups.filter(backup => {
        // Formatage de la date de la sauvegarde au même format que l'affichage
        const backupDate = formatDate(backup.date).toLowerCase();
        
        return (
          // Recherche dans le nom du fichier
          backup.name.toLowerCase().includes(searchLower) ||
          // Recherche par date formatée (JJ/MM/AAAA HH:mm)
          backupDate.includes(searchLower) ||
          // Recherche par date partielle (JJ/MM/AAAA)
          backupDate.split(" ")[0].includes(searchLower) ||
          // Recherche par heure (HH:mm)
          backupDate.split(" ")[1]?.includes(searchLower)
        );
      });
      
      setFilteredBackups(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, backups]);

  const initiateCreateBackup = () => {
    setShowCreateConfirm(true);
  };

  const handleCreateBackup = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/proxy/rag/backup`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur: ${response.status}`);
      }

      const data = await response.json();
      toast({
        title: "Sauvegarde créée",
        description: `La sauvegarde a été créée avec succès: ${data.filename}`,
      });
      
      fetchBackups();
    } catch (error) {
      console.error("Erreur lors de la création de la sauvegarde:", error);
      setError("Impossible de créer la sauvegarde. " + error.message);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer la sauvegarde. " + error.message,
      });
    } finally {
      setIsCreating(false);
      setShowCreateConfirm(false);
    }
  };

  const initiateRestore = (backup) => {
    setSelectedBackup(backup);
    setShowRestoreConfirm(true);
  };

  const handleRestoreBackup = async () => {
    setIsRestoring(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/proxy/rag/backup/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: selectedBackup.name })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur: ${response.status}`);
      }

      toast({
        title: "Restauration réussie",
        description: `La sauvegarde ${selectedBackup.name} a été restaurée avec succès.`,
      });
    } catch (error) {
      console.error("Erreur lors de la restauration:", error);
      setError("Impossible de restaurer la sauvegarde. " + error.message);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de restaurer la sauvegarde. " + error.message,
      });
    } finally {
      setIsRestoring(false);
      setShowRestoreConfirm(false);
    }
  };

  const initiateDelete = (backup) => {
    setSelectedBackup(backup);
    setShowDeleteConfirm(true);
  };

  const handleDeleteBackup = async () => {
    if (!selectedBackup) return;
    
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    setDeleteError(null);
    
    try {
      const response = await fetch(`/api/proxy/rag/backup?filename=${selectedBackup.name}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur: ${response.status}`);
      }

      toast.success("Suppression réussie", {
        description: "La sauvegarde a été supprimée avec succès"
      });

      fetchBackups();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setDeleteError(error.message);
      toast.error("Erreur", {
        description: `Échec de la suppression: ${error.message}`
      });
    } finally {
      setIsDeleting(false);
      setSelectedBackup(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculer le nombre d'éléments visibles en fonction de la hauteur du conteneur
  const calculateVisibleItems = () => {
    if (!tableContainerRef.current) return;
    
    const rowHeight = 53; // hauteur d'une ligne en pixels
    const containerHeight = tableContainerRef.current.clientHeight;
    const visibleRows = Math.floor(containerHeight / rowHeight);
    setVisibleItems(Math.max(5, visibleRows)); // Au moins 5 éléments visibles
  };

  // Observer les changements de taille
  useEffect(() => {
    const resizeObserver = new ResizeObserver(calculateVisibleItems);
    
    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Calcul de la pagination
  const totalPages = Math.max(1, Math.ceil(filteredBackups.length / (visibleItems || 5)));
  const paginatedBackups = filteredBackups.slice(
    (currentPage - 1) * (visibleItems || 5),
    currentPage * (visibleItems || 5)
  );

  // Reset la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDownloadBackup = async (backup) => {
    try {
      // Utiliser le proxy pour télécharger la sauvegarde
      window.location.href = `/api/proxy/rag/backup?filename=${backup.name}`;
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger la sauvegarde.",
      });
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestion des sauvegardes</CardTitle>
            <CardDescription>
              Créez et restaurez des sauvegardes de vos données RAG
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            {totalBackups} sauvegarde{totalBackups !== 1 ? 's' : ''}
            {filteredBackups.length !== totalBackups && ` (${filteredBackups.length} filtré${filteredBackups.length !== 1 ? 's' : ''})`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        <div className="flex justify-between items-center gap-2">
          <Button 
            onClick={initiateCreateBackup} 
            className="flex items-center"
          >
            <ArchiveIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Créer une sauvegarde</span>
            <span className="sm:hidden">Créer</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-full max-w-[300px] lg:max-w-[400px] hidden sm:block">
              <MessageSearch 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm}
                placeholder="Rechercher par date (JJ/MM/AAAA) ou heure (HH:mm)..."
              />
            </div>
            <div className="sm:hidden w-full max-w-[150px]">
              <MessageSearch 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm}
                placeholder="Rechercher..."
              />
            </div>
            <Button 
              variant="outline" 
              onClick={fetchBackups} 
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <ReloadIcon className="h-4 w-4 animate-spin" />
              ) : (
                <ReloadIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {createError && (
          <div className="text-sm text-red-600 flex items-start p-3 bg-red-50 rounded-md">
            <ExclamationTriangleIcon className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>Erreur: {createError}</span>
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-600 flex items-start p-3 bg-red-50 rounded-md">
            <ExclamationTriangleIcon className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>Erreur: {error}</span>
          </div>
        )}
        
        {restoreSuccess && (
          <div className="text-sm text-green-600 flex items-start bg-green-50 p-3 rounded-md">
            <CheckCircledIcon className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>La sauvegarde a été restaurée avec succès.</span>
          </div>
        )}
        
        {deleteError && (
          <div className="text-sm text-red-600 flex items-start p-3 bg-red-50 rounded-md">
            <ExclamationTriangleIcon className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>Erreur de suppression: {deleteError}</span>
          </div>
        )}
        
        <div 
          className="border rounded-md flex-grow overflow-hidden"
          ref={tableContainerRef}
        >
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(visibleItems || 5).fill(0).map((_, index) => (
                    <TableRow key={index} className="h-[53px]">
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredBackups.length === 0 ? (
                  <TableRow className="h-[53px]">
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ArchiveIcon className="h-8 w-8" />
                        <p>
                          {searchTerm ? "Aucun résultat pour cette recherche" : "Aucune sauvegarde disponible"}
                        </p>
                        {!searchTerm && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={initiateCreateBackup}
                          >
                            Créer votre première sauvegarde
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBackups.map((backup) => (
                    <TableRow key={backup.name} className="group h-[53px]">
                      <TableCell className="flex items-center whitespace-nowrap min-w-[120px]">
                        <ClockIcon className="mr-1 sm:mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                        {formatDate(backup.date)}
                      </TableCell>
                      <TableCell className="text-right pl-1 sm:pl-4">
                        <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            onClick={() => initiateRestore(backup)}
                            className="h-8 sm:h-9"
                            size="sm"
                          >
                            <UpdateIcon className="h-3.5 w-3.5 mr-2" />
                            Restaurer
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={() => initiateDelete(backup)}
                            className="h-8 sm:h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                            size="sm"
                          >
                            <TrashIcon className="h-3.5 w-3.5 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        
        {filteredBackups.length > (visibleItems || 5) && (
          <div className="mt-4">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </CardContent>
      
      <ConfirmationDialog
        isOpen={showCreateConfirm}
        onClose={() => setShowCreateConfirm(false)}
        onConfirm={handleCreateBackup}
        title="Confirmer la création"
        message={
          <div className="space-y-2">
            <span className="block">Êtes-vous sûr de vouloir créer une nouvelle sauvegarde ?</span>
            <span className="block text-blue-600 flex items-center">
              <ArchiveIcon className="mr-2 h-4 w-4" />
              Une nouvelle sauvegarde de vos données sera créée.
            </span>
          </div>
        }
        confirmLabel={
          <>
            <ArchiveIcon className="mr-2 h-4 w-4" />
            Créer
          </>
        }
        isLoading={isCreating}
      />
      
      <ConfirmationDialog
        isOpen={showRestoreConfirm}
        onClose={() => {
          setShowRestoreConfirm(false);
          setSelectedBackup(null);
        }}
        onConfirm={handleRestoreBackup}
        title="Confirmer la restauration"
        message={
          <div className="space-y-2">
            <span className="block">Êtes-vous sûr de vouloir restaurer la sauvegarde :</span>
            <div className="font-medium bg-muted p-2 rounded-md">
              {selectedBackup?.name}
            </div>
            <div className="text-amber-600 flex items-center">
              <ExclamationTriangleIcon className="mr-2 h-4 w-4" />
              Cette action remplacera toutes les données actuelles.
            </div>
          </div>
        }
        confirmLabel={
          <>
            <UpdateIcon className="mr-2 h-4 w-4" />
            Restaurer
          </>
        }
        isLoading={isRestoring}
      />
      
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedBackup(null);
        }}
        onConfirm={handleDeleteBackup}
        title="Confirmer la suppression"
        message={
          <div className="space-y-2">
            <span className="block">Êtes-vous sûr de vouloir supprimer définitivement la sauvegarde :</span>
            <div className="font-medium bg-muted p-2 rounded-md">
              {selectedBackup?.name}
            </div>
            <div className="text-red-600 flex items-center">
              <ExclamationTriangleIcon className="mr-2 h-4 w-4" />
              Cette action est irréversible.
            </div>
          </div>
        }
        confirmLabel={
          <>
            <TrashIcon className="mr-2 h-4 w-4" />
            Supprimer
          </>
        }
        variant="destructive"
        isLoading={isDeleting}
      />
    </Card>
  );
}