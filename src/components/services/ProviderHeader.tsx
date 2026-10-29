import { Image as ExpoImage } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import {
  BRAND,
  SLATE_900,
  SLATE_500,
  SLATE_100,
  WHITE,
  SUCCESS,
  WEB_FONT,
} from "@/constants/serviceTheme";
import type { ServiceProvider } from "@/data/services";
import { getCategoryBySlug, resolveImage } from "@/data/services";

interface ProviderHeaderProps {
  provider: ServiceProvider;
}

export default function ProviderHeader({ provider }: ProviderHeaderProps) {
  const [imgError, setImgError] = useState(false);
  const imgKey = provider.images?.[0];
  const img = imgKey ? resolveImage(imgKey) : null;
  const categoryInfo = getCategoryBySlug(provider.category);

  return (
    <View>
      {/* Hero image */}
      <View style={s.imgWrap}>
        {img && !imgError ? (
          <ExpoImage
            source={img}
            style={s.img}
            contentFit="cover"
            priority="high"
            cachePolicy="memory-disk"
            transition={200}
            onError={() => setImgError(true)}
            accessibilityLabel={`${provider.name} — demo photo`}
          />
        ) : (
          <View
            style={[
              s.imgPlaceholder,
              { backgroundColor: categoryInfo?.bg ?? "#EFF6FF" },
            ]}
          >
            <View
              style={[
                s.heroIconWrap,
                {
                  backgroundColor: WHITE,
                  borderColor: (categoryInfo?.accent ?? BRAND) + "30",
                },
              ]}
            >
              <Text style={s.imgPlaceholderIcon}>
                {categoryInfo?.icon ?? "🛠️"}
              </Text>
            </View>
          </View>
        )}
        <View style={s.overlay} />
      </View>

      {/* Info card */}
      <View style={s.infoCard}>
        {/* Name + verified (real backend verification only) */}
        <View style={s.nameRow}>
          <Text style={s.name} accessibilityRole="header">
            {provider.name}
          </Text>
          {!provider.isMockData && provider.verified && (
            <View
              style={s.verifiedBadge}
              accessibilityLabel="Verified provider"
            >
              <Text style={s.verifiedIcon}>✓</Text>
              <Text style={s.verifiedLabel}>Verified</Text>
            </View>
          )}
        </View>

        {/* Mock data indicator */}
        {provider.isMockData && (
          <View style={s.mockBadge}>
            <Text style={s.mockText}>Demo Listing</Text>
          </View>
        )}

        {/* Category */}
        <View style={s.catRow}>
          <View style={s.catPill}>
            <Text style={s.catText}>{provider.categoryTitle}</Text>
          </View>
        </View>

        {/* Location */}
        <Text style={s.location} accessibilityLabel={`Location: ${provider.address}`}>
          📍 {provider.address}
        </Text>

        

        {/* Hours */}
        <View style={s.hoursRow}>
          <Text style={s.hoursIcon}>🕐</Text>
          <Text style={s.hoursText}>{provider.openingHours}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  imgWrap: {
    height: 260,
    backgroundColor: SLATE_100,
    overflow: "hidden",
  },
  img: {
    width: "100%",
    height: "100%",
  },
  imgPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  imgPlaceholderIcon: {
    fontSize: 48,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.05)",
  },

  infoCard: {
    backgroundColor: WHITE,
    marginHorizontal: 16,
    marginTop: -32,
    borderRadius: 20,
    padding: 20,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }
      : {}),
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  name: {
    fontSize: 22,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.5,
    ...WEB_FONT,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  verifiedIcon: {
    fontSize: 12,
    color: SUCCESS,
    fontWeight: "900",
  },
  verifiedLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: SUCCESS,
    ...WEB_FONT,
  },
  mockBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  mockText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#92400E",
    ...WEB_FONT,
  },

  catRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  catPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  catText: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND,
    ...WEB_FONT,
  },

  location: {
    fontSize: 13,
    color: SLATE_500,
    marginTop: 10,
    ...WEB_FONT,
  },



  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  hoursIcon: { fontSize: 13 },
  hoursText: {
    fontSize: 13,
    color: SLATE_500,
    ...WEB_FONT,
  },
});
