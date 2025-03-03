import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Chemin vers le fichier JSON
const dataFilePath = path.join(process.cwd(), 'src/data/search.json');

export async function POST(request) {
    try {
        // Vérifier le Content-Type pour déterminer si c'est une importation de fichier ou un ajout d'entrée
        const contentType = request.headers.get('Content-Type');
        
        if (contentType === 'application/json') {
            const body = await request.json();
            
            // Vérifier si c'est un fichier JSON complet (importation) ou une entrée individuelle
            if (typeof body === 'object' && !Array.isArray(body) && body !== null && !body.name) {
                // C'est un fichier JSON complet à importer
                fs.writeFileSync(dataFilePath, JSON.stringify(body, null, 2), 'utf8');
                return NextResponse.json({ success: true, message: 'Fichier importé avec succès' });
            } else {
                // C'est une entrée individuelle à ajouter
                const entry = body;
                
                // Vérifier si le fichier existe
                if (!fs.existsSync(dataFilePath)) {
                    // Créer un fichier vide si nécessaire
                    fs.writeFileSync(dataFilePath, '{}', 'utf8');
                }
                
                // Lire le fichier JSON
                const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
                
                // Convertir l'entrée au format attendu par le fichier JSON
                const formattedEntry = {
                    name: entry.name,
                    description: entry.description || "",
                    search: entry.search || "",
                    details: {
                        Label: entry.details?.label || "",
                        Messages: entry.details?.messages?.map(message => ({
                            Label: message.label || "",
                            Description: message.description || "",
                            Bubbles: message.bubbles?.map((bubble, index) => ({
                                Text: bubble.text || "",
                                Image: bubble.image || "",
                                Video: bubble.video || "",
                                Order: index + 1
                            })) || [],
                            Buttons: message.buttons?.map((button, index) => ({
                                Label: button.label || "",
                                Link: button.link || "",
                                Type: button.type || "link",
                                Order: index + 1
                            })) || []
                        })) || []
                    }
                };
                
                // Utiliser le nom comme clé au lieu de générer un ID basé sur un timestamp
                data[entry.name] = formattedEntry;
                
                // Écrire les modifications dans le fichier
                fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
                
                return NextResponse.json({ success: true, message: 'Entrée ajoutée avec succès' });
            }
        } else {
            return NextResponse.json(
                { error: 'Content-Type non supporté' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'ajout: ' + error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
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

        return NextResponse.json(data);
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des données' },
            { status: 500 }
        );
    }
} 