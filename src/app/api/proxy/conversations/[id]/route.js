import { NextResponse } from 'next/server';

// GET - Récupérer une conversation spécifique
export async function GET(request, context) {
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
        const url = `${apiUrl}/api/conversation/${encodeURIComponent(id)}?token=${apiToken}`;

        // console.log(`[Proxy] GET conversation by ID: ${url}`);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
            cache: 'no-store' // S'assurer d'obtenir les données les plus récentes
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] Failed to fetch conversation by ID: ${response.status}`, errorText);
            return NextResponse.json({
                error: "Failed to fetch conversation",
                status: response.status,
                details: errorText
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("[Proxy] Error fetching conversation:", error);
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
}

// DELETE - Supprimer une conversation
export async function DELETE(request, context) {
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
        const url = `${apiUrl}/api/conversation/${encodeURIComponent(id)}?token=${apiToken}`;

        // console.log(`[Proxy] DELETE conversation: ${url}`);

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            }
        });

        // Si l'erreur est 404, on peut renvoyer un message de succès
        // car la conversation n'existe pas ou a déjà été supprimée
        if (response.status === 404) {
            // console.log(`[Proxy] La conversation avec l'ID ${id} n'existe pas ou a déjà été supprimée`);
            // Retourner un statut 200 avec un message de succès pour éviter les erreurs côté client
            return NextResponse.json({
                success: true,
                message: "La conversation a été supprimée",
                status: 200
            }, { status: 200 });
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] Failed to delete conversation: ${response.status}`, errorText);
            return NextResponse.json({
                error: "Failed to delete conversation",
                status: response.status,
                details: errorText
            }, { status: response.status });
        }

        // Essayer de lire la réponse JSON si possible
        let data;
        try {
            data = await response.json();
            // console.log(`[Proxy] Réponse JSON de suppression:`, data);
        } catch (e) {
            // console.log(`[Proxy] La réponse n'est pas au format JSON:`, e.message);
            // Si ce n'est pas du JSON, ce n'est pas grave, on continue
            data = { success: true };
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("[Proxy] Error deleting conversation:", error);
        return NextResponse.json({
            error: "Service unavailable",
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 503 });
    }
} 