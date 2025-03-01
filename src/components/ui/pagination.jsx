import { Button } from "@/components/ui/button";

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = "" 
}) {
  if (totalPages <= 1) return null;
  
  return (
    <div className={`flex justify-center space-x-2 mt-6 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Précédent
      </Button>
      <span className="flex items-center px-3">
        Page {currentPage} sur {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Suivant
      </Button>
    </div>
  );
} 