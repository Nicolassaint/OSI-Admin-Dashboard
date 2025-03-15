import { NextResponse } from 'next/server';

export async function GET(request) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        const response = await fetch(`${apiUrl}/health`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiToken}`
            },
        });

        if (!response.ok) {
            return NextResponse.json({ status: "error" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Health check proxy error:", error);
        return NextResponse.json({ status: "error", message: "Service unavailable" }, { status: 503 });
    }
} 