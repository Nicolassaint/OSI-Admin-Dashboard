import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload, Download, Share2, Trash2 } from "lucide-react";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { invalidateRagCache } from "@/lib/cache";

export default function JsonFileSettings() {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
  // États pour les dialogues
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // États pour le message de succès
  const [exportSuccess, setExportSuccess] = useState(false);

  // Effet pour gérer la disparition automatique des messages
  useEffect(() => {
    const timeouts = [];

    if (uploadSuccess) {
      timeouts.push(setTimeout(() => setUploadSuccess(false), 5000));
    }
    if (exportSuccess) {
      timeouts.push(setTimeout(() => setExportSuccess(false), 5000));
    }
    if (deleteSuccess) {
      timeouts.push(setTimeout(() => setDeleteSuccess(false), 5000));
    }
    if (uploadError) {
      timeouts.push(setTimeout(() => setUploadError(null), 5000));
    }
    if (exportError) {
      timeouts.push(setTimeout(() => setExportError(null), 5000));
    }
    if (deleteError) {
      timeouts.push(setTimeout(() => setDeleteError(null), 5000));
    }

    return () => timeouts.forEach(clearTimeout);
  }, [uploadSuccess, exportSuccess, deleteSuccess, uploadError, exportError, deleteError]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    setShowImportConfirm(true);
    
    // Réinitialiser l'input file pour permettre la sélection du même fichier
    event.target.value = null;
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploadError(null);
    setUploadSuccess(false);
    setShowImportConfirm(false);
    setIsImporting(true);

    try {
      // Lire le contenu du fichier
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(selectedFile);
      });

      // Vérifier que le contenu est un JSON valide
      let jsonData;
      try {
        jsonData = JSON.parse(fileContent);
      } catch (e) {
        throw new Error("Le fichier n'est pas un JSON valide");
      }

      // Formater les données selon le format attendu par le backend
      let formattedData;
      if (Array.isArray(jsonData)) {
        // Si c'est un tableau, le convertir en objet avec les noms comme clés
        formattedData = {};
        for (const entry of jsonData) {
          if (!entry.name) {
            throw new Error("Chaque entrée doit avoir un champ 'name'");
          }
          formattedData[entry.name] = {
            name: entry.name,
            description: entry.description || "",
            search: entry.search || "",
            details: {
              Label: entry.details?.Label || "",
              Messages: entry.details?.Messages?.map(msg => ({
                Label: msg.Label || "",
                Description: msg.Description || "",
                Bubbles: (msg.Bubbles || []).map(bubble => ({
                  Text: bubble.Text || "",
                  Image: bubble.Image || "",
                  Video: bubble.Video || "",
                  Order: bubble.Order || 0
                })),
                Buttons: (msg.Buttons || []).map(button => ({
                  Label: button.Label || "",
                  Link: button.Link || "",
                  Type: button.Type || "primary",
                  Order: button.Order || 0
                }))
              })) || []
            }
          };
        }
      } else if (typeof jsonData === 'object' && jsonData !== null) {
        // Si c'est déjà un objet, vérifier son format
        formattedData = {};
        for (const [key, value] of Object.entries(jsonData)) {
          if (typeof value === 'object' && value !== null) {
            formattedData[key] = {
              name: value.name || key,
              description: value.description || "",
              search: value.search || "",
              details: {
                Label: value.details?.Label || "",
                Messages: value.details?.Messages?.map(msg => ({
                  Label: msg.Label || "",
                  Description: msg.Description || "",
                  Bubbles: (msg.Bubbles || []).map(bubble => ({
                    Text: bubble.Text || "",
                    Image: bubble.Image || "",
                    Video: bubble.Video || "",
                    Order: bubble.Order || 0
                  })),
                  Buttons: (msg.Buttons || []).map(button => ({
                    Label: button.Label || "",
                    Link: button.Link || "",
                    Type: button.Type || "primary",
                    Order: button.Order || 0
                  }))
                })) || []
              }
            };
          }
        }
      } else {
        throw new Error("Le fichier JSON doit contenir un tableau ou un objet");
      }

      // Envoyer le contenu JSON au serveur
      const response = await fetch(`/api/proxy/rag/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Réponse de l'API:", result);

      // Invalider le cache RAG
      await invalidateRagCache();

      try {
        // Synchroniser la base de données RAG
        const syncResponse = await fetch(`/api/proxy/rag/sync`, {
          method: 'POST'
        });
        
        if (!syncResponse.ok) {
          console.error("Erreur de synchronisation:", await syncResponse.text());
          toast.warning("Import réussi mais erreur lors de la synchronisation");
        }
      } catch (syncError) {
        console.error("Erreur lors de la synchronisation:", syncError);
        toast.warning("Import réussi mais erreur lors de la synchronisation");
      }

      // Utiliser setTimeout pour s'assurer que l'état est mis à jour après les autres opérations
      setTimeout(() => {
        setUploadSuccess(true);
        toast.success("Importation réussie");
      }, 0);

    } catch (error) {
      console.error("Erreur lors de l'importation du fichier:", error);
      setUploadError(error.message);
      toast.error(`Erreur lors de l'importation: ${error.message}`);
    } finally {
      setSelectedFile(null);
      setIsImporting(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const response = await fetch(`/api/proxy/rag/data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Créer un fichier à télécharger avec les données
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Générer un nom de fichier avec la date actuelle
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0];
      const a = document.createElement('a');
      a.href = url;
      a.download = `rag_data_${timestamp}.json`;
      
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);

      setExportSuccess(true);
      toast.success("Données exportées avec succès");

    } catch (error) {
      console.error("Erreur lors de l'exportation des données:", error);
      setExportError(error.message);
      toast.error("Erreur lors de l'exportation: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const initiateDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteData = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(false);
    setShowDeleteConfirm(false);

    try {
      const response = await fetch(`/api/proxy/rag/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Invalider le cache global
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('ragDataCacheInvalidated', 'true');
      }

      // Synchroniser la base de données RAG
      await fetch(`/api/proxy/rag/sync`, {
        method: 'POST'
      });

      setDeleteSuccess(true);
      toast.success("Données supprimées avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression des données:", error);
      setDeleteError(error.message);
      toast.error("Erreur lors de la suppression: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion du RAG</CardTitle>
        <CardDescription>
          Importer, exporter ou supprimer des données JSON
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Importation de données</h3>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Cliquez pour importer</span> ou glissez-déposez
                </p>
                <p className="text-xs text-muted-foreground">JSON uniquement</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".json" 
                onChange={handleFileSelect}
              />
            </label>
          </div>
          
          {uploadSuccess && (
            <p className="text-sm text-green-600 flex items-start">
              <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Importation réussie</span>
            </p>
          )}
          
          {uploadError && (
            <div className="text-sm text-red-600 flex items-start">
              <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Erreur: {uploadError}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Exportation et suppression</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Button 
              variant="outline" 
              onClick={handleExportData}
              disabled={isExporting}
              className="flex items-center justify-center"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {isExporting ? "Exportation..." : "Exporter les données"}
              </span>
              <span className="sm:hidden">
                {isExporting ? "..." : "Export"}
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={initiateDelete}
              disabled={isDeleting}
              className="flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {isDeleting ? "Suppression..." : "Supprimer les données"}
              </span>
              <span className="sm:hidden">
                {isDeleting ? "..." : "Suppr."}
              </span>
            </Button>
          </div>
          
          {exportSuccess && (
            <p className="text-sm text-green-600 flex items-start">
              <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Les données ont été exportées avec succès.</span>
            </p>
          )}
          
          {exportError && (
            <div className="text-sm text-red-600 flex items-start">
              <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Erreur lors de l'exportation: {exportError}</span>
            </div>
          )}
          
          {deleteSuccess && (
            <p className="text-sm text-green-600 flex items-start">
              <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Les données ont été supprimées avec succès.</span>
            </p>
          )}
          
          {deleteError && (
            <div className="text-sm text-red-600 flex items-start">
              <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Erreur lors de la suppression: {deleteError}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialogue de confirmation pour l'importation */}
      <ConfirmationDialog
        isOpen={showImportConfirm}
        onClose={() => {
          setShowImportConfirm(false);
          setSelectedFile(null);
        }}
        onConfirm={handleFileUpload}
        title="Confirmer l'importation"
        message={`Êtes-vous sûr de vouloir importer le fichier "${selectedFile?.name}" ? Cette action pourrait remplacer des données existantes.`}
        confirmLabel="Importer"
        isLoading={isImporting}
      />

      {/* Dialogue de confirmation pour la suppression */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteData}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible, mais une sauvegarde sera créée automatiquement."
        confirmLabel="Supprimer"
        isLoading={isDeleting}
      />
    </Card>
  );
} 