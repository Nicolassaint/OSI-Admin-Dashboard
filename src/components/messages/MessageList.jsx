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
  onEditHover,
  pagination,
  onPageChange,
  highlightedMessageId
}) {
  // Formater la date
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Date inconnue";
      
      let date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        const cleanDateString = dateString.split('.')[0];
        date = new Date(cleanDateString);
        
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

  if (!messages || messages.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        Aucun message trouvé
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageCard
            key={message.id || `message-${Math.random()}`}
            message={message}
            onMarkAsResolved={onMarkAsResolved}
            onDelete={onDelete}
            onArchive={onArchive}
            formatDate={formatDate}
            onEditHover={onEditHover}
            isHighlighted={highlightedMessageId === message.id}
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
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
} 