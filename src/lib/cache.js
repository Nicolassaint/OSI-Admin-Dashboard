// Cache global pour les données du tableau de bord
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes
const cache = {
    metrics: null,
    recentActivity: null,
    lastUpdate: null
};

export const getCachedData = (key) => {
    if (!cache[key] || !cache.lastUpdate) return null;

    const now = Date.now();
    if (now - cache.lastUpdate > CACHE_DURATION) {
        return null;
    }

    return cache[key];
};

export const setCachedData = (key, data) => {
    cache[key] = data;
    cache.lastUpdate = Date.now();
};

export const invalidateCache = () => {
    cache.metrics = null;
    cache.recentActivity = null;
    cache.lastUpdate = null;
}; 