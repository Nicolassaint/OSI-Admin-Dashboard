import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

export default function RagMetricsDialog({ 
  isOpen, 
  onOpenChange, 
  isLoading, 
  error, 
  metrics 
}) {
  const router = useRouter();

  console.log("RAG Metrics:", metrics);

  const handleEditSource = (label) => {
    onOpenChange(false);
    router.push(`/dashboard/rag-database/edit/${encodeURIComponent(label)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Métriques RAG</DialogTitle>
          <DialogDescription>
            Détails des sources et métriques de performance
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            {error}
          </div>
        ) : metrics ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Sources utilisées pour la réponse:</h3>
              {metrics.top_results && metrics.top_results.length > 0 ? (
                <div className="space-y-2">
                  {metrics.top_results.map((result, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1 border rounded p-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{result.label}</span>
                          <span className="text-sm text-muted-foreground">
                            Score: {(result.score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${result.score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      {result.rank !== 0 && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8 flex-shrink-0 border-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleEditSource(result.label)}
                          title="Modifier la source"
                        >
                          <Pencil1Icon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune source disponible</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="border rounded p-2">
                <p className="text-sm font-medium">Temps de traitement total</p>
                <p className="text-lg">{metrics.processing_time?.toFixed(2) || "N/A"} s</p>
              </div>
              <div className="border rounded p-2">
                <p className="text-sm font-medium">Temps de traitement LLM</p>
                <p className="text-lg">{metrics.llm_processing_time?.toFixed(2) || "N/A"} s</p>
              </div>
            </div>
            
            {metrics.default_chunk_used !== undefined && (
              <div className="border rounded p-2">
                <p className="text-sm font-medium">Chunk par défaut utilisé</p>
                <p>{metrics.default_chunk_used ? "Oui" : "Non"}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Aucune métrique RAG disponible pour cette conversation.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 