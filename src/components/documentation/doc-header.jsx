import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export function DocHeader({ onSearch, searchQuery, resetSearch }) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || "");
  
  // Synchroniser la valeur locale avec la prop externe
  useEffect(() => {
    setLocalSearchQuery(searchQuery || "");
  }, [searchQuery]);
  
  // Appliquer le délai de recherche pour éviter trop de requêtes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(localSearchQuery);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localSearchQuery, onSearch]);

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    if (resetSearch) {
      resetSearch();
    } else if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <Link href="/dashboard/documentation/contribute">
          <Button variant="secondary" size="sm">
            Contribuer
          </Button>
        </Link>
      </div>
      
      <p className="text-muted-foreground">
        Guides pratiques et instructions détaillées pour tirer le meilleur parti du tableau de bord OSI Admin.
      </p>
      
      <div className="w-full max-w-sm">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher dans la documentation..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {localSearchQuery && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={handleClearSearch}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 