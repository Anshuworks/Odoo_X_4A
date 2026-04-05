/**
 * Construct a full URL for a file stored on the backend.
 * Handles path normalization (backslashes to forward slashes) and prepends the base URL.
 * 
 * @param {string} path - The relative file path from the backend (e.g. "uploads\\receipts\\file.jpg")
 * @returns {string} - The full URL (e.g. "http://localhost:5002/uploads/receipts/file.jpg")
 */
export const getFullFileUrl = (path) => {
  if (!path) return '';

  // Get base URL from environment variable or fallback to localhost
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002';
  
  // Normalize path: replace all backslashes with forward slashes
  const normalizedPath = path.replace(/\\/g, '/');
  
  // Ensure we don't have double slashes when joining
  const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  
  return `${cleanBaseURL}${cleanPath}`;
};
