// Cache global pour les données du tableau de bord
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes
const cache = {
    metrics: null,
    recentActivity: null,
    lastUpdate: null,
    ragData: null,
    ragLastUpdate: null
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

// Fonctions spécifiques pour le cache RAG
export const getRagCache = () => {
    if (!cache.ragData || !cache.ragLastUpdate) return null;

    const now = Date.now();
    if (now - cache.ragLastUpdate > CACHE_DURATION) {
        return null;
    }

    return cache.ragData;
};

export const setRagCache = (data) => {
    cache.ragData = data;
    cache.ragLastUpdate = Date.now();
};

export const invalidateRagCache = () => {
    cache.ragData = null;
    cache.ragLastUpdate = null;

    // Invalider également le cache global si nécessaire
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('ragDataCacheInvalidated', 'true');
    }
};

// Fonction pour vérifier si le cache RAG est invalide
export const isRagCacheInvalid = () => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('ragDataCacheInvalidated') === 'true';
};

// Fonction pour réinitialiser l'état d'invalidation du cache RAG
export const resetRagCacheInvalidation = () => {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem('ragDataCacheInvalidated');
    }
}; 