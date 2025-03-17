import { NextResponse } from 'next/server';

export async function GET(request) {
  const apiUrl = process.env.EXTERNAL_BACKEND_URL || process.env.API_URL;
  const WebSocketToken = process.env.WEBSOCKET_TOKEN;

  if (!apiUrl || !WebSocketToken) {
    return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
  }

  // Convertir l'URL HTTP en URL WebSocket
  const wsUrl = apiUrl.replace('http', 'ws');

  // Construire l'URL WebSocket avec le token d'authentification
  const proxyUrl = `${wsUrl}/ws?token=${WebSocketToken}`;

  // Retourner l'URL WebSocket à utiliser par le client
  // Cette URL sera utilisée côté client pour établir une connexion WebSocket
  return NextResponse.json({ wsUrl: proxyUrl });
} 