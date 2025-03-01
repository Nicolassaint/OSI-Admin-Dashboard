import { Button } from "@/components/ui/button";
import { TrashIcon, ArchiveIcon } from "@radix-ui/react-icons";

export default function MessageCard({ 
  message, 
  onMarkAsResolved, 
  onDelete, 
  onArchive,
  formatDate 
}) {
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
            onClick={() => onDelete(message.id)}
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
    </div>
  );
} 