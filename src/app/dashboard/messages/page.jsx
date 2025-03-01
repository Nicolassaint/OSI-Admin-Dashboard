"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrashIcon, MagnifyingGlassIcon, ArchiveIcon } from "@radix-ui/react-icons";

export default function MessagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // Données fictives pour les messages
  const initialMessages = [
    {
      id: 1,
      user: "user123@example.com",
      message: "Comment puis-je réinitialiser mon mot de passe ?",
      response: "Vous pouvez réinitialiser votre mot de passe en cliquant sur 'Mot de passe oublié' sur la page de connexion.",
      timestamp: "2023-06-15T10:30:00",
      status: "resolved",
    },
    {
      id: 2,
      user: "newuser@example.com",
      message: "Je n'arrive pas à accéder à mon compte",
      response: "Veuillez vérifier votre email pour le lien de confirmation ou contactez le support.",
      timestamp: "2023-06-15T11:45:00",
      status: "pending",
    },
    {
      id: 3,
      user: "customer@example.com",
      message: "Où puis-je trouver la documentation sur l'API ?",
      response: "La documentation de l'API est disponible dans la section Développeurs de notre site.",
      timestamp: "2023-06-14T09:15:00",
      status: "resolved",
    },
    {
      id: 4,
      user: "developer@example.com",
      message: "Y a-t-il des exemples de code pour l'intégration ?",
      response: "Oui, vous pouvez trouver des exemples de code dans notre GitHub repository.",
      timestamp: "2023-06-13T14:20:00",
      status: "resolved",
    },
    {
      id: 5,
      user: "support@example.com",
      message: "Un utilisateur signale un problème avec la fonction de recherche",
      response: "",
      timestamp: "2023-06-15T09:10:00",
      status: "unresolved",
    },
  ];

  const [messages, setMessages] = useState(initialMessages);

  // Filtrer les messages en fonction de la recherche et du filtre
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.response.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    return matchesSearch && message.status === filter;
  });

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Supprimer un message
  const deleteMessage = (id) => {
    setMessages(messages.filter((message) => message.id !== id));
  };

  // Archiver un message (changer son statut)
  const archiveMessage = (id) => {
    setMessages(
      messages.map((message) =>
        message.id === id ? { ...message, status: "archived" } : message
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous</option>
            <option value="resolved">Résolus</option>
            <option value="unresolved">Non résolus</option>
            <option value="pending">En attente</option>
            <option value="archived">Archivés</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des messages ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucun message trouvé
              </p>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className="border rounded-lg p-4 space-y-3"
                >
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
                        onClick={() => archiveMessage(message.id)}
                      >
                        <ArchiveIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMessage(message.id)}
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
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        message.status === "resolved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : message.status === "unresolved"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          : message.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                      }`}
                    >
                      {message.status === "resolved"
                        ? "Résolu"
                        : message.status === "unresolved"
                        ? "Non résolu"
                        : message.status === "pending"
                        ? "En attente"
                        : "Archivé"}
                    </span>
                    {message.status !== "resolved" && (
                      <Button size="sm">Marquer comme résolu</Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 