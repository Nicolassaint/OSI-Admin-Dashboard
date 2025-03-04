import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrashIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MessageCard({ 
  message, 
  onMarkAsResolved, 
  onDelete, 
  formatDate 
}) {
  // État pour gérer l'ouverture de la boîte de dialogue de confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // État pour gérer le chargement pendant la suppression
  const [isDeleting, setIsDeleting] = useState(false);
  // États pour le popup des métriques RAG
  const [showRagMetrics, setShowRagMetrics] = useState(false);
  const [ragMetrics, setRagMetrics] = useState(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState(null);

  // Fonction pour gérer la confirmation de suppression
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      
      // Appel à l'API pour supprimer la conversation
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
      
      const response = await fetch(`${apiUrl}/api/conversation/${message.id}?token=${apiToken}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Si la suppression a réussi, appeler la fonction onDelete
      onDelete(message.id);
    } catch (error) {
      console.error("Erreur lors de la suppression de la conversation:", error);
      // Vous pourriez ajouter ici une notification d'erreur
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Fonction pour charger et afficher les métriques RAG
  const handleShowRagMetrics = async () => {
    // Si les métriques sont déjà dans le message, les utiliser directement
    if (message.rag_metrics) {
      setRagMetrics(message.rag_metrics);
      setShowRagMetrics(true);
      return;
    }

    // Sinon, faire une requête API pour les récupérer
    setIsLoadingMetrics(true);
    setMetricsError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
      
      const response = await fetch(`${apiUrl}/api/conversation/${message.id}?token=${apiToken}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.rag_metrics) {
        setRagMetrics(data.rag_metrics);
      } else {
        setMetricsError("Aucune métrique RAG disponible pour cette conversation.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des métriques RAG:", error);
      setMetricsError("Impossible de récupérer les métriques RAG. Veuillez réessayer plus tard.");
    } finally {
      setIsLoadingMetrics(false);
      setShowRagMetrics(true);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{message.user}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(message.timestamp)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShowRagMetrics}
            title="Voir les métriques RAG"
          >
            <InfoCircledIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div>
        <p className="font-medium text-sm">Question:</p>
        <p className="text-sm">{message.message}</p>
      </div>
      
      <div>
        <p className="font-medium text-sm">Réponse:</p>
        <p className="text-sm">
          {message.response || "Pas encore de réponse"}
        </p>
      </div>
      
      {/* Afficher les médias si présents */}
      {message.image && (
        <div>
          <p className="font-medium text-sm">Image:</p>
          <img 
            src={message.image} 
            alt="Image jointe" 
            className="max-w-full h-auto rounded mt-1"
            style={{ maxHeight: '200px' }}
          />
        </div>
      )}
      
      {message.video && (
        <div>
          <p className="font-medium text-sm">Vidéo:</p>
          <video 
            controls 
            className="max-w-full h-auto rounded mt-1"
            style={{ maxHeight: '200px' }}
          >
            <source src={message.video} />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>
      )}
      
      {message.buttons && message.buttons.length > 0 && (
        <div>
          <p className="font-medium text-sm">Actions suggérées:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {message.buttons.map((btn, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                size="sm"
                className="pointer-events-none hover:bg-background hover:text-foreground"
              >
                {typeof btn === 'object' ? (btn.text || btn.Label || JSON.stringify(btn)) : btn}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              message.status === "resolved"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
            }`}
          >
            {message.status === "resolved" ? "Résolu" : "En attente"}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              message.evaluation === 1
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : message.evaluation === 0
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
            }`}
          >
            {message.evaluation === 1
              ? "Avis positif"
              : message.evaluation === 0
              ? "Avis négatif"
              : "Pas d'avis"}
          </span>
        </div>
        {message.status !== "resolved" && (
          <Button size="sm" onClick={() => onMarkAsResolved(message.id)}>
            Marquer comme résolu
          </Button>
        )}
      </div>
      
      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la conversation"
        message="Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="destructive"
        isLoading={isDeleting}
      />

      {/* Popup pour afficher les métriques RAG */}
      <Dialog open={showRagMetrics} onOpenChange={setShowRagMetrics}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Métriques RAG</DialogTitle>
          </DialogHeader>
          
          {isLoadingMetrics ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : metricsError ? (
            <div className="text-center py-4 text-red-500">
              {metricsError}
            </div>
          ) : ragMetrics ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Sources utilisées pour la réponse:</h3>
                {ragMetrics.top_results && ragMetrics.top_results.length > 0 ? (
                  <div className="space-y-2">
                    {ragMetrics.top_results.map((result, index) => (
                      <div key={index} className="border rounded p-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{result.label}</span>
                          <span className="text-sm text-muted-foreground">
                            Score: {(result.score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${result.score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune source disponible</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="border rounded p-2">
                  <p className="text-sm font-medium">Temps de traitement total</p>
                  <p className="text-lg">{ragMetrics.processing_time?.toFixed(2) || "N/A"} s</p>
                </div>
                <div className="border rounded p-2">
                  <p className="text-sm font-medium">Temps de traitement LLM</p>
                  <p className="text-lg">{ragMetrics.llm_processing_time?.toFixed(2) || "N/A"} s</p>
                </div>
              </div>
              
              {ragMetrics.default_chunk_used !== undefined && (
                <div className="border rounded p-2">
                  <p className="text-sm font-medium">Chunk par défaut utilisé</p>
                  <p>{ragMetrics.default_chunk_used ? "Oui" : "Non"}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Aucune métrique RAG disponible pour cette conversation.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 