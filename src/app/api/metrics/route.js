const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

const fetchWithAuth = async (endpoint) => {
    try {
        // Vérifier si les variables d'environnement sont définies
        if (!API_URL || !API_TOKEN) {
            throw new Error("Configuration API manquante: URL ou token non défini");
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            },
            // Augmenter le timeout pour les requêtes volumineuses
            signal: AbortSignal.timeout(30000) // 30 secondes de timeout
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "Aucun détail disponible");
            throw new Error(`Erreur API: ${response.status} - ${response.statusText}. Détails: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API fetch error:", error);
        // Propager l'erreur avec un message plus descriptif
        if (error.name === "AbortError") {
            throw new Error("La requête a expiré. Le serveur API est peut-être indisponible ou la requête est trop volumineuse.");
        }
        throw error;
    }
};

export const getTimeseriesMetrics = async (period = 'daily', startDate = null, endDate = null) => {
    let url = `/api/timeseries-metrics?period=${period}`;

    if (startDate) {
        url += `&start_date=${encodeURIComponent(startDate)}`;
    }

    if (endDate) {
        url += `&end_date=${encodeURIComponent(endDate)}`;
    }

    return fetchWithAuth(url);
};
