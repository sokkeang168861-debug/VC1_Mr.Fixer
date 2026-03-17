function isAbsoluteUrl(value) {
  return /^(https?:)?\/\//.test(value) || value.startsWith("data:") || value.startsWith("blob:");
}

export function resolveUploadUrl(path) {
  if (!path) {
    return "";
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  const basePath = (import.meta.env.VITE_UPLOADS_BASE_URL || "/uploads").replace(/\/+$/, "");
  const normalizedPath = String(path).replace(/^\/+/, "");

  return `${basePath}/${normalizedPath}`;
}