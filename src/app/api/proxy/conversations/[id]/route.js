import { NextResponse } from 'next/server';

export async function GET(request, context) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;
    const { id } = context.params;

    if (!apiUrl || !apiToken) {
        console.error("API configuration is missing");
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        // Utiliser l'endpoint correct pour récupérer une conversation spécifique
        const url = `${apiUrl}/api/conversation/${id}?token=${apiToken}`;
        console.log(`[Proxy] GET conversation: ${url}`);

        const response = await fetch(url, {
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