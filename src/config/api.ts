import { Platform } from "react-native";

/* ================================================================ */
/* CENTRAL API CONFIGURATION                                        */
/* ================================================================ */
/* Single source of truth for the backend API URL.                  */
/*                                                                  */
/* - Web: localhost works fine.                                     */
/* - Android Emulator: 10.0.2.2 maps to the host machine.          */
/* - iOS Simulator: localhost works.                                */
/* - Physical devices: Change DEV_MACHINE_IP to your LAN IP.       */
/* - Production: Set PRODUCTION_API_URL.                            */
/* ================================================================ */

/** Set this to your development machine's LAN IP for physical device testing */
const DEV_MACHINE_IP = "localhost";
const DEV_PORT = "5000";

function getBaseUrl(): string {
  // 1. Environment variable (set in production / EAS / .env)
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl && envApiUrl.trim().length > 0) {
    return envApiUrl.trim().replace(/\/+$/, "");
  }

  // 2. Development fallbacks
  if (Platform.OS === "web") {
    return `http://localhost:${DEV_PORT}`;
  }

  if (Platform.OS === "android") {
    // Android emulator uses 10.0.2.2 to reach host machine
    // For physical devices, use DEV_MACHINE_IP (set to your LAN IP)
    const host =
      DEV_MACHINE_IP === "localhost" ? "10.0.2.2" : DEV_MACHINE_IP;
    return `http://${host}:${DEV_PORT}`;
  }

  // iOS simulator — localhost works; physical devices need LAN IP
  const host = DEV_MACHINE_IP;
  return `http://${host}:${DEV_PORT}`;
}

export const API_BASE_URL = getBaseUrl();

