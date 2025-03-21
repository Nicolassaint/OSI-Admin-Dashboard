import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";

export default function MessageButton({ button, onRemove, onChange }) {
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
          <label className="block text-sm font-medium mb-1">Libellé</label>
          <Input 
            className="w-full"
            value={button.label || ''}
            onChange={(e) => onChange({...button, label: e.target.value})}
          />
        </div>
        
        <div className="mt-3">
          <label className="block text-sm font-medium mb-1">Lien</label>
          <Input 
            className="w-full"
            value={button.link || ''}
            onChange={(e) => onChange({...button, link: e.target.value})}
          />
        </div>
      </CardContent>
    </Card>
  );
} 