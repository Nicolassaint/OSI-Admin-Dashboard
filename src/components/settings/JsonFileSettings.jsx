import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload, Download, Share2 } from "lucide-react";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import path from 'path';

export default function JsonFileSettings() {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState(null);
  const [transferSuccess, setTransferSuccess] = useState(false);
  
  // États pour les dialogues de confirmation
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

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
      const response = await fetch('/api/rag-database', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: fileContent
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur: ${response.status}`);
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
      const response = await fetch('/api/rag-database', {
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
      
      // Créer un fichier à télécharger
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
      
      a.download = `search_${timestamp}.json`;
      
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
    } catch (error) {
      console.error("Erreur lors de l'exportation des données:", error);
      setExportError(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const initiateTransfer = () => {
    setShowTransferConfirm(true);
  };

  const handleTransferData = async () => {
    setIsTransferring(true);
    setTransferError(null);
    setTransferSuccess(false);
    setShowTransferConfirm(false);
  
    try {
      // 1. Récupérer les données actuelles
      const getResponse = await fetch('/api/rag-database', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
        }
      });
  
      if (!getResponse.ok) {
        const errorData = await getResponse.json();
        throw new Error(errorData.error || `Erreur: ${getResponse.status}`);
      }
  
      const data = await getResponse.json();
      
      // 2. Créer une sauvegarde locale avant transfert
      const backupResponse = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
        }
      });
  
      if (!backupResponse.ok) {
        console.warn("Échec de la sauvegarde locale avant transfert");
      }
      
      // 3. Envoyer à l'API Python
      const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL + '/rag/sync';
      const transferResponse = await fetch(pythonApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PYTHON_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      if (!transferResponse.ok) {
        const errorData = await transferResponse.json();
        throw new Error(errorData.error || `Erreur API Python: ${transferResponse.status}`);
      }
  
      setTransferSuccess(true);
      setTimeout(() => setTransferSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors du transfert des données:", error);
      setTransferError(error.message);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion du RAG</CardTitle>
        <CardDescription>
          Importer, exporter ou transférer des données JSON
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
          <h3 className="text-lg font-medium">Exportation et transfert</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Button 
              variant="outline" 
              onClick={handleExportData}
              disabled={isExporting}
              className="flex items-center justify-center"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exportation..." : "Exporter les données"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={initiateTransfer}
              disabled={isTransferring}
              className="flex items-center justify-center"
            >
              <Share2 className="mr-2 h-4 w-4" />
              {isTransferring ? "Transfert..." : "Transférer les données"}
            </Button>
          </div>
          
          {exportError && (
            <div className="text-sm text-red-600 flex items-start">
              <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Erreur lors de l'exportation: {exportError}</span>
            </div>
          )}
          
          {transferSuccess && (
            <p className="text-sm text-green-600">Données transférées avec succès.</p>
          )}
          
          {transferError && (
            <div className="text-sm text-red-600 flex items-start">
              <AlertCircle className="mr-1 h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Erreur lors du transfert: {transferError}</span>
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

      {/* Dialogue de confirmation pour le transfert */}
      <ConfirmationDialog
        isOpen={showTransferConfirm}
        onClose={() => setShowTransferConfirm(false)}
        onConfirm={handleTransferData}
        title="Confirmer le transfert"
        message="Êtes-vous sûr de vouloir transférer les données ? Cette action pourrait affecter les données existantes sur le serveur distant."
        confirmLabel="Transférer"
        isLoading={isTransferring}
      />
    </Card>
  );
} 