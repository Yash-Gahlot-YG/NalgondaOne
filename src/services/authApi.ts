import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/config/api";

/* ================================================================ */
/* USER AUTH API SERVICE                                            */
/* ================================================================ */

const STORAGE_KEY_TOKEN = "@nalgondaone_user_token";
const STORAGE_KEY_USER = "@nalgondaone_user_profile";

/* ---------------------------------------------------------------- */
/* TYPES                                                            */
/* ---------------------------------------------------------------- */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "super_admin" | "admin" | "business_owner" | "user";
  createdAt?: string;
}

export interface AuthSuccessResponse {
  success: true;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface MeResponse {
  success: true;
  data: {
    user: User;
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/* ---------------------------------------------------------------- */
/* STORAGE HELPERS                                                  */
/* ---------------------------------------------------------------- */

export async function saveUserAuthData(
  token: string,
  user: User
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_TOKEN, token);
  await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

export async function getStoredUserToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEY_TOKEN);
}

export async function getStoredUserProfile(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearUserAuthData(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_USER]);
}

/* ---------------------------------------------------------------- */
/* HTTP HELPERS                                                     */
/* ---------------------------------------------------------------- */

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
/* AUTH API CALLS                                                   */
/* ---------------------------------------------------------------- */

/**
 * Register a new normal user. Public signup strictly registers role = "user".
 */
export async function registerUser(
  payload: RegisterPayload
): Promise<AuthSuccessResponse["data"]> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your internet connection."
    );
  }

  const result = await handleResponse<AuthSuccessResponse>(response);

  // Persist token and user in storage
  await saveUserAuthData(result.data.token, result.data.user);

  return result.data;
}

/**
 * Login user with email and password.
 */
export async function loginUser(
  payload: LoginPayload
): Promise<AuthSuccessResponse["data"]> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your internet connection."
    );
  }

  const result = await handleResponse<AuthSuccessResponse>(response);

  // Persist token and user in storage
  await saveUserAuthData(result.data.token, result.data.user);

  return result.data;
}

/**
 * Fetch currently authenticated user profile (/api/auth/me).
 */
export async function fetchCurrentUser(): Promise<User> {
  const token = await getStoredUserToken();
  if (!token) {
    throw new Error("No active session found.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error("Unable to connect to server.");
  }

  const result = await handleResponse<MeResponse>(response);
  return result.data.user;
}
