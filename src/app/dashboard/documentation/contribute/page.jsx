"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { categories } from "@/lib/documentation";
import Link from "next/link";
import { ChevronLeftIcon } from "@radix-ui/react-icons";

export default function ContributePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/documentation">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeftIcon className="mr-2 h-4 w-4" />
            Retour à la documentation
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight mb-2">✏️ Contribuer à la documentation</h1>
        <p className="text-muted-foreground">
          Guide pour ajouter ou modifier la documentation du tableau de bord OSI Admin.
        </p>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>📁 Structure de la documentation</CardTitle>
            <CardDescription>
              Comment les fichiers de documentation sont organisés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              La documentation est organisée en fichiers Markdown (*.md) stockés dans le dossier <code className="bg-muted px-1 py-0.5 rounded text-sm">src/docs/</code>.
              Chaque fichier représente une page de documentation unique qui appartient à une catégorie.
            </p>
            
            <h3 className="font-semibold mb-2">📋 Catégories disponibles</h3>
            <ul className="list-disc pl-5 mb-4">
              {categories.map(category => (
                <li key={category.id} className="mb-2">
                  <div className="font-bold flex items-center">
                    <code className="bg-primary/20 mr-2 px-2 py-0.5 rounded text-sm">{category.id}</code>
                    <span>{category.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                </li>
              ))}
            </ul>
            
            <div className="p-3 bg-amber-100/50 dark:bg-amber-950/50 rounded-md mt-4">
              <h3 className="font-semibold mb-1 flex items-center">
                <span className="mr-2">⚠️</span>Important
              </h3>
              <p className="text-sm">
                Utilisez toujours l'identifiant technique (en code) dans le champ <code className="bg-muted px-1 py-0.5 rounded text-xs">category</code> du frontmatter.
                Par exemple: <code className="bg-muted px-1 py-0.5 rounded text-xs">category: getting-started</code>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>📝 Création d'un nouveau document</CardTitle>
            <CardDescription>
              Comment ajouter une nouvelle page de documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Pour créer un nouveau document, créez un fichier Markdown dans le dossier <code className="bg-muted px-1 py-0.5 rounded text-sm">src/docs/</code> avec l'extension <code className="bg-muted px-1 py-0.5 rounded text-sm">.md</code>.
            </p>
            
            <h3 className="font-semibold mb-2">🔍 Structure du fichier</h3>
            <p className="mb-2">Chaque fichier doit commencer par un en-tête frontmatter délimité par <code className="bg-muted px-1 py-0.5 rounded text-sm">---</code> qui définit les métadonnées:</p>
            
            <div className="bg-muted rounded-md p-3 my-3 font-mono text-sm">
              ---<br/>
              title: Titre de votre document<br/>
              category: getting-started<br/>
              order: 2<br/>
              ---<br/>
              <br/>
              # Votre contenu en Markdown ici<br/>
              <br/>
              ## Sous-titre<br/>
              <br/>
              Paragraphe avec du texte...
            </div>
            
            <h3 className="font-semibold mt-4 mb-2">⚠️ Champs obligatoires:</h3>
            <ul className="list-disc pl-5">
              <li><code className="bg-muted px-1 py-0.5 rounded text-sm">title</code>: Titre du document</li>
              <li><code className="bg-muted px-1 py-0.5 rounded text-sm">category</code>: Identifiant de la catégorie (doit correspondre à l'une des catégories existantes)</li>
              <li><code className="bg-muted px-1 py-0.5 rounded text-sm">order</code>: Ordre d'affichage dans la catégorie (1 = premier)</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>🖋️ Syntaxe Markdown</CardTitle>
            <CardDescription>
              Référence rapide de la syntaxe Markdown supportée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">✨ Formatage de base</h3>
                <ul className="space-y-2">
                  <li><code className="bg-muted px-1 py-0.5 rounded text-sm"># Titre</code> - Titre principal</li>
                  <li><code className="bg-muted px-1 py-0.5 rounded text-sm">## Sous-titre</code> - Sous-titre</li>
                  <li><code className="bg-muted px-1 py-0.5 rounded text-sm">**Texte**</code> - <strong>Texte en gras</strong></li>
                  <li><code className="bg-muted px-1 py-0.5 rounded text-sm">*Texte*</code> - <em>Texte en italique</em></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">🔗 Listes et liens</h3>
                <ul className="space-y-2">
                  <li><code className="bg-muted px-1 py-0.5 rounded text-sm">- Élément</code> - Liste à puces</li>
                  <li><code className="bg-muted px-1 py-0.5 rounded text-sm">1. Élément</code> - Liste numérotée</li>
                  <li><code className="bg-muted px-1 py-0.5 rounded text-sm">[Texte](URL)</code> - Lien hypertexte</li>
                  <li><code className="bg-muted px-1 py-0.5 rounded text-sm">```code```</code> - Bloc de code</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-primary/10 rounded-md">
              <h3 className="font-semibold mb-2">💡 Conseil</h3>
              <p>Pour rendre votre documentation plus attrayante, n'hésitez pas à utiliser des émojis! Ils rendent le texte plus agréable à lire et aident à mettre en évidence les points importants.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 