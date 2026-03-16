const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").trim();
const rawUploadsBaseUrl = (import.meta.env.VITE_UPLOADS_BASE_URL || "").trim();

function removeTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

export const apiBaseUrl = removeTrailingSlash(rawApiBaseUrl || "/api");

export const uploadsBaseUrl = rawUploadsBaseUrl
  ? ensureTrailingSlash(rawUploadsBaseUrl)
  : apiBaseUrl.startsWith("http")
    ? new URL("/uploads/", apiBaseUrl).toString()
    : "/uploads/";

export function resolveUploadUrl(assetPath) {
  if (!assetPath) {
    return "";
  }

  if (/^(https?:|data:|blob:)/i.test(assetPath)) {
    return assetPath;
  }

  return `${uploadsBaseUrl}${assetPath.replace(/^\/+/, "")}`;
}