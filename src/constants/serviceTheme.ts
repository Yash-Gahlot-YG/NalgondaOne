import { Platform } from "react-native";

/* ================================================================ */
/* NALGONDAONE SERVICES — SHARED DESIGN TOKENS                       */
/* Matches the visual language of the existing Home Page              */
/* ================================================================ */

export const BRAND = "#2563EB";
export const BRAND_DARK = "#1D4ED8";
export const BRAND_LIGHT = "#3B82F6";

export const SLATE_900 = "#0F172A";
export const SLATE_800 = "#1E293B";
export const SLATE_700 = "#334155";
export const SLATE_500 = "#64748B";
export const SLATE_400 = "#94A3B8";
export const SLATE_300 = "#CBD5E1";
export const SLATE_200 = "#E2E8F0";
export const SLATE_100 = "#F1F5F9";
export const SLATE_50 = "#F8FAFC";

export const WHITE = "#FFFFFF";
export const SUCCESS = "#10B981";
export const WARNING = "#F59E0B";

export const WEB_FONT = Platform.select({
  web: {
    fontFamily:
      "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  default: {},
});

export const CONTENT_MAX_WIDTH = 1200;

/* Breakpoint helpers (call with useWindowDimensions().width) */
export const isMobileWidth = (w: number) => w < 700;
export const isTabletWidth = (w: number) => w >= 700 && w < 1050;
