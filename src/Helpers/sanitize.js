/**
 * Sanitizes URLs to prevent javascript: and data: URI attacks
 * Returns safe URL or "#" if URL is malicious
 */
export const safeUrl = (url) => {
  if (!url) return "#";
  const lower = url.trim().toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) {
    return "#";
  }
  return url;
};
