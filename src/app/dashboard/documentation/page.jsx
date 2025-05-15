"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocsCategory } from "@/components/documentation/docs-category";
import { DocHeader } from "@/components/documentation/doc-header";
import { categories } from "@/lib/documentation";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Card, CardContent } from "@/components/ui/card";

// Associer des émojis à chaque catégorie de documentation
const categoryEmojis = {
  "getting-started": "🚀",
  "statistics": "📊",
  "messages": "💬",
  "rag-database": "🧠",
  "settings": "⚙️"
};

export default function DocumentationPage() {
  // État pour les catégories et documents
  const [activeCategory, setActiveCategory] = useState("getting-started");
  const [isLoading, setIsLoading] = useState(true);
  const [documentationData, setDocumentationData] = useState({});
  const [error, setError] = useState(null);
  
  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  
  // État pour la navigation vers un document spécifique
  const [targetDocId, setTargetDocId] = useState(null);
  const [targetCategoryId, setTargetCategoryId] = useState(null);
  const [scrollToDoc, setScrollToDoc] = useState(false);

  // Chargement initial des documents
  useEffect(() => {
    async function loadDocumentation() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/documentation');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la documentation');
        }
        const data = await response.json();
        setDocumentationData(data);
        setError(null);
      } catch (error) {
        console.error("Erreur lors du chargement de la documentation:", error);
        setError("Impossible de charger la documentation. Veuillez réessayer ultérieurement.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDocumentation();
  }, []);

  // Mettre à jour le mode de recherche lorsque la requête change
  useEffect(() => {
    setSearchMode(searchQuery.trim().length > 0);
  }, [searchQuery]);

  // Effet pour gérer le défilement vers le document sélectionné
  useEffect(() => {
    if (scrollToDoc && targetDocId && documentationData[targetCategoryId]) {
      // On utilise un délai pour laisser le temps au DOM de se mettre à jour
      const timer = setTimeout(() => {
        try {
          const docElement = document.getElementById(`doc-${targetDocId}`);
          
          if (docElement) {
            // Faire défiler jusqu'au document
            docElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Ajouter une mise en évidence temporaire
            docElement.classList.add('highlight-doc');
            setTimeout(() => {
              docElement.classList.remove('highlight-doc');
            }, 2000);
            
            // Si l'accordéon est fermé, l'ouvrir
            const accordionItem = docElement.querySelector('[data-state="closed"]');
            if (accordionItem) {
              accordionItem.click();
            }
          }
        } catch (error) {
          console.error("Erreur lors du défilement vers le document:", error);
        } finally {
          // Réinitialiser l'état pour éviter des défilements répétés
          setScrollToDoc(false);
        }
      }, 500); // Un délai plus long pour s'assurer que le DOM est mis à jour
      
      return () => clearTimeout(timer);
    }
  }, [scrollToDoc, targetDocId, targetCategoryId, documentationData]);

  // Filtrer tous les documents qui correspondent à la recherche
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const searchTermLower = searchQuery.toLowerCase();
    const results = [];
    
    // Parcourir toutes les catégories et documents
    Object.keys(documentationData).forEach(categoryId => {
      const category = categories.find(c => c.id === categoryId);
      
      if (documentationData[categoryId]) {
        documentationData[categoryId].forEach(doc => {
          if (
            doc.title.toLowerCase().includes(searchTermLower) || 
            doc.content.toLowerCase().includes(searchTermLower)
          ) {
            results.push({
              ...doc,
              categoryName: category ? category.name : 'Autre',
              categoryId
            });
          }
        });
      }
    });
    
    return results;
  }, [documentationData, searchQuery, categories]);

  // Accès normal aux documents par catégorie (sans recherche)
  const categoryDocs = useMemo(() => {
    return documentationData;
  }, [documentationData]);

  // Gestion de la recherche
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchMode(false);
    }
  };

  // Réinitialiser la recherche
  const resetSearch = () => {
    setSearchQuery("");
    setSearchMode(false);
  };

  // Navigation vers un document complet
  const viewFullDocument = (result) => {
    if (!result || !result.id || !result.categoryId) return;
    
    // Étape 1: Quitter le mode recherche et effacer la barre de recherche
    resetSearch();
    
    // Étape 2: Stocker l'ID du document et de sa catégorie
    setTargetDocId(result.id);
    setTargetCategoryId(result.categoryId);
    
    // Étape 3: Changer la catégorie active
    setActiveCategory(result.categoryId);
    
    // Étape 4: Activer le défilement (après que le DOM soit mis à jour)
    setTimeout(() => {
      setScrollToDoc(true);
    }, 100);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <DocHeader 
        onSearch={handleSearch} 
        searchQuery={searchQuery}
        resetSearch={resetSearch}
      />

      {error && (
        <Alert variant="destructive" className="mt-6">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : searchMode ? (
          // Mode recherche - Vue spécifique pour les résultats
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <MagnifyingGlassIcon className="mr-2 h-5 w-5" />
                Résultats de recherche pour "{searchQuery}"
              </h2>
              <button 
                onClick={resetSearch}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Retour à la documentation
              </button>
            </div>

            {searchResults.length === 0 ? (
              <Card className="bg-muted/40">
                <CardContent className="pt-6 text-center">
                  <p>🔍 Aucun résultat ne correspond à votre recherche.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Essayez d'autres termes ou vérifiez l'orthographe.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  ✨ {searchResults.length} document{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                </p>
                
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
                      <CardContent className="p-0">
                        <div 
                          className="bg-muted/40 px-4 py-2 text-sm text-muted-foreground border-b" 
                          style={{ cursor: 'pointer' }}
                        >
                          {categoryEmojis[result.categoryId] || '📄'} {result.categoryName}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-medium mb-2">{result.title}</h3>
                          <div className="text-sm text-muted-foreground line-clamp-3">
                            {result.content.substring(0, 200)}...
                          </div>
                          <button 
                            className="mt-3 text-sm text-primary hover:underline"
                            onClick={() => viewFullDocument(result)}
                          >
                            👁️ Voir le document complet
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          // Mode normal - Navigation par onglets
          <Tabs 
            defaultValue="getting-started" 
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="text-sm"
                >
                  {categoryEmojis[category.id]} {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <DocsCategory 
                  category={category} 
                  docs={categoryDocs[category.id] || []}
                  targetDocId={targetDocId}
                  isActive={category.id === activeCategory}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Styles pour la mise en évidence temporaire du document sélectionné */}
      <style jsx global>{`
        @keyframes highlight {
          0% { background-color: rgba(59, 130, 246, 0.2); }
          100% { background-color: transparent; }
        }
        
        .highlight-doc {
          animation: highlight 2s ease-out;
        }
        
        .doc-target {
          scroll-margin-top: 2rem;
        }
      `}</style>
    </div>
  );
} 