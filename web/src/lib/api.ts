function cleanUrl(rawUrl?: string): string {
  if (!rawUrl) return 'http://localhost:4000';
  let url = rawUrl.trim();
  // Auto-correct if user accidentally duplicated the URL (e.g. https://foo/https://foo)
  const matches = url.match(/(https?:\/\/[^\s\/]+)/g);
  if (matches && matches.length > 1) {
    url = matches[0];
  }
  // Strip trailing slashes so `${API_BASE_URL}/api/...` formats correctly
  return url.replace(/\/+$/, '');
}

export const API_BASE_URL = cleanUrl(
  process.env.INTERNAL_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL
);
