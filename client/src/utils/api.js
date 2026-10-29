export const getApiBaseUrl = () => {
  // When accessed on Vercel or any non-localhost domain, always use relative /api/payment
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api/payment';
  }
  return import.meta.env.VITE_API_BASE_URL || '/api/payment';
};

export const API_BASE_URL = getApiBaseUrl();
