import { NextResponse } from 'next/server';

// GET - Récupérer toutes les conversations
export async function GET(request) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        console.error("API configuration is missing");
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        // Récupérer les paramètres de requête
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || 1;
        const limit = searchParams.get('limit') || 10;
        const search = searchParams.get('search') || '';
        const id = searchParams.get('id');

        // Si un ID est spécifié, récupérer une conversation spécifique
        if (id) {
            const url = `${apiUrl}/api/conversation/${encodeURIComponent(id)}?token=${apiToken}`;

            console.log(`[Proxy] GET conversation by ID: ${url}`);

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
        }

        // Sinon, récupérer toutes les conversations
        let url = `${apiUrl}/api/conversations?page=${page}&limit=${limit}`;
        // Ajouter le token comme paramètre de requête pour la compatibilité
        url += `&token=${apiToken}`;

        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        console.log(`[Proxy] GET conversations: ${url}`);

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
            console.error(`[Proxy] Failed to fetch conversations: ${response.status}`, errorText);
            return NextResponse.json({
                error: "Failed to fetch conversations",
                status: response.status,
                details: errorText
            }, { status: response.status });
        }

        const data = await response.json();
        console.log(`[Proxy] Successfully fetched ${data.length || (data.data && data.data.length) || 0} conversations`);
        console.log(`[Proxy] Sample data:`, data.length > 0 ? data[0] : (data.data && data.data.length > 0 ? data.data[0] : "No data"));

        // Si les données sont vides, renvoyer un tableau vide plutôt qu'un objet vide
        if (!data || (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0)) {
            console.log("[Proxy] Données vides ou invalides, renvoi d'un tableau vide");
            return NextResponse.json([], { status: 200 });
        }

        // Normaliser la structure des données pour assurer la compatibilité
        let normalizedData = data;

        // Si les données sont dans data.data, les extraire
        if (!Array.isArray(data) && data.data && Array.isArray(data.data)) {
            normalizedData = data.data;
        }

        // Si les données sont dans data.conversations, les extraire
        if (!Array.isArray(data) && data.conversations && Array.isArray(data.conversations)) {
            normalizedData = data.conversations;
        }

        // S'assurer que nous renvoyons toujours un tableau
        if (!Array.isArray(normalizedData)) {
            console.log("[Proxy] Les données ne sont pas un tableau, renvoi d'un tableau vide");
            normalizedData = [];
        }

        return NextResponse.json(normalizedData, { status: 200 });
    } catch (error) {
        console.error("[Proxy] Error fetching conversations:", error);
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
}

// POST - Créer une nouvelle conversation ou effectuer une action sur une conversation
export async function POST(request) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        console.error("API configuration is missing");
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { action, conversationId, status } = body;

        // Vérifier si c'est une demande d'importation (tableau de conversations)
        if (Array.isArray(body)) {
            console.log(`[Proxy] Importing ${body.length} conversations`);

            // Appeler l'API d'importation
            const url = `${apiUrl}/api/import_conversations?token=${apiToken}`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiToken}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Proxy] Failed to import conversations: ${response.status}`, errorText);

                // Essayer de parser le texte d'erreur en JSON
                let errorDetails = errorText;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorDetails = errorJson;
                } catch (e) {
                    // Si ce n'est pas du JSON valide, garder le texte tel quel
                    console.log("[Proxy] L'erreur n'est pas au format JSON:", e.message);
                }

                return NextResponse.json({
                    error: "Failed to import conversations",
                    status: response.status,
                    details: errorDetails
                }, { status: response.status });
            }

            const data = await response.json();
            console.log(`[Proxy] Successfully imported conversations`);
            return NextResponse.json({
                success: true,
                imported_count: body.length,
                ...data
            }, { status: 201 });
        }

        let url = `${apiUrl}/api/conversations`;
        let method = "POST";
        // Créer une copie du corps de la requête que nous pouvons modifier
        let requestBody = { ...body };

        // Si une action spécifique est demandée
        if (action && conversationId) {
            if (action === 'status' && status) {
                // Cas spécial pour la mise à jour du statut
                url = `${apiUrl}/api/conversation/${conversationId}/status`;
                method = "PUT";
                // Ajouter le statut et le token comme paramètres de requête
                url += `?status=${encodeURIComponent(status)}&token=${apiToken}`;

                // Pour la mise à jour du statut, utiliser un corps vide
                requestBody = {};
                console.log(`[Proxy] Mise à jour du statut de la conversation ${conversationId} à ${status}`);
            } else {
                // Autres actions
                url = `${apiUrl}/api/conversation/${conversationId}/${action}`;
                // Ajouter le token comme paramètre de requête
                url += `?token=${apiToken}`;
            }
        } else {
            // Ajouter le token comme paramètre de requête pour la création
            url += `?token=${apiToken}`;
        }

        console.log(`[Proxy] ${method} conversation: ${url}`);
        console.log(`[Proxy] Request body:`, requestBody);

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] Failed to process conversation request: ${response.status}`, errorText);
            return NextResponse.json({
                error: "Failed to process conversation request",
                status: response.status,
                details: errorText
            }, { status: response.status });
        }

        const data = await response.json();
        console.log(`[Proxy] Successfully processed conversation request`);
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Conversations proxy error:", error);
        return NextResponse.json({
            error: "Service unavailable",
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 503 });
    }
}

// DELETE - Supprimer une conversation
export async function DELETE(request) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        console.error("API configuration is missing");
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        // Récupérer l'ID de la conversation à supprimer
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            console.error("[Proxy] Conversation ID is required");
            return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
        }

        console.log(`[Proxy] Tentative de suppression de la conversation avec l'ID: ${id}`);

        // Utiliser le format singulier 'conversation' qui correspond à la route backend
        const url = `${apiUrl}/api/conversation/${id}?token=${apiToken}`;
        console.log(`[Proxy] DELETE conversation: ${url}`);

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            }
        });

        console.log(`[Proxy] Réponse reçue: ${response.status} ${response.statusText}`);

        // Si l'erreur est 404, on peut renvoyer un message de succès
        // car la conversation n'existe pas ou a déjà été supprimée
        if (response.status === 404) {
            console.log(`[Proxy] La conversation avec l'ID ${id} n'existe pas ou a déjà été supprimée`);
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
                statusText: response.statusText,
                details: errorText
            }, { status: response.status });
        }

        // Essayer de lire la réponse JSON si possible
        let responseData;
        try {
            responseData = await response.json();
            console.log(`[Proxy] Réponse JSON de suppression:`, responseData);
        } catch (e) {
            console.log(`[Proxy] La réponse n'est pas au format JSON:`, e.message);
            // Si ce n'est pas du JSON, ce n'est pas grave, on continue
            responseData = { success: true };
        }

        console.log(`[Proxy] Successfully deleted conversation: ${id}`);
        return NextResponse.json(responseData || { success: true }, { status: 200 });
    } catch (error) {
        console.error("Conversations proxy error:", error);
        return NextResponse.json({
            error: "Service unavailable",
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 503 });
    }
} 