import { NextResponse } from 'next/server';

export async function GET(request) {
  const apiUrl = process.env.API_URL;
  const apiToken = process.env.API_TOKEN;

  if (!apiUrl || !apiToken) {
    return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
  }

  // Convertir l'URL HTTP en URL WebSocket
  const wsUrl = apiUrl.replace('http', 'ws');
  
  // Construire l'URL WebSocket avec le token d'authentification
  const proxyUrl = `${wsUrl}/ws?token=${apiToken}`;

  // Retourner l'URL WebSocket à utiliser par le client
  // Cette URL sera utilisée côté client pour établir une connexion WebSocket
  return NextResponse.json({ wsUrl: proxyUrl });
} 