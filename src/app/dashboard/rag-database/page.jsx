"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MagnifyingGlassIcon, PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import ReactMarkdown from 'react-markdown';

// Importer le fichier JSON
import ragDataFile from '@/data/search_20250223_180928.json';

const ITEMS_PER_PAGE = 5; // Nombre d'entrées à afficher par page

export default function RagDatabasePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [jsonView, setJsonView] = useState("tree");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Initialiser les données avec le fichier JSON importé
  const initialRagData = {
    entries: Object.entries(ragDataFile).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description,
      search: value.search,
      details: {
        label: value.details?.Label,
        messages: value.details?.Messages?.map(message => ({
          label: message.Label,
          description: message.Description,
          bubbles: message.Bubbles?.map(bubble => ({
            text: bubble.Text,
            image: bubble.Image,
            video: bubble.Video,
            order: bubble.Order
          })),
          buttons: message.Buttons?.map(button => ({
            label: button.Label,
            link: button.Link,
            type: button.Type,
            order: button.Order
          }))
        }))
      }
    }))
  };

  const [ragData, setRagData] = useState(initialRagData);

  // Filtrer les entrées
  const filteredEntries = ragData.entries.filter(entry =>
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.search?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Supprimer une entrée
  const deleteEntry = (entryId) => {
    setRagData({
      ...ragData,
      entries: ragData.entries.filter((entry) => entry.id !== entryId),
    });
  };

  // Éditer une entrée (ouvrir le modal d'édition)
  const editEntry = (entry) => {
    setSelectedEntry(entry);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Base de données RAG</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setShowAddModal(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Ajouter une entrée
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Recherche</CardTitle>
          <CardDescription>
            Recherchez dans la base de connaissances RAG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="mt-4 flex space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="tree-view"
                name="json-view"
                checked={jsonView === "tree"}
                onChange={() => setJsonView("tree")}
              />
              <label htmlFor="tree-view">Vue structurée</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="raw-view"
                name="json-view"
                checked={jsonView === "raw"}
                onChange={() => setJsonView("raw")}
              />
              <label htmlFor="raw-view">Vue JSON brute</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Entrées ({filteredEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jsonView === "tree" ? (
            <div className="space-y-4">
              {paginatedEntries.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Aucune entrée trouvée
                </p>
              ) : (
                <>
                  {paginatedEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          <div className="text-sm text-muted-foreground">
                            <ReactMarkdown>{entry.description}</ReactMarkdown>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editEntry(entry)}
                          >
                            <Pencil1Icon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {entry.details?.messages?.map((message, idx) => (
                        <div key={idx} className="mt-4">
                          <p className="font-medium text-sm">Message: {message.label}</p>
                          
                          {message.bubbles?.map((bubble, bidx) => (
                            <div key={bidx} className="ml-4 mt-2">
                              <div className="text-sm prose prose-sm">
                                <ReactMarkdown>{bubble.text}</ReactMarkdown>
                              </div>
                              {bubble.image && <img src={bubble.image} alt="Bubble image" className="mt-2" />}
                              {bubble.video && <video src={bubble.video} className="mt-2" controls />}
                            </div>
                          ))}
                          
                          {message.buttons?.length > 0 && (
                            <div className="mt-2">
                              <p className="font-medium text-sm">Boutons:</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {message.buttons.map((button, btnIdx) => (
                                  <span key={btnIdx} className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                                    {button.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  <div className="flex justify-center space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <span className="py-2 px-3 text-sm">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px] text-sm">
              {JSON.stringify(filteredEntries, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 