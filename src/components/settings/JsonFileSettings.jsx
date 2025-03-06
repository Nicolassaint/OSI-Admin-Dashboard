import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload, Download, Share2, Trash2 } from "lucide-react";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function JsonFileSettings() {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
  // États pour les dialogues de confirmation
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // États pour le message de succès
  const [exportSuccess, setExportSuccess] = useState(false);

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
      try {
        JSON.parse(fileContent);
      } catch (e) {
        throw new Error("Le fichier n'est pas un JSON valide");
      }

      // Envoyer le contenu JSON au serveur
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rag/data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: fileContent
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail);
      }

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors de l'importation du fichier:", error);
      setUploadError(error.message);
    } finally {
      setSelectedFile(null);
      setIsImporting(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rag/data`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail);
      }

      // Récupérer les données JSON et extraire uniquement la partie 'data'
      const responseData = await response.json();
      const data = responseData.data;
      
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

      // Afficher le message de succès
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);

    } catch (error) {
      console.error("Erreur lors de l'exportation des données:", error);
      setExportError(error.message);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rag/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail);
      }

      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression des données:", error);
      setDeleteError(error.message);
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
            <p className="text-sm text-green-600">Fichier importé avec succès.</p>
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