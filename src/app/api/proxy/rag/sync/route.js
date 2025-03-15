import { NextResponse } from 'next/server';

export async function POST(request) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        const response = await fetch(`${apiUrl}/api/rag/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to sync RAG data" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("RAG sync proxy error:", error);
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
} 