import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TextareaWithMarkdown from "./textarea-with-markdown";

export default function GeneralInfoTab({ entry, setEntry, isNewEntry }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom {isNewEntry && <span className="text-red-500">*</span>}
          </label>
          <Input 
            className="w-full"
            value={entry.name || ''}
            onChange={(e) => setEntry({...entry, name: e.target.value})}
            placeholder="Nom de l'entrée"
          />
          {isNewEntry && !entry.name && (
            <p className="text-sm text-red-500 mt-1">Le nom est obligatoire</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Description {isNewEntry && <span className="text-red-500">*</span>}
          </label>
          <TextareaWithMarkdown
            value={entry.description || ''}
            onChange={(e) => setEntry({...entry, description: e.target.value})}
            placeholder="Description de l'entrée"
            className="min-h-[100px]"
            rows={4}
          />
          {isNewEntry && !entry.description && (
            <p className="text-sm text-red-500 mt-1">La description est obligatoire</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Termes de recherche {isNewEntry && <span className="text-red-500">*</span>}
          </label>
          <TextareaWithMarkdown
            value={entry.search || ''}
            onChange={(e) => setEntry({...entry, search: e.target.value})}
            placeholder="Termes de recherche"
            className="min-h-[150px]"
          />
          {isNewEntry && !entry.search && (
            <p className="text-sm text-red-500 mt-1">Les termes de recherche sont obligatoires</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 