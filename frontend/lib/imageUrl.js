const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.50.159:4000";

export function imageUrl(url) {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  return `${API_URL}${url}`;
}