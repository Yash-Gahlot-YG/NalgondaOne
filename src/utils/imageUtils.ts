/**
 * Image Utility Functions
 *
 * Centralized helpers for distinguishing local preview URIs
 * from remote (cloud-hosted) image URLs.
 *
 * LOCAL PREVIEW URIs (not accessible outside the originating device/tab):
 *   - file:///...
 *   - content://...
 *   - blob:http://...
 *   - data:image/...
 *   - ph://...          (iOS photo library)
 *
 * REMOTE IMAGE URLs (accessible everywhere):
 *   - https://res.cloudinary.com/...
 *   - https://s3.amazonaws.com/...
 *   - Any https:// or http:// URL
 */

/**
 * Returns true if the URI is a publicly accessible remote image URL
 * (i.e. http:// or https://, but NOT blob: pseudo-URLs).
 */
export function isRemoteImageUrl(uri: string | null | undefined): boolean {
  if (!uri || typeof uri !== "string") return false;
  const trimmed = uri.trim();
  if (trimmed.length === 0) return false;

  // blob: URLs look like "blob:http://..." — they are NOT remote
  if (trimmed.startsWith("blob:")) return false;

  return trimmed.startsWith("https://") || trimmed.startsWith("http://");
}

/**
 * Returns true if the URI is a local-only preview URI that cannot
 * be rendered outside the originating device or browser tab.
 */
export function isLocalPreviewUri(uri: string | null | undefined): boolean {
  if (!uri || typeof uri !== "string") return false;
  const trimmed = uri.trim();
  if (trimmed.length === 0) return false;

  return (
    trimmed.startsWith("file://") ||
    trimmed.startsWith("content://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("ph://")
  );
}

/**
 * Strips image fields to only include remote URLs.
 * Local preview URIs are replaced with empty strings / empty arrays.
 *
 * Used before sending business data to the API so that MongoDB
 * never stores non-functional local URIs.
 */
export function sanitizeImageFieldsForApi(payload: {
  logo?: string | null;
  coverPhoto?: string | null;
  businessPhotos?: string[];
}): {
  logo: string;
  coverPhoto: string;
  businessPhotos: string[];
} {
  return {
    logo: isRemoteImageUrl(payload.logo) ? payload.logo! : "",
    coverPhoto: isRemoteImageUrl(payload.coverPhoto)
      ? payload.coverPhoto!
      : "",
    businessPhotos: (payload.businessPhotos ?? []).filter(isRemoteImageUrl),
  };
}
