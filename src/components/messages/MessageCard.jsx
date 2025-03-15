import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrashIcon, InfoCircledIcon, ArchiveIcon } from "@radix-ui/react-icons";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import RagMetricsDialog from "@/components/messages/RagMetricsDialog";

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
      
      // Appel au proxy pour supprimer la conversation
      const response = await fetch(`/api/proxy/conversations?id=${message.id}`, {
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
      // Utiliser le bon endpoint pour récupérer une conversation spécifique
      const response = await fetch(`/api/proxy/conversations/${message.id}`);
      
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

  // Fonction pour archiver un message
  const handleArchive = async () => {
    try {
      // Utiliser le proxy pour mettre à jour le statut
      const response = await fetch(`/api/proxy/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'status',
          conversationId: message.id,
          status: 'archive'
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // La mise à jour se fera via WebSocket
    } catch (error) {
      console.error("Erreur lors de l'archivage:", error);
      // Vous pourriez ajouter ici une notification d'erreur
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
            onClick={handleArchive}
            title="Archiver la conversation"
          >
            <ArchiveIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            title="Supprimer la conversation"
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
              message.status === "resolu"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : message.status === "archive"
                ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
            }`}
          >
            {message.status === "resolu" 
              ? "Résolu" 
              : message.status === "archive"
              ? "Archivé"
              : "En attente"}
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
        {message.status === "archive" || message.status === "resolu" ? (
          <Button size="sm" onClick={() => onMarkAsResolved(message.id, "en_attente")}>
            Remettre en attente
          </Button>
        ) : (
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
      <RagMetricsDialog
        isOpen={showRagMetrics}
        onOpenChange={setShowRagMetrics}
        isLoading={isLoadingMetrics}
        error={metricsError}
        metrics={ragMetrics}
      />
    </div>
  );
} 