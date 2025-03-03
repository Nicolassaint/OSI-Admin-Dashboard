import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrashIcon, ArchiveIcon } from "@radix-ui/react-icons";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";

export default function MessageCard({ 
  message, 
  onMarkAsResolved, 
  onDelete, 
  onArchive,
  formatDate 
}) {
  // État pour gérer l'ouverture de la boîte de dialogue de confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // État pour gérer le chargement pendant la suppression
  const [isDeleting, setIsDeleting] = useState(false);

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
            onClick={() => onArchive(message.id)}
          >
            <ArchiveIcon className="h-4 w-4" />
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
              <Button key={idx} variant="outline" size="sm">
                {typeof btn === 'object' ? (btn.text || btn.Label || JSON.stringify(btn)) : btn}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            message.status === "resolved"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              : message.status === "pending"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
          }`}
        >
          {message.status === "resolved"
            ? "Résolu"
            : message.status === "pending"
            ? "En attente"
            : "Archivé"}
        </span>
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
    </div>
  );
} 