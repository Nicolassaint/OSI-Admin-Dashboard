import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier JSON - correction de l'extension du fichier
const dataFilePath = path.join(process.cwd(), 'src/data/search_20250223_180928.json');

export async function DELETE(request, { params }) {
    try {
        // Récupérer l'ID depuis les paramètres
        const id = params.id;

        // Vérifier si le fichier existe
        if (!fs.existsSync(dataFilePath)) {
            console.error(`Fichier non trouvé: ${dataFilePath}`);
            return NextResponse.json(
                { error: 'Fichier de données non trouvé' },
                { status: 500 }
            );
        }

        // Lire le fichier JSON
        const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

        // Vérifier si l'entrée existe
        if (!data[id]) {
            return NextResponse.json(
                { error: `Entrée avec ID ${id} non trouvée` },
                { status: 404 }
            );
        }

        // Supprimer l'entrée
        delete data[id];

        // Écrire les modifications dans le fichier
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }
} 