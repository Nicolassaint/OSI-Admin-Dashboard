import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, Trash2, Upload, X } from "lucide-react";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

// Nouveau composant pour afficher les erreurs détaillées
function ErrorDialog({ isOpen, onClose, title, errorMessage }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              {title}
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm mt-2 whitespace-pre-wrap">{errorMessage}</div>
      </DialogContent>
    </Dialog>
  );
}

export default function ConversationsSettings() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Nouveaux états pour l'importation
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // État pour le dialogue d'erreur
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDialogContent, setErrorDialogContent] = useState({ title: "", message: "" });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  const initiateDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteAllConversations = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(false);
    setShowDeleteConfirm(false);

    try {
      const response = await fetch(`${apiUrl}/api/conversations`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur: ${response.status}`);
      }

      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression des conversations:", error);
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportConversations = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const response = await fetch(`${apiUrl}/api/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
        }
      });

      // Vérifier le type de contenu de la réponse
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Réponse inattendue du serveur (${contentType}). Veuillez réessayer.`);
      }

      if (!response.ok) {
        // Essayer de récupérer un message d'erreur JSON si possible
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur: ${response.status}`);
        } catch (jsonError) {
          // Si on ne peut pas parser le JSON, utiliser le statut HTTP
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      }

      // Récupérer les données telles quelles
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Erreur lors du parsing JSON:", jsonError);
        throw new Error("Le serveur a renvoyé des données invalides. Veuillez contacter l'administrateur.");
      }
      
      // Créer un fichier à télécharger avec les données exactes de l'API
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Générer un nom de fichier avec la date et l'heure actuelles jusqu'à la seconde
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
      
      a.download = `conversations_${timestamp}.json`;
      
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
    } catch (error) {
      console.error("Erreur lors de l'exportation des conversations:", error);
      setExportError(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Fonction pour gérer la sélection de fichier
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    setShowImportConfirm(true);
    
    // Réinitialiser l'input file pour permettre la sélection du même fichier
    event.target.value = null;
  };
  
  // Fonction pour afficher une erreur détaillée
  const showDetailedError = (title, message) => {
    setErrorDialogContent({ title, message });
    setShowErrorDialog(true);
  };

  // Fonction pour gérer l'importation de fichier
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploadError(null);
    setUploadSuccess(false);
    setShowImportConfirm(false);
    setIsImporting(true);

    try {
      // Lire le contenu du fichier
      const fileContent = await selectedFile.text();
      
      // Vérifier que le contenu est un JSON valide
      let jsonData;
      try {
        jsonData = JSON.parse(fileContent);
      } catch (error) {
        throw new Error("Le fichier sélectionné ne contient pas de JSON valide.");
      }

      // Vérifier que les données sont une liste (array)
      if (!Array.isArray(jsonData)) {
        throw new Error("Le fichier doit contenir une liste de conversations au format JSON.");
      }

      // Envoyer le JSON directement à l'API
      const response = await fetch(`${apiUrl}/api/import_conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
        },
        body: JSON.stringify(jsonData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || errorData.error || `Erreur: ${response.status}`;
        
        // Afficher un message court dans l'interface
        setUploadError("Erreur lors de l'importation. Cliquez pour plus de détails.");
        
        // Stocker le message complet pour le dialogue
        showDetailedError("Erreur d'importation", errorMessage);
        throw new Error(errorMessage); // Pour le log console
      }

      const result = await response.json();
      setUploadSuccess(true);
      // console.log(`Importation réussie: ${result.imported_count} conversations importées`);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors de l'importation des conversations:", error);
      if (!uploadError) {
        // Si l'erreur n'a pas déjà été définie (pour les erreurs HTTP)
        setUploadError("Erreur: " + error.message);
      }
    } finally {
      setSelectedFile(null);
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des conversations</CardTitle>
        <CardDescription>
          Importer, exporter ou supprimer toutes les conversations du chatbot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section d'importation */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Importation de conversations</h3>
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
            <p className="text-sm text-green-600">Conversations importées avec succès.</p>
          )}
          
          {uploadError && (
            <div 
              className="text-sm text-red-600 flex items-start cursor-pointer hover:underline"
              onClick={() => setShowErrorDialog(true)}
            >
              <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
        
        {/* Section d'exportation et suppression */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Exportation et suppression</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Button 
              variant="outline"
              onClick={handleExportConversations}
              disabled={isExporting}
              className="flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">
                {isExporting ? "Exportation..." : "Exporter les conversations"}
              </span>
              <span className="sm:hidden">
                {isExporting ? "..." : "Exporter"}
              </span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={initiateDelete}
              disabled={isDeleting}
              className="flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">
                {isDeleting ? "Suppression..." : "Supprimer les conversations"}
              </span>
              <span className="sm:hidden">
                {isDeleting ? "..." : "Supprimer"}
              </span>
            </Button>
          </div>
          
          {deleteSuccess && (
            <p className="text-sm text-green-600">Toutes les conversations ont été supprimées avec succès.</p>
          )}
          
          {deleteError && (
            <div className="text-sm text-red-600 flex items-start">
              <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Erreur lors de la suppression: {deleteError}</span>
            </div>
          )}
          
          {exportError && (
            <div className="text-sm text-red-600 flex items-start">
              <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Erreur lors de l'exportation: {exportError}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialogue de confirmation pour la suppression */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAllConversations}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer toutes les conversations ? Cette action est irréversible et supprimera définitivement toutes les données de conversation."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="destructive"
        isLoading={isDeleting}
      />
      
      {/* Dialogue de confirmation pour l'importation */}
      <ConfirmationDialog
        isOpen={showImportConfirm}
        onClose={() => {
          setShowImportConfirm(false);
          setSelectedFile(null);
        }}
        onConfirm={handleFileUpload}
        title="Confirmer l'importation"
        message={`Êtes-vous sûr de vouloir importer le fichier "${selectedFile?.name}" ? Cette action pourrait ajouter ou remplacer des conversations existantes.`}
        confirmLabel="Importer"
        cancelLabel="Annuler"
        isLoading={isImporting}
      />
      
      {/* Dialogue d'erreur détaillée */}
      <ErrorDialog 
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title={errorDialogContent.title}
        errorMessage={errorDialogContent.message}
      />
    </Card>
  );
} 