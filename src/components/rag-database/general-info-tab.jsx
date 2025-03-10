import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TextareaWithMarkdown from "./textarea-with-markdown";

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
        
        <TextareaWithMarkdown
          label="Description"
          value={entry.description || ''}
          onChange={(e) => setEntry({...entry, description: e.target.value})}
          placeholder="Description de l'entrée"
          className="min-h-[100px]"
          rows={4}
        />
        
        <TextareaWithMarkdown
          label="Termes de recherche"
          value={entry.search || ''}
          onChange={(e) => setEntry({...entry, search: e.target.value})}
          placeholder="Termes de recherche"
          className="min-h-[150px]"
        />
      </CardContent>
    </Card>
  );
} 