import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function GeneralInfoTab({ entry, setEntry }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <Input 
            className="w-full"
            value={entry.name || ''}
            onChange={(e) => setEntry({...entry, name: e.target.value})}
            placeholder="Nom de l'entrée"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea 
            className="w-full resize-y min-h-[100px]"
            value={entry.description || ''}
            onChange={(e) => setEntry({...entry, description: e.target.value})}
            placeholder="Description de l'entrée"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Termes de recherche</label>
          <Textarea 
            className="w-full resize-y min-h-[60px]"
            value={entry.search || ''}
            onChange={(e) => setEntry({...entry, search: e.target.value})}
            placeholder="Termes de recherche"
          />
        </div>
      </CardContent>
    </Card>
  );
} 