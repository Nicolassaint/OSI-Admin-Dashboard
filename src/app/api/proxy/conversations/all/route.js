import { NextResponse } from 'next/server';

// DELETE - Supprimer toutes les conversations
export async function DELETE(request) {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl || !apiToken) {
        return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
    }

    try {
        console.log(`[Proxy] Tentative de suppression de toutes les conversations`);

        // Utiliser le format pluriel 'conversations' pour la suppression de toutes les conversations
        const url = `${apiUrl}/api/conversations?token=${apiToken}`;
        console.log(`[Proxy] DELETE all conversations: ${url}`);

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiToken}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] Failed to delete all conversations: ${response.status}`, errorText);
            return NextResponse.json({
                error: "Failed to delete all conversations",
                status: response.status,
                details: errorText
            }, { status: response.status });
        }

        console.log(`[Proxy] Successfully deleted all conversations`);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("[Proxy] Error deleting all conversations:", error);
        return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
} 