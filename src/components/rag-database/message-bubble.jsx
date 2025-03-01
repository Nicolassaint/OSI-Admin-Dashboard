import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import { useRef } from "react";
import MarkdownToolbar from "./markdown-toolbar";
import { Input } from "@/components/ui/input";

export default function MessageBubble({ bubble, onRemove, onChange }) {
  const textareaRef = useRef(null);
  
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
          <MarkdownToolbar textareaRef={textareaRef} />
          <textarea 
            ref={textareaRef}
            className="w-full p-2 border rounded-md bg-background"
            rows="3"
            value={bubble.text || ''}
            onChange={(e) => onChange({...bubble, text: e.target.value})}
          />
        </div>
        
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1">URL de l'image (optionnel)</label>
          <Input 
            className="w-full"
            value={bubble.image || ''}
            onChange={(e) => onChange({...bubble, image: e.target.value})}
          />
        </div>
        
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1">URL de la vidéo (optionnel)</label>
          <Input 
            className="w-full"
            value={bubble.video || ''}
            onChange={(e) => onChange({...bubble, video: e.target.value})}
          />
        </div>
      </CardContent>
    </Card>
  );
} 