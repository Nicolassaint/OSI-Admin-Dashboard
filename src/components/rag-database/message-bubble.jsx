import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";

export default function MessageBubble({ bubble, onRemove, onChange }) {
  return (
    <Card className="relative">
      <Button 
        variant="ghost" 
        size="icon"
        className="absolute top-2 right-2"
        onClick={onRemove}
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
      <CardContent className="pt-6">
        <div>
          <label className="block text-sm font-medium mb-1">Texte</label>
          <textarea 
            className="w-full p-2 border rounded-md bg-background"
            rows="3"
            value={bubble.text || ''}
            onChange={(e) => onChange({...bubble, text: e.target.value})}
          />
        </div>
        
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1">URL de l'image (optionnel)</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded-md bg-background"
            value={bubble.image || ''}
            onChange={(e) => onChange({...bubble, image: e.target.value})}
          />
        </div>
        
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1">URL de la vidéo (optionnel)</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded-md bg-background"
            value={bubble.video || ''}
            onChange={(e) => onChange({...bubble, video: e.target.value})}
          />
        </div>
      </CardContent>
    </Card>
  );
} 