// Nouveau composant: src/components/settings/BackupManager.jsx
import { useState, useEffect } from "react";
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
  const itemsPerPage = 10;

  const fetchBackups = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/backup', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur: ${response.status}`);
      }

      const data = await response.json();
      setBackups(data.backups);
      setCurrentPage(1); // Réinitialiser à la première page après chargement
    } catch (error) {
      console.error("Erreur lors de la récupération des sauvegardes:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  // Filtrer les sauvegardes en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBackups(backups);
    } else {
      const filtered = backups.filter(backup => 
        backup.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBackups(filtered);
      setCurrentPage(1); // Réinitialiser à la première page après filtrage
    }
  }, [searchTerm, backups]);

  const initiateCreateBackup = () => {
    setShowCreateConfirm(true);
  };

  const handleCreateBackup = async () => {
    setIsCreating(true);
    setCreateError(null);
    setShowCreateConfirm(false);
    
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur: ${response.status}`);
      }

      // Afficher un toast de succès
      toast.success("Sauvegarde créée", {
        description: "La sauvegarde a été créée avec succès"
      });

      // Rafraîchir la liste des sauvegardes
      fetchBackups();
    } catch (error) {
      console.error("Erreur lors de la création de la sauvegarde:", error);
      setCreateError(error.message);
      
      // Afficher un toast d'erreur
      toast.error("Erreur", {
        description: `Échec de la création: ${error.message}`
      });
    } finally {
      setIsCreating(false);
    }
  };

  const initiateRestore = (backup) => {
    setSelectedBackup(backup);
    setShowRestoreConfirm(true);
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    
    setIsRestoring(true);
    setShowRestoreConfirm(false);
    setRestoreSuccess(false);
    
    try {
      const response = await fetch(`/api/backup/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ backupFile: selectedBackup.name })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur: ${response.status}`);
      }

      // Afficher le message de succès
      setRestoreSuccess(true);
      
      // Afficher un toast de succès
      toast.success("Restauration réussie", {
        description: "La sauvegarde a été restaurée avec succès"
      });
      
      // Masquer le message après 5 secondes
      setTimeout(() => {
        setRestoreSuccess(false);
      }, 5000);

      // Rafraîchir la liste
      fetchBackups();
    } catch (error) {
      console.error("Erreur lors de la restauration:", error);
      setError(error.message);
      
      // Afficher un toast d'erreur
      toast.error("Erreur", {
        description: `Échec de la restauration: ${error.message}`
      });
    } finally {
      setIsRestoring(false);
      setSelectedBackup(null);
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
      const response = await fetch(`/api/backup?filename=${selectedBackup.name}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur: ${response.status}`);
      }

      // Afficher un toast de succès
      toast.success("Suppression réussie", {
        description: "La sauvegarde a été supprimée avec succès"
      });

      // Rafraîchir la liste
      fetchBackups();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setDeleteError(error.message);
      
      // Afficher un toast d'erreur
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
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Pagination
  const totalPages = Math.ceil(filteredBackups.length / itemsPerPage);
  const paginatedBackups = filteredBackups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            {backups.length} sauvegarde{backups.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        <div className="flex justify-between items-center gap-2">
          <Button 
            onClick={initiateCreateBackup} 
            className="flex items-center"
          >
            <ArchiveIcon className="mr-2 h-4 w-4" />
            Créer une sauvegarde
          </Button>
          
          <div className="flex items-center gap-2">
            <MessageSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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
        
        <div className="border rounded-md flex-grow">
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedBackups.length === 0 ? (
                  <TableRow>
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
                    <TableRow key={backup.name} className="group">
                      <TableCell className="font-medium max-w-[200px] truncate" title={backup.name}>
                        {backup.name}
                      </TableCell>
                      <TableCell className="flex items-center">
                        <ClockIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatDate(backup.date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => initiateRestore(backup)}
                            className="flex items-center"
                          >
                            <UpdateIcon className="mr-1.5 h-3.5 w-3.5" />
                            Restaurer
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => initiateDelete(backup)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center"
                          >
                            <TrashIcon className="mr-1.5 h-3.5 w-3.5" />
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
        
        {filteredBackups.length > itemsPerPage && (
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        )}
      </CardContent>
      
      <ConfirmationDialog
        isOpen={showCreateConfirm}
        onClose={() => setShowCreateConfirm(false)}
        onConfirm={handleCreateBackup}
        title="Confirmer la création"
        message={
          <div className="space-y-2">
            <p>Êtes-vous sûr de vouloir créer une nouvelle sauvegarde ?</p>
            <p className="text-blue-600 flex items-center">
              <ArchiveIcon className="mr-2 h-4 w-4" />
              Une nouvelle sauvegarde de vos données sera créée.
            </p>
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
            <p>Êtes-vous sûr de vouloir restaurer la sauvegarde :</p>
            <div className="font-medium bg-muted p-2 rounded-md">
              {selectedBackup?.name}
            </div>
            <p className="text-amber-600 flex items-center">
              <ExclamationTriangleIcon className="mr-2 h-4 w-4" />
              Cette action remplacera toutes les données actuelles.
            </p>
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
            <p>Êtes-vous sûr de vouloir supprimer définitivement la sauvegarde :</p>
            <div className="font-medium bg-muted p-2 rounded-md">
              {selectedBackup?.name}
            </div>
            <p className="text-red-600 flex items-center">
              <ExclamationTriangleIcon className="mr-2 h-4 w-4" />
              Cette action est irréversible.
            </p>
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