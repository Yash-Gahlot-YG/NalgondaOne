import { Platform } from "react-native";
import { API_BASE_URL } from "@/config/api";
import { isLocalPreviewUri, isRemoteImageUrl } from "@/utils/imageUtils";

export interface ImageUploadResponse {
  success: boolean;
  data?: {
    urls: string[];
  };
  message?: string;
}

/**
 * Detects MIME type from file extension or blob URL.
 */
function getMimeType(uri: string): string {
  const cleanUri = uri.split("?")[0].toLowerCase();
  if (cleanUri.endsWith(".png")) return "image/png";
  if (cleanUri.endsWith(".webp")) return "image/webp";
  if (cleanUri.endsWith(".jpg") || cleanUri.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}

/**
 * Uploads an array of local image URIs to the backend which streams them to Cloudinary.
 * Preserves already-remote URLs without re-uploading them.
 *
 * @param uris Array of image URIs (can be local or remote)
 * @returns Array of remote HTTPS URLs in the same order
 */
export async function uploadImagesToCloudinary(uris: string[]): Promise<string[]> {
  if (!uris || uris.length === 0) {
    return [];
  }

  // Identify which items need upload and which are already remote URLs
  const indicesToUpload: number[] = [];
  const localUrisToUpload: string[] = [];
  const result: string[] = new Array(uris.length).fill("");

  uris.forEach((uri, idx) => {
    if (!uri) return;
    if (isRemoteImageUrl(uri)) {
      result[idx] = uri;
    } else if (isLocalPreviewUri(uri) || uri.length > 0) {
      indicesToUpload.push(idx);
      localUrisToUpload.push(uri);
    }
  });

  if (localUrisToUpload.length === 0) {
    return result;
  }

  const formData = new FormData();

  for (let i = 0; i < localUrisToUpload.length; i++) {
    const uri = localUrisToUpload[i];
    const mimeType = getMimeType(uri);
    const ext = mimeType.split("/")[1] || "jpg";
    const filename = `business_image_${Date.now()}_${i}.${ext}`;

    if (Platform.OS === "web") {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append("images", blob, filename);
      } catch (fetchErr) {
        console.error("Failed to read image file on web:", fetchErr);
        throw new Error(
          "Could not read the selected image file. Please re-select the image and try again."
        );
      }
    } else {
      // React Native / Expo Mobile
      formData.append("images", {
        uri,
        name: filename,
        type: mimeType,
      } as any);
    }
  }

  const uploadUrl = `${API_BASE_URL}/api/uploads/business-images`;
  let response: Response;

  try {
    response = await fetch(uploadUrl, {
      method: "POST",
      // Do not manually set Content-Type header so browser/RN sets multipart boundary
      body: formData,
    });
  } catch (networkErr) {
    throw new Error(
      "Unable to connect to image upload server. Please check your internet connection."
    );
  }

  let json: ImageUploadResponse;
  try {
    json = await response.json();
  } catch {
    throw new Error(
      "Unexpected response from image upload server. Please try again."
    );
  }

  if (!response.ok || !json.success || !json.data?.urls) {
    const errorMsg =
      json.message ||
      `Image upload failed with status ${response.status}. Please try again.`;
    throw new Error(errorMsg);
  }

  const uploadedUrls = json.data.urls;

  // Map the uploaded Cloudinary URLs back to their original positions
  indicesToUpload.forEach((originalIdx, uploadIdx) => {
    result[originalIdx] = uploadedUrls[uploadIdx] || "";
  });

  return result;
}

/**
 * Uploads all business image fields (logo, coverPhoto, businessPhotos) to Cloudinary.
 * Returns the sanitized structure with remote HTTPS URLs.
 */
export async function uploadAllBusinessImages(media: {
  logo?: string | null;
  coverPhoto?: string | null;
  businessPhotos?: string[];
}): Promise<{
  logo: string;
  coverPhoto: string;
  businessPhotos: string[];
}> {
  const tasks: { type: "logo" | "cover" | "photo"; uri: string; photoIndex?: number }[] = [];

  if (media.logo && isLocalPreviewUri(media.logo)) {
    tasks.push({ type: "logo", uri: media.logo });
  }

  if (media.coverPhoto && isLocalPreviewUri(media.coverPhoto)) {
    tasks.push({ type: "cover", uri: media.coverPhoto });
  }

  (media.businessPhotos || []).forEach((photoUri, idx) => {
    if (photoUri && isLocalPreviewUri(photoUri)) {
      tasks.push({ type: "photo", uri: photoUri, photoIndex: idx });
    }
  });

  // If there are no local images to upload, just return existing remote ones
  if (tasks.length === 0) {
    return {
      logo: isRemoteImageUrl(media.logo) ? media.logo! : "",
      coverPhoto: isRemoteImageUrl(media.coverPhoto) ? media.coverPhoto! : "",
      businessPhotos: (media.businessPhotos || []).filter(isRemoteImageUrl),
    };
  }

  const urisToUpload = tasks.map((t) => t.uri);
  const uploadedUrls = await uploadImagesToCloudinary(urisToUpload);

  let finalLogo = isRemoteImageUrl(media.logo) ? media.logo! : "";
  let finalCoverPhoto = isRemoteImageUrl(media.coverPhoto) ? media.coverPhoto! : "";
  const finalBusinessPhotos = [...(media.businessPhotos || [])];

  tasks.forEach((task, idx) => {
    const uploadedUrl = uploadedUrls[idx];
    if (task.type === "logo") {
      finalLogo = uploadedUrl;
    } else if (task.type === "cover") {
      finalCoverPhoto = uploadedUrl;
    } else if (task.type === "photo" && task.photoIndex !== undefined) {
      finalBusinessPhotos[task.photoIndex] = uploadedUrl;
    }
  });

  return {
    logo: finalLogo,
    coverPhoto: finalCoverPhoto,
    businessPhotos: finalBusinessPhotos.filter(isRemoteImageUrl),
  };
}
