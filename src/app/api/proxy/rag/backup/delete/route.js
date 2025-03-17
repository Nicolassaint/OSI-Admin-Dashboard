import { NextResponse } from 'next/server';

export async function DELETE(request) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json({ error: "filename parameter is required" }, { status: 400 });
        }

        const response = await fetch(`${apiUrl}/api/rag/backup?filename=${filename}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${apiToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: `Error: ${response.status}` }));
            return NextResponse.json(errorData, { status: response.status });
        }

        // Si la réponse est vide, on renvoie un succès
        if (response.status === 204) {
            return new Response(null, { status: 204 });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Backup delete proxy error:", error);
        return NextResponse.json({ error: "Service unavailable", detail: error.message }, { status: 503 });
    }
} 