import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  BRAND,
  BRAND_DARK,
  SLATE_900,
  SLATE_700,
  SLATE_500,
  SLATE_200,
  SLATE_100,
  SLATE_50,
  WHITE,
  WEB_FONT,
} from "@/constants/serviceTheme";
import type { ServiceProvider } from "@/data/services";

interface ProviderLocationMapProps {
  provider: ServiceProvider;
}

export default function ProviderLocationMap({
  provider,
}: ProviderLocationMapProps) {
  const hasCoordinates =
    typeof provider.latitude === "number" &&
    typeof provider.longitude === "number" &&
    (provider.latitude !== 0 || provider.longitude !== 0) &&
    !isNaN(provider.latitude) &&
    !isNaN(provider.longitude);

  const lat = hasCoordinates ? Number(provider.latitude).toFixed(6) : null;
  const lng = hasCoordinates ? Number(provider.longitude).toFixed(6) : null;

  // Build the universal Google Maps link for the external button
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${provider.address}, ${provider.city || "Nalgonda"}`
      )}`;

  // Google Maps embed URL
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapEmbedUrl = hasCoordinates
    ? apiKey
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
          apiKey
        )}&q=${lat},${lng}&zoom=16`
      : `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=16&output=embed`
    : null;

  const handleOpenGoogleMaps = () => {
    Linking.openURL(googleMapsUrl).catch(() => {
      if (Platform.OS === "web") {
        window.open(googleMapsUrl, "_blank");
      }
    });
  };

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle} accessibilityRole="header">
        Location
      </Text>

      {/* ============================================================ */}
      {/* MAP EMBED / FALLBACK                                         */}
      {/* ============================================================ */}
      {hasCoordinates && mapEmbedUrl ? (
        <View style={s.mapFrame}>
          {Platform.OS === "web" ? (
            React.createElement("iframe", {
              title: `Google Maps location for ${provider.name}`,
              src: mapEmbedUrl,
              style: {
                width: "100%",
                height: "100%",
                border: 0,
                borderRadius: 16,
              },
              loading: "lazy",
              allowFullScreen: false,
              referrerPolicy: "no-referrer-when-downgrade",
            })
          ) : (
            <View style={s.nativeMapCard}>
              <Text style={s.nativeMapIcon}>📍</Text>
              <Text style={s.nativeMapCoords}>
                {lat}° N, {lng}° E
              </Text>
              <Text style={s.nativeMapNote}>
                Interactive map available on web. Tap below to open in Google Maps.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={s.fallbackCard}>
          <View style={s.fallbackIconWrap}>
            <Text style={s.fallbackIcon}>📍</Text>
          </View>
          <Text style={s.fallbackTitle}>Location unavailable</Text>
          <Text style={s.fallbackDescription}>
            GPS coordinates are not available for this listing. Please refer to
            the address below.
          </Text>
        </View>
      )}

      {/* ============================================================ */}
      {/* VIEW ON GOOGLE MAPS BUTTON                                   */}
      {/* ============================================================ */}
      <Pressable
        style={({ pressed }) => [
          s.mapBtn,
          { opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={handleOpenGoogleMaps}
        accessibilityRole="button"
        accessibilityLabel={`View ${provider.name} on Google Maps`}
      >
        <Text style={s.mapBtnIcon}>🗺️</Text>
        <Text style={s.mapBtnText}>View on Google Maps →</Text>
      </Pressable>

      {/* ============================================================ */}
      {/* ADDRESS DETAILS                                              */}
      {/* ============================================================ */}
      <View style={s.addressCard}>
        {/* Address */}
        <View style={s.addressRow}>
          <Text style={s.addressRowIcon}>🏢</Text>
          <View style={s.addressContent}>
            <Text style={s.addressLabel}>Address</Text>
            <Text style={s.addressValue}>{provider.address || "Not specified"}</Text>
          </View>
        </View>

        {/* Locality */}
        {Boolean(provider.locality) && (
          <View style={[s.addressRow, s.addressRowDivider]}>
            <Text style={s.addressRowIcon}>🏘️</Text>
            <View style={s.addressContent}>
              <Text style={s.addressLabel}>Locality</Text>
              <Text style={s.addressValue}>{provider.locality}</Text>
            </View>
          </View>
        )}

        {/* City */}
        <View style={[s.addressRow, s.addressRowDivider]}>
          <Text style={s.addressRowIcon}>📍</Text>
          <View style={s.addressContent}>
            <Text style={s.addressLabel}>City</Text>
            <Text style={s.addressValue}>{provider.city || "Nalgonda"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ================================================================ */
/* STYLES                                                            */
/* ================================================================ */

const s = StyleSheet.create({
  container: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: SLATE_900,
    marginBottom: 14,
    letterSpacing: -0.3,
    ...WEB_FONT,
  },

  /* ---- Map Frame ---- */
  mapFrame: {
    height: 320,
    backgroundColor: SLATE_100,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SLATE_200,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)" }
      : { elevation: 2 }),
  },
  nativeMapCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#EFF6FF",
  },
  nativeMapIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  nativeMapCoords: {
    fontSize: 15,
    fontWeight: "800",
    color: BRAND_DARK,
    marginBottom: 6,
    ...WEB_FONT,
  },
  nativeMapNote: {
    fontSize: 13,
    color: SLATE_500,
    textAlign: "center",
    lineHeight: 18,
    ...WEB_FONT,
  },

  /* ---- Fallback Card ---- */
  fallbackCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SLATE_200,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  fallbackIcon: {
    fontSize: 24,
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: SLATE_900,
    marginBottom: 6,
    ...WEB_FONT,
  },
  fallbackDescription: {
    fontSize: 13,
    color: SLATE_500,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 340,
    ...WEB_FONT,
  },

  /* ---- Action Button ---- */
  mapBtn: {
    marginTop: 12,
    height: 46,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: BRAND,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    ...(Platform.OS === "web"
      ? {
          cursor: "pointer" as any,
          transition: "all 0.2s ease" as any,
        }
      : {}),
  },
  mapBtnIcon: {
    fontSize: 16,
  },
  mapBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: BRAND,
    ...WEB_FONT,
  },

  /* ---- Address Card ---- */
  addressCard: {
    marginTop: 16,
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SLATE_200,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 8,
  },
  addressRowDivider: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    marginTop: 4,
    paddingTop: 12,
  },
  addressRowIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: SLATE_500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
    ...WEB_FONT,
  },
  addressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: SLATE_700,
    lineHeight: 20,
    ...WEB_FONT,
  },
});
