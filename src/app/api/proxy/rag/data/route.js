import { NextResponse } from 'next/server';

// GET - Récupérer toutes les données ou une entrée spécifique
export async function GET(request) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        // Vérifier si on demande une entrée spécifique
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        let url = `${apiUrl}/api/rag/data`;
        if (id) {
            // Utiliser la route spécifique pour récupérer une entrée par ID
            url = `${apiUrl}/api/rag/data/${encodeURIComponent(id)}`;
        }

        // Ajouter le token comme paramètre de requête
        url += `?token=${apiToken}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
            // Ajouter un cache: 'no-store' pour toujours obtenir les données les plus récentes du backend
            cache: 'no-store'
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch RAG data" }, { status: response.status });
        }

        const data = await response.json();

        // Formater les données pour correspondre à ce qu'attend le frontend
        if (!id) {
            // Si c'est une liste, transformer l'objet en tableau
            const entries = [];
            if (data.data && typeof data.data === 'object') {
                for (const [key, value] of Object.entries(data.data)) {
                    entries.push({
                        id: key,
                        ...value,
                        // Assurer la compatibilité avec le frontend
                        details: {
                            ...value.details,
                            // Normaliser les messages pour qu'ils soient accessibles via messages (minuscule)
                            messages: value.details?.Messages || []
                        }
                    });
                }
            }
            return NextResponse.json(entries, { status: 200 });
        }

        // Pour une entrée spécifique, retourner directement la réponse du backend
        // avec le format attendu par le frontend
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("RAG data proxy error:", error);
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
}

// POST - Créer une nouvelle entrée
export async function POST(request) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        const body = await request.json();

        const response = await fetch(`${apiUrl}/api/rag/data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to create RAG entry" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("RAG data proxy error:", error);
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
}

// PUT - Mettre à jour une entrée existante
export async function PUT(request) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        // Récupérer l'ID à partir des paramètres de requête
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const body = await request.json();

        const response = await fetch(`${apiUrl}/api/rag/data/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to update RAG entry" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("RAG data proxy error:", error);
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
}

// DELETE - Supprimer une entrée    
export async function DELETE(request) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        // Corriger l'URL pour correspondre à votre backend
        const response = await fetch(`${apiUrl}/api/rag/data/${encodeURIComponent(id)}?token=${apiToken}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to delete RAG entry" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("RAG data proxy error:", error);
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
} 