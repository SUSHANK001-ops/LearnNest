// Frontend config: choose backend URL via Vite env var VITE_BACKEND_URL
// Example: VITE_BACKEND_URL="http://192.168.1.10:4000"
export const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
