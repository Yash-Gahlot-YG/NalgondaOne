import { API_BASE_URL } from "@/config/api";
import { BusinessFormData } from "@/data/business";
import { sanitizeImageFieldsForApi } from "@/utils/imageUtils";
import { getStoredUserToken } from "@/services/authApi";

/* ================================================================ */
/* BUSINESS API SERVICE                                             */
/* ================================================================ */

/** Shape of the data sent to POST /api/businesses */
export interface CreateBusinessRequest {
  businessName: string;
  category: string;
  description?: string;
  services?: string[];
  logo?: string | null;
  coverPhoto?: string | null;
  businessPhotos?: string[];
  address: string;
  locality: string;
  city?: string;
  pincode?: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  openingTime?: string;
  closingTime?: string;
  is24Hours?: boolean;
  closedDays?: string[];
}

/** Shape of a single business document returned by the API */
export interface BusinessDocument {
  _id: string;
  businessName: string;
  category: string;
  description?: string;
  services: string[];
  logo: string;
  coverPhoto: string;
  businessPhotos: string[];
  address: string;
  locality: string;
  city: string;
  pincode?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  phone: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  openingTime: string;
  closingTime: string;
  is24Hours: boolean;
  closedDays: string[];
  status: "pending" | "approved" | "changes_requested" | "rejected";
  verified: boolean;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  adminNotes?: string;
  rejectionReason?: string;
  owner?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Shape of a successful create-business API response */
export interface CreateBusinessResponse {
  success: true;
  message: string;
  data: BusinessDocument;
}

/** Shape of a list response */
export interface BusinessListResponse {
  success: true;
  count: number;
  data: BusinessDocument[];
}

/** Shape of a single business response */
export interface SingleBusinessResponse {
  success: true;
  data: BusinessDocument;
  message?: string;
}

/** Shape of a failed API response */
export interface ApiErrorResponse {
  success: false;
  message: string;
}

/**
 * Maps the frontend BusinessFormData to the API request payload.
 * This keeps all mapping logic in one place.
 */
export function mapFormDataToRequest(
  formData: Partial<BusinessFormData>
): CreateBusinessRequest {
  const payload: CreateBusinessRequest = {
    businessName: (formData.businessName || "").trim(),
    category: (formData.category || "").trim(),
    address: (formData.address || "").trim(),
    locality: (formData.locality || "").trim(),
    phone: (formData.phone || "").trim(),
  };

  // Optional text fields — only include if non-empty
  if (formData.description?.trim()) {
    payload.description = formData.description.trim();
  }
  if (formData.city?.trim()) {
    payload.city = formData.city.trim();
  }
  if (formData.pincode?.trim()) {
    payload.pincode = formData.pincode.trim();
  }
  if (formData.whatsapp?.trim()) {
    payload.whatsapp = formData.whatsapp.trim();
  }
  if (formData.email?.trim()) {
    payload.email = formData.email.trim();
  }
  if (formData.website?.trim()) {
    payload.website = formData.website.trim();
  }

  // Arrays
  if (formData.services && formData.services.length > 0) {
    payload.services = formData.services;
  }
  if (formData.closedDays && formData.closedDays.length > 0) {
    payload.closedDays = formData.closedDays;
  }

  // Image URLs — only include remote (cloud-hosted) URLs.
  const sanitizedImages = sanitizeImageFieldsForApi({
    logo: formData.logo,
    coverPhoto: formData.coverPhoto,
    businessPhotos: formData.businessPhotos,
  });
  if (sanitizedImages.logo) {
    payload.logo = sanitizedImages.logo;
  }
  if (sanitizedImages.coverPhoto) {
    payload.coverPhoto = sanitizedImages.coverPhoto;
  }
  if (sanitizedImages.businessPhotos && sanitizedImages.businessPhotos.length > 0) {
    payload.businessPhotos = sanitizedImages.businessPhotos;
  }

  // Business hours
  if (formData.openingTime) {
    payload.openingTime = formData.openingTime;
  }
  if (formData.closingTime) {
    payload.closingTime = formData.closingTime;
  }
  payload.is24Hours = !!formData.is24Hours;

  // GeoJSON location — only if coordinates are available
  if (formData.longitude != null && formData.latitude != null) {
    payload.location = {
      type: "Point",
      coordinates: [formData.longitude, formData.latitude],
    };
  }

  return payload;
}

/**
 * Helper to build auth headers with current token
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getStoredUserToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Submit a new business to the backend API.
 *
 * POST /api/businesses
 *
 * @returns The created business document on success.
 * @throws  An Error with a user-friendly message on failure.
 */
export async function createBusiness(
  formData: BusinessFormData
): Promise<BusinessDocument> {
  const url = `${API_BASE_URL}/api/businesses`;
  const body = mapFormDataToRequest(formData);
  const headers = await getAuthHeaders();

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    throw new Error(
      "Unable to connect to the server. Please check your internet connection and try again."
    );
  }

  let json: CreateBusinessResponse | ApiErrorResponse;

  try {
    json = await response.json();
  } catch {
    throw new Error(
      "Unexpected response from the server. Please try again later."
    );
  }

  if (!response.ok || !json.success) {
    const errorMsg =
      (json as ApiErrorResponse).message ||
      "Something went wrong while submitting your business. Please try again.";
    throw new Error(errorMsg);
  }

  return (json as CreateBusinessResponse).data;
}

/**
 * Fetch all businesses owned by the current authenticated user.
 *
 * GET /api/businesses/my-businesses
 */
export async function fetchMyBusinesses(): Promise<BusinessDocument[]> {
  const url = `${API_BASE_URL}/api/businesses/my-businesses`;
  const headers = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(url, { headers });
  } catch {
    throw new Error("Unable to connect to the server. Please check your connection.");
  }

  let json: BusinessListResponse | ApiErrorResponse;
  try {
    json = await response.json();
  } catch {
    throw new Error("Unexpected response format from server.");
  }

  if (!response.ok || !json.success) {
    throw new Error((json as ApiErrorResponse).message || "Failed to load your businesses.");
  }

  return (json as BusinessListResponse).data;
}

/**
 * Fetch a single business owned by the current authenticated user by ID.
 *
 * GET /api/businesses/my-businesses/:id
 */
export async function fetchMyBusinessById(
  id: string
): Promise<BusinessDocument> {
  const url = `${API_BASE_URL}/api/businesses/my-businesses/${id}`;
  const headers = await getAuthHeaders();

  let response: Response;
  try {
    response = await fetch(url, { headers });
  } catch {
    throw new Error("Unable to connect to the server. Please check your connection.");
  }

  let json: SingleBusinessResponse | ApiErrorResponse;
  try {
    json = await response.json();
  } catch {
    throw new Error("Unexpected response format from server.");
  }

  if (!response.ok || !json.success) {
    throw new Error((json as ApiErrorResponse).message || "Failed to load business details.");
  }

  return (json as SingleBusinessResponse).data;
}

/**
 * Update a business owned by the current user.
 *
 * PUT /api/businesses/my-businesses/:id
 */
export async function updateMyBusiness(
  id: string,
  formData: Partial<BusinessFormData>
): Promise<BusinessDocument> {
  const url = `${API_BASE_URL}/api/businesses/my-businesses/${id}`;
  const headers = await getAuthHeaders();
  const body = mapFormDataToRequest(formData);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Unable to connect to the server. Please check your connection.");
  }

  let json: SingleBusinessResponse | ApiErrorResponse;
  try {
    json = await response.json();
  } catch {
    throw new Error("Unexpected response format from server.");
  }

  if (!response.ok || !json.success) {
    throw new Error((json as ApiErrorResponse).message || "Failed to update business.");
  }

  return (json as SingleBusinessResponse).data;
}

/**
 * Fetch a single approved business by its MongoDB _id (public).
 *
 * GET /api/businesses/:id
 *
 * @returns The business document if approved, or null if not found / not approved.
 */
export async function getApprovedBusinessById(
  id: string
): Promise<BusinessDocument | null> {
  const url = `${API_BASE_URL}/api/businesses/${id}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const json = await response.json();
    if (!json.success || !json.data) return null;

    return json.data as BusinessDocument;
  } catch {
    return null;
  }
}
