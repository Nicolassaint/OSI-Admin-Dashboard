import { NextResponse } from 'next/server';

// Cache pour stocker les réponses
const responseCache = new Map();
const CACHE_DURATION = 5000; // 5 secondes

// PUT - Mettre à jour le statut d'une conversation
export async function PUT(request, context) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    // Attendre les paramètres de manière asynchrone
    const params = await context.params;
    const id = params.id;

    if (!apiUrl || !apiToken) {
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    if (!id) {
        return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    try {
        const body = await request.json();
        const status = body.status;

        if (!status) {
            return NextResponse.json({ error: "Status is required" }, { status: 400 });
        }

        // Modifier l'URL pour inclure le statut comme paramètre de requête
        const url = `${apiUrl}/api/conversation/${encodeURIComponent(id)}/status?status=${encodeURIComponent(status)}&token=${apiToken}`;

        console.log(`[Proxy] PUT conversation status: ${url}`);

        // Invalider le cache pour cette conversation
        responseCache.delete(id);

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
            cache: 'no-store',
            // Ajouter un timeout pour éviter les requêtes bloquées
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] Failed to update conversation status: ${response.status}`, errorText);
            return NextResponse.json({
                error: "Failed to update conversation status",
                status: response.status,
                details: errorText
            }, { status: response.status });
        }

        const data = await response.json();

        // Mettre en cache la réponse
        responseCache.set(id, {
            data,
            timestamp: Date.now()
        });

        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        console.error("[Proxy] Error updating conversation status:", error);
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
} 