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

/** Production backend deployment on Render */
const PRODUCTION_API_URL = "https://nalgondaone.onrender.com";

function getBaseUrl(): string {
  // 1. Environment variable (set in .env, EAS, or deployment platform)
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl && envApiUrl.trim().length > 0) {
    return envApiUrl.trim().replace(/\/+$/, "");
  }

  // 2. Safe default fallback (ensures physical devices, Expo Go, and web never hit 10.0.2.2)
  return PRODUCTION_API_URL;
}

export const API_BASE_URL = getBaseUrl();

