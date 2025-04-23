import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import matter from 'gray-matter';

// Chemin vers le dossier de documentation
const docsDirectory = path.join(process.cwd(), 'src/docs');

export async function GET() {
  try {
    // Vérifier si le dossier de documentation existe
    if (!fs.existsSync(docsDirectory)) {
      return NextResponse.json({ error: 'Documentation directory not found' }, { status: 404 });
    }

    // Lire tous les fichiers dans le dossier de documentation
    const docFiles = fs.readdirSync(docsDirectory);
    
    // Regrouper les documents par catégorie
    const documentationByCategory = {};

    // Parcourir tous les fichiers markdown
    for (const fileName of docFiles) {
      if (fileName.endsWith('.md')) {
        // Lire le contenu du fichier
        const filePath = path.join(docsDirectory, fileName);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Extraire les métadonnées (frontmatter) et le contenu
        const { data, content } = matter(fileContent);
        
        // Vérifier que le fichier a une catégorie définie
        if (data.category) {
          // Initialiser la catégorie si elle n'existe pas encore
          if (!documentationByCategory[data.category]) {
            documentationByCategory[data.category] = [];
          }
          
          // Ajouter le document à sa catégorie
          documentationByCategory[data.category].push({
            id: fileName.replace('.md', ''),
            title: data.title || 'Sans titre',
            content: content,
            category: data.category,
            order: data.order || 999 // Pour trier les documents dans une catégorie
          });
        }
      }
    }

    // Trier les documents dans chaque catégorie par ordre
    Object.keys(documentationByCategory).forEach(category => {
      documentationByCategory[category].sort((a, b) => a.order - b.order);
    });

    return NextResponse.json(documentationByCategory);
  } catch (error) {
    console.error('Erreur lors du chargement de la documentation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 