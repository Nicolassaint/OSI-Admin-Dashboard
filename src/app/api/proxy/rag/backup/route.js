import { NextResponse } from 'next/server';

// GET - Récupérer la liste des sauvegardes ou télécharger une sauvegarde spécifique
export async function GET(request) {
  const apiUrl = process.env.API_URL;
  const apiToken = process.env.API_TOKEN;

  if (!apiUrl || !apiToken) {
    return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
  }

  try {
    // Vérifier si on demande une sauvegarde spécifique
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    let url = `${apiUrl}/api/rag/backup`;
    if (filename) {
      url = `${apiUrl}/api/rag/backup?filename=${filename}`;
    }
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiToken}`
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch backup data" }, { status: response.status });
    }
    
    // Si c'est un téléchargement de fichier, on renvoie directement le contenu
    if (filename) {
      const blob = await response.blob();
      return new Response(blob, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Backup proxy error:", error);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}

// POST - Créer une nouvelle sauvegarde
export async function POST(request) {
  const apiUrl = process.env.API_URL;
  const apiToken = process.env.API_TOKEN;

  if (!apiUrl || !apiToken) {
    return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
  }

  try {
    const response = await fetch(`${apiUrl}/api/rag/backup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiToken}`
      }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to create backup" }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Backup proxy error:", error);
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
} 