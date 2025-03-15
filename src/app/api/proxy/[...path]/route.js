import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    return handleRequest(request, params.path, 'GET');
}

export async function POST(request, { params }) {
    return handleRequest(request, params.path, 'POST');
}

export async function PUT(request, { params }) {
    return handleRequest(request, params.path, 'PUT');
}

export async function DELETE(request, { params }) {
    return handleRequest(request, params.path, 'DELETE');
}

async function handleRequest(request, pathSegments, method) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    const path = pathSegments.join('/');
    const url = `${apiUrl}/${path}`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    // Utiliser systématiquement le token d'API du serveur
    headers.set('Authorization', `Bearer ${apiToken}`);

    try {
        const body = method !== 'GET' && method !== 'HEAD' ? await request.json() : undefined;

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Proxy API error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
} 