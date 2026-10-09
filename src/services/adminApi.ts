import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/config/api";

/* ================================================================ */
/* ADMIN API SERVICE                                                */
/* ================================================================ */

const STORAGE_KEY_TOKEN = "@nalgondaone_admin_token";
const STORAGE_KEY_USER = "@nalgondaone_admin_user";

/* ---------------------------------------------------------------- */
/* TYPES                                                            */
/* ---------------------------------------------------------------- */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
}

export interface LoginResponse {
  success: true;
  message: string;
  data: {
    token: string;
    user: AdminUser;
  };
}

export interface AdminBusiness {
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
  location?: { type: "Point"; coordinates: [number, number] };
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
  createdAt: string;
  updatedAt: string;
}

export interface BusinessStats {
  pending: number;
  approved: number;
  changesRequested: number;
  rejected: number;
  total: number;
}

export interface ApiError {
  success: false;
  message: string;
}

/* ---------------------------------------------------------------- */
/* TOKEN STORAGE                                                    */
/* ---------------------------------------------------------------- */

export async function saveAuthData(
  token: string,
  user: AdminUser
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token);
  await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEY_TOKEN);
}

export async function getStoredUser(): Promise<AdminUser | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearAuthData(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_USER]);
}

/* ---------------------------------------------------------------- */
/* HELPERS                                                          */
/* ---------------------------------------------------------------- */

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getStoredToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  let json: any;
  try {
    json = await response.json();
  } catch {
    throw new Error("Unexpected response from server.");
  }

  if (!response.ok || !json.success) {
    throw new Error(
      json.message || "Something went wrong. Please try again."
    );
  }

  return json as T;
}

/* ---------------------------------------------------------------- */
/* AUTH APIs                                                         */
/* ---------------------------------------------------------------- */

export async function loginAdmin(
  email: string,
  password: string
): Promise<LoginResponse["data"]> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your connection."
    );
  }

  const result = await handleResponse<LoginResponse>(response);

  // Verify role is admin-level
  if (!["admin", "super_admin"].includes(result.data.user.role)) {
    throw new Error("Access denied. Admin privileges required.");
  }

  // Persist token + user
  await saveAuthData(result.data.token, result.data.user);

  return result.data;
}

/* ---------------------------------------------------------------- */
/* ADMIN BUSINESS APIs                                              */
/* ---------------------------------------------------------------- */

export async function fetchBusinessStats(): Promise<BusinessStats> {
  const headers = await authHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/admin/businesses/stats`, {
      headers,
    });
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  const result = await handleResponse<{ success: true; data: BusinessStats }>(
    response
  );
  return result.data;
}

export async function fetchPendingBusinesses(): Promise<AdminBusiness[]> {
  const headers = await authHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/admin/businesses/pending`, {
      headers,
    });
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  const result = await handleResponse<{
    success: true;
    data: AdminBusiness[];
  }>(response);
  return result.data;
}

export async function fetchAllBusinesses(
  status?: string
): Promise<AdminBusiness[]> {
  const headers = await authHeaders();
  const url = status
    ? `${API_BASE_URL}/api/admin/businesses/all?status=${status}`
    : `${API_BASE_URL}/api/admin/businesses/all`;

  let response: Response;
  try {
    response = await fetch(url, { headers });
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  const result = await handleResponse<{
    success: true;
    data: AdminBusiness[];
  }>(response);
  return result.data;
}

export async function fetchBusinessById(
  id: string
): Promise<AdminBusiness> {
  const headers = await authHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/admin/businesses/${id}`, {
      headers,
    });
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  const result = await handleResponse<{ success: true; data: AdminBusiness }>(
    response
  );
  return result.data;
}

export async function approveBusiness(
  id: string,
  adminNotes?: string
): Promise<AdminBusiness> {
  const headers = await authHeaders();

  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/api/admin/businesses/${id}/approve`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ adminNotes: adminNotes || "" }),
      }
    );
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  const result = await handleResponse<{ success: true; data: AdminBusiness }>(
    response
  );
  return result.data;
}

export async function requestBusinessChanges(
  id: string,
  reason: string
): Promise<AdminBusiness> {
  const headers = await authHeaders();

  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/api/admin/businesses/${id}/request-changes`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ reason }),
      }
    );
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  const result = await handleResponse<{ success: true; data: AdminBusiness }>(
    response
  );
  return result.data;
}

export async function rejectBusiness(
  id: string,
  reason: string
): Promise<AdminBusiness> {
  const headers = await authHeaders();

  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/api/admin/businesses/${id}/reject`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ reason }),
      }
    );
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  const result = await handleResponse<{ success: true; data: AdminBusiness }>(
    response
  );
  return result.data;
}

export async function deleteBusiness(
  id: string
): Promise<{ id: string; businessName: string }> {
  const headers = await authHeaders();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/admin/businesses/${id}`, {
      method: "DELETE",
      headers,
    });
  } catch {
    throw new Error("Unable to connect to the server.");
  }

  const result = await handleResponse<{
    success: true;
    message: string;
    data: { id: string; businessName: string };
  }>(response);
  return result.data;
}
