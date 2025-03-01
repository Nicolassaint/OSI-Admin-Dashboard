import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier JSON
const dataFilePath = path.join(process.cwd(), 'src/data/search_20250223_180928.json');

export async function DELETE(request, { params }) {
    try {
        // Récupérer l'ID depuis les paramètres (avec await)
        const { id } = params;

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

export async function PUT(request, { params }) {
    try {
        // Récupérer l'ID depuis les paramètres (avec await)
        const { id } = params;

        // Récupérer les données de la requête
        const entry = await request.json();

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

        // Convertir l'entrée au format attendu par le fichier JSON
        const formattedEntry = {
            name: entry.name,
            description: entry.description || "",
            search: entry.search || "",
            details: {
                Label: entry.details.label || "",
                Messages: entry.details.messages.map(message => ({
                    Label: message.label || "",
                    Description: message.description || "",
                    Bubbles: message.bubbles.map((bubble, index) => ({
                        Text: bubble.text || "",
                        Image: bubble.image || "",
                        Video: bubble.video || "",
                        Order: index + 1  // Commencer à 1 au lieu de 0
                    })),
                    Buttons: message.buttons.map((button, index) => ({
                        Label: button.label || "",
                        Link: button.link || "",
                        Type: button.type || "link",
                        Order: index + 1  // Commencer à 1 au lieu de 0
                    }))
                }))
            }
        };

        // Mettre à jour l'entrée
        data[entry.name] = formattedEntry;  // Utiliser entry.name comme clé au lieu de id

        // Si l'ID a changé (entry.name différent de id), supprimer l'ancienne entrée
        if (entry.name !== id) {
            delete data[id];
        }

        // Écrire les modifications dans le fichier
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la modification:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la modification' },
            { status: 500 }
        );
    }
}

export async function GET(request, { params }) {
    try {
        // Récupérer l'ID depuis les paramètres (avec await)
        const { id } = params;

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

        return NextResponse.json({ id, ...data[id] });
    } catch (error) {
        console.error('Erreur lors de la récupération:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération' },
            { status: 500 }
        );
    }
} 