import { API_BASE_URL } from "@/config/api";
import { BusinessDocument, ApiErrorResponse } from "@/services/businessApi";

/* ================================================================ */
/* HEALTHCARE API SERVICE                                            */
/* ================================================================ */

/** Healthcare categories recognized by the system */
export const HEALTHCARE_CATEGORIES = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Dentist",
  "Orthopedic",
  "Gynecologist",
  "ENT",
  "Ophthalmologist",
  "Hospital",
  "Clinic",
  "Diagnostic Center",
  "Pharmacy",
];

/** Shape of a successful healthcare listings response */
export interface HealthcareListingsResponse {
  success: true;
  count: number;
  data: BusinessDocument[];
}

export interface HealthcareFilterOptions {
  category?: string;
  search?: string;
  facilityType?: string;
  pincode?: string;
  locality?: string;
  forceRefresh?: boolean;
}

/** In-memory cache for healthcare listings to avoid slow repeated network calls */
const cachedListingsMap = new Map<string, { data: BusinessDocument[]; timestamp: number }>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export function clearHealthcareCache(): void {
  cachedListingsMap.clear();
}

export function getCachedHealthcare(key: string = "all"): BusinessDocument[] | null {
  const cached = cachedListingsMap.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}

/**
  Fallback handler that fetches from /api/businesses/approved and filters
  for healthcare listings client-side. This ensures the frontend continues
  functioning seamlessly when deployed or connected to a backend that hasn't
  yet mounted the dedicated /api/healthcare endpoint.
 */
async function fetchFromApprovedBusinesses(
  options?: HealthcareFilterOptions
): Promise<{ success: true; data: BusinessDocument[] } | { success: false; message: string }> {
  try {
    const url = `${API_BASE_URL}/api/businesses/approved?vertical=healthcare`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Backend returned status ${res.status}. Please try again later.`,
      };
    }

    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      return {
        success: false,
        message: "Unexpected response format from the server.",
      };
    }

    const { category, search, facilityType, pincode, locality } = options || {};

    // Filter to healthcare businesses
    let listings: BusinessDocument[] = json.data.filter(
      (biz: BusinessDocument) =>
        biz.vertical === "healthcare" ||
        HEALTHCARE_CATEGORIES.some(
          (c) => c.toLowerCase() === (biz.category || "").trim().toLowerCase()
        )
    );

    // Apply category filter if specified
    if (category && category !== "All") {
      const catLower = category.trim().toLowerCase();
      listings = listings.filter(
        (biz) => (biz.category || "").trim().toLowerCase() === catLower
      );
    }

    // Apply facilityType filter if specified
    if (facilityType && facilityType !== "all") {
      listings = listings.filter((biz) => biz.facilityType === facilityType);
    }

    // Apply pincode filter if specified
    if (pincode && pincode !== "All") {
      listings = listings.filter((biz) => (biz.pincode || "").trim() === pincode.trim());
    }

    // Apply locality filter if specified
    if (locality && locality !== "All") {
      const locLower = locality.trim().toLowerCase();
      listings = listings.filter((biz) => (biz.locality || "").toLowerCase().includes(locLower));
    }

    // Apply search filter if specified
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      listings = listings.filter((biz) => {
        const name = (biz.businessName || "").toLowerCase();
        const doc = (biz.doctorName || "").toLowerCase();
        const qual = (biz.qualifications || "").toLowerCase();
        const cat = (biz.category || "").toLowerCase();
        const desc = (biz.description || "").toLowerCase();
        const addr = (biz.address || "").toLowerCase();
        const loc = (biz.locality || "").toLowerCase();
        const svcs = (biz.services || []).join(" ").toLowerCase();
        return (
          name.includes(q) ||
          doc.includes(q) ||
          qual.includes(q) ||
          cat.includes(q) ||
          desc.includes(q) ||
          addr.includes(q) ||
          loc.includes(q) ||
          svcs.includes(q)
        );
      });
    }

    return { success: true, data: listings };
  } catch (err: any) {
    return {
      success: false,
      message:
        typeof __DEV__ !== "undefined" && __DEV__
          ? `Connection failed: ${err?.message || "Server unreachable"}`
          : "Unable to connect to the server. Please check your internet connection.",
    };
  }
}

/**
 * Fetch healthcare listings from the backend API.
 *
 * First attempts GET /api/healthcare/listings?category=...&search=...
 * If the dedicated endpoint returns 404 (e.g. backend deployment without the route),
 * automatically falls back to /api/businesses/approved and filters client-side.
 */
export async function fetchHealthcareListings(
  categoryOrOptions?: string | HealthcareFilterOptions,
  legacySearch?: string
): Promise<{ success: true; data: BusinessDocument[] } | { success: false; message: string }> {
  const options: HealthcareFilterOptions =
    typeof categoryOrOptions === "object" && categoryOrOptions !== null
      ? categoryOrOptions
      : {
          category: categoryOrOptions,
          search: legacySearch,
        };

  const { category, search, facilityType, pincode, locality } = options;
  const params = new URLSearchParams();
  if (category && category !== "All") {
    params.set("category", category);
  }
  if (search && search.trim()) {
    params.set("search", search.trim());
  }
  if (facilityType && facilityType !== "all") {
    params.set("facilityType", facilityType);
  }
  if (pincode && pincode !== "All") {
    params.set("pincode", pincode);
  }
  if (locality && locality !== "All") {
    params.set("locality", locality);
  }

  const queryString = params.toString();
  const cacheKey = queryString || "all";

  // Check in-memory cache first if forceRefresh is not requested
  if (!options.forceRefresh) {
    const cached = getCachedHealthcare(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }
  }

  const url = `${API_BASE_URL}/api/healthcare/listings${queryString ? `?${queryString}` : ""}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
  } catch {
    // If dedicated endpoint fetch fails at network level, attempt approved businesses fallback
    const fallback = await fetchFromApprovedBusinesses(options);
    if (fallback.success) {
      cachedListingsMap.set(cacheKey, { data: fallback.data, timestamp: Date.now() });
      return fallback;
    }
    return {
      success: false,
      message: "Unable to connect to the server. Please check your internet connection.",
    };
  }

  // If dedicated endpoint is not found (404), fall back to /api/businesses/approved
  if (response.status === 404) {
    const fallback = await fetchFromApprovedBusinesses(options);
    if (fallback.success) {
      cachedListingsMap.set(cacheKey, { data: fallback.data, timestamp: Date.now() });
    }
    return fallback;
  }

  let json: HealthcareListingsResponse | ApiErrorResponse;
  try {
    json = await response.json();
  } catch {
    // Response was not JSON (e.g. HTML error page) — try fallback
    const fallback = await fetchFromApprovedBusinesses(options);
    if (fallback.success) {
      cachedListingsMap.set(cacheKey, { data: fallback.data, timestamp: Date.now() });
    }
    return fallback;
  }

  if (!response.ok || !json.success) {
    return {
      success: false,
      message: (json as ApiErrorResponse).message || "Failed to fetch healthcare listings.",
    };
  }

  const data = (json as HealthcareListingsResponse).data;
  cachedListingsMap.set(cacheKey, { data, timestamp: Date.now() });
  return { success: true, data };
}
