import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TextareaWithMarkdown from "./textarea-with-markdown";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useState } from "react";

// Liste des catégories disponibles
const CATEGORIES = [
  "Accès au réseau et aux ressources",
  "Applications et logiciels",
  "Appui et expertise",
  "Communication et service collaboratif",
  "Divers",
  "Equipement audiovisuel et téléphonique",
  "Sécurité"
];

export default function GeneralInfoTab({ entry, setEntry, isNewEntry }) {
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              Nom {isNewEntry && <span className="text-red-500">*</span>}
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Nom de l'application ou du service, sera transmis au prompt du LLM</p>
                </TooltipContent>
              </Tooltip>
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
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              Catégorie {isNewEntry && <span className="text-red-500">*</span>}
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Catégorie à laquelle appartient cette entrée</p>
                </TooltipContent>
              </Tooltip>
            </label>
            <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  type="button"
                >
                  {entry.categorie || "Sélectionner une catégorie"}
                  <ChevronDownIcon className="h-4 w-4 ml-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <div className="max-h-[300px] overflow-auto">
                  {CATEGORIES.map((category) => (
                    <div
                      key={category}
                      className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      onClick={() => {
                        setEntry({...entry, categorie: category});
                        setCategoryPopoverOpen(false);
                      }}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {isNewEntry && !entry.categorie && (
              <p className="text-sm text-red-500 mt-1">La catégorie est obligatoire</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              Description {isNewEntry && <span className="text-red-500">*</span>}
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Description synthétique de l'application qui sera transmise au LLM</p>
                </TooltipContent>
              </Tooltip>
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
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              Termes de recherche {isNewEntry && <span className="text-red-500">*</span>}
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Description / Mots-clés utilisés uniquement par l'IA pour retrouver cette entrée (non fournis au LLM)</p>
                </TooltipContent>
              </Tooltip>
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
    </TooltipProvider>
  );
} 