import MessageCard from "./MessageCard";
import Pagination from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { ArchiveIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

export default function MessageList({ 
  messages, 
  loading, 
  error, 
  onMarkAsResolved, 
  onDelete, 
  onArchive,
  onEditHover
}) {
  const ITEMS_PER_PAGE = 5; // Nombre de messages par page
  const [currentPage, setCurrentPage] = useState(1);
  
  // Réinitialiser la page à 1 quand les messages changent
  useEffect(() => {
    setCurrentPage(1);
  }, [messages.length]);
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil(messages.length / ITEMS_PER_PAGE);
  
  // Obtenir les messages pour la page actuelle
  const paginatedMessages = messages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Formater la date
  const formatDate = (dateString) => {
    try {
      // Vérifier si la date est valide
      if (!dateString) return "Date inconnue";
      
      // Essayer de créer une date directement
      let date = new Date(dateString);
      
      // Si la date n'est pas valide, essayer de nettoyer le format
      if (isNaN(date.getTime())) {
        // Essayer de supprimer les microsecondes si présentes
        const cleanDateString = dateString.split('.')[0];
        date = new Date(cleanDateString);
        
        // Si toujours pas valide, retourner un message d'erreur
        if (isNaN(date.getTime())) {
          console.warn("Date invalide:", dateString);
          return "Date invalide";
        }
      }
      
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return "Erreur de date";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  if (messages.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        Aucun message trouvé
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {paginatedMessages.map((message) => (
          <MessageCard
            key={message.id || `message-${Math.random()}`}
            message={message}
            onMarkAsResolved={onMarkAsResolved}
            onDelete={onDelete}
            onArchive={onArchive}
            formatDate={formatDate}
            onEditHover={onEditHover}
          >
            <div className="flex space-x-2">
              {message.status !== 'resolu' && message.status !== 'archive' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkAsResolved(message.id)}
                >
                  Marquer comme résolu
                </Button>
              )}
              {message.status !== 'archive' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onArchive(message.id)}
                >
                  <ArchiveIcon className="h-4 w-4 mr-1" />
                  Archiver
                </Button>
              )}
            </div>
          </MessageCard>
        ))}
      </div>
      
      {/* Pagination */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 