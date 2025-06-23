import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MessageSearch({ searchTerm, onSearch, loading = false }) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");

  // Synchroniser avec la prop externe
  useEffect(() => {
    setLocalSearchTerm(searchTerm || "");
  }, [searchTerm]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(localSearchTerm.trim());
    }
  };

  const handleClear = () => {
    setLocalSearchTerm("");
    if (onSearch) {
      onSearch("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-9 pr-10 w-64"
          disabled={loading}
        />
        {localSearchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            disabled={loading}
          >
            <Cross2Icon className="h-3 w-3" />
          </Button>
        )}
      </div>
      <Button 
        onClick={handleSearch} 
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
        ) : (
          <MagnifyingGlassIcon className="h-4 w-4" />
        )}
        Rechercher
      </Button>
    </div>
  );
} 