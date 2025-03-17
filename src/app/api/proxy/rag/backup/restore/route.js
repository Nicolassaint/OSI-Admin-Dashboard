import { NextResponse } from 'next/server';

export async function POST(request) {
  const apiUrl = process.env.API_URL;
  const apiToken = process.env.API_TOKEN;

  if (!apiUrl || !apiToken) {
    return NextResponse.json({ error: "API configuration is missing" }, { status: 500 });
  }

  try {
    const body = await request.json();

    if (!body.backupFile) {
      return NextResponse.json({ error: "backupFile is required in the request body" }, { status: 400 });
    }

    const response = await fetch(`${apiUrl}/api/rag/backup/restore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiToken}`
      },
      body: JSON.stringify({ backupFile: body.backupFile })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: `Error: ${response.status}` }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Backup restore proxy error:", error);
    return NextResponse.json({ error: "Service unavailable", detail: error.message }, { status: 503 });
  }
} 