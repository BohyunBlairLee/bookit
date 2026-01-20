// Use Capacitor platform detection to determine API base URL
// Native iOS app uses Railway production URL
// Web uses relative URLs (works with localhost in dev, domain in production)
const API_BASE_URL = (window as any)?.Capacitor?.isNativePlatform?.()
  ? "https://bookit-production-d54c.up.railway.app"
  : "";

export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // If no base URL (web platform), return path with leading slash
  if (!API_BASE_URL) {
    return `/${cleanPath}`;
  }

  return `${API_BASE_URL}/${cleanPath}`;
}
