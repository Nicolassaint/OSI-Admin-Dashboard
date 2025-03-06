const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

const fetchWithAuth = async (endpoint) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API fetch error:", error);
        throw error;
    }
};

export const getMetrics = async (startDate = null, endDate = null) => {
    let url = '/metrics';

    // Ajouter les paramètres de date si fournis
    if (startDate || endDate) {
        url += '?';
        if (startDate) {
            url += `start_date=${encodeURIComponent(startDate)}`;
        }

        if (endDate) {
            url += startDate ? `&end_date=${encodeURIComponent(endDate)}` : `end_date=${encodeURIComponent(endDate)}`;
        }
    }

    return fetchWithAuth(url);
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
