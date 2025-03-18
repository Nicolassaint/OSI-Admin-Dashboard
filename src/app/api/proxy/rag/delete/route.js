import { NextResponse } from 'next/server';

export async function DELETE(request) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        const response = await fetch(`${apiUrl}/api/rag/delete`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("RAG delete proxy error:", error);
        return NextResponse.json({ error: "Service unavailable", detail: error.message }, { status: 503 });
    }
} 