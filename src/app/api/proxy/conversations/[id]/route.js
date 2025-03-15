import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const apiUrl = process.env.API_URL;
        const apiToken = process.env.API_TOKEN;

        if (!apiUrl || !apiToken) {
            console.error("API configuration is missing");
            return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
        }

        // Extraire l'ID de l'URL de la requête
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const id = pathParts[pathParts.length - 1];

        if (!id) {
            return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
        }

        // Utiliser l'endpoint correct pour récupérer une conversation spécifique
        const apiEndpoint = `${apiUrl}/api/conversation/${id}?token=${apiToken}`;
        console.log(`[Proxy] GET conversation: ${apiEndpoint}`);

        const response = await fetch(apiEndpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] Failed to fetch conversation: ${response.status}`, errorText);
            return NextResponse.json({
                error: "Failed to fetch conversation",
                status: response.status,
                details: errorText
            }, { status: response.status });
        }

        const data = await response.json();
        console.log(`[Proxy] Successfully fetched conversation`);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Conversation proxy error:", error);
        return NextResponse.json({
            error: "Service unavailable",
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 503 });
    }
} 