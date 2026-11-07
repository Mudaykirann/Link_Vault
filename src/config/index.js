const rawApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD
    ? 'https://linkvault-backend-eta.vercel.app/api'
    : 'http://localhost:5000/api');

export const config = {
    apiUrl: rawApiUrl.replace(/\/+$/, ''),
};
 