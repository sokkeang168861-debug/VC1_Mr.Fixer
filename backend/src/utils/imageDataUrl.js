const PNG_SIGNATURE = "89504e470d0a1a0a";
const JPEG_SIGNATURE = "ffd8ff";
const GIF_SIGNATURE = "47494638";
const RIFF_SIGNATURE = "52494646";
const WEBP_SIGNATURE = "57454250";

const getImageMimeType = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 4) {
    return null;
  }

  const header = buffer.subarray(0, 12).toString("hex");

  if (header.startsWith(PNG_SIGNATURE)) {
    return "image/png";
  }

  if (header.startsWith(JPEG_SIGNATURE)) {
    return "image/jpeg";
  }

  if (header.startsWith(GIF_SIGNATURE)) {
    return "image/gif";
  }

  const riff = buffer.subarray(0, 4).toString("hex");
  const webp = buffer.subarray(8, 12).toString("hex");
  if (riff === RIFF_SIGNATURE && webp === WEBP_SIGNATURE) {
    return "image/webp";
  }

  return null;
};

const toImageDataUrl = (buffer, fallbackMimeType = "image/jpeg") => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return null;
  }

  const mimeType = getImageMimeType(buffer) || fallbackMimeType;
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

module.exports = {
  getImageMimeType,
  toImageDataUrl,
};
