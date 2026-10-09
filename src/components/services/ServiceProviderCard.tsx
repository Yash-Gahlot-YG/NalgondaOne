import { Image as ExpoImage } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
import {
  BRAND,
  SLATE_900,
  SLATE_700,
  SLATE_500,
  SLATE_200,
  SLATE_100,
  WHITE,
  SUCCESS,
  WEB_FONT,
} from "@/constants/serviceTheme";
import type { ServiceProvider } from "@/data/services";
import { getCategoryBySlug, resolveImage, formatDistance } from "@/data/services";

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  onPress: () => void;
  layout?: "vertical" | "horizontal";
}

export default function ServiceProviderCard({
  provider,
  onPress,
  layout = "vertical",
}: ServiceProviderCardProps) {
  const [imgError, setImgError] = useState(false);
  const imgKey = provider.images?.[0];
  const img = imgKey ? resolveImage(imgKey) : null;
  const isHorizontal = layout === "horizontal";
  const categoryInfo = getCategoryBySlug(provider.category);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        s.card,
        isHorizontal && s.cardHorizontal,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
        Platform.OS === "web" && hovered ? s.cardHovered : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`View ${provider.name}, ${provider.categoryTitle}`}
    >
      {/* Image */}
      <View style={[s.imgWrap, isHorizontal && s.imgWrapHorizontal]}>
        {img && !imgError ? (
          <ExpoImage
            source={img}
            style={s.img}
            contentFit="cover"
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
                s.imgPlaceholderIconWrap,
                {
                  backgroundColor: WHITE,
                  borderColor: (categoryInfo?.accent ?? BRAND) + "30",
                },
              ]}
            >
              <Text style={s.imgPlaceholderText}>
                {categoryInfo?.icon ?? "🛠️"}
              </Text>
            </View>
          </View>
        )}
        {/* Demo badge if mock data */}
        {provider.isMockData && (
          <View style={s.demoBadge}>
            <Text style={s.demoBadgeText}>Demo Listing</Text>
          </View>
        )}
        {/* Distance badge */}
        {typeof provider.distanceKm === "number" && provider.distanceKm >= 0 && (
          <View style={s.distBadge}>
            <Text style={s.distText}>{formatDistance(provider.distanceKm)}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={[s.info, isHorizontal && s.infoHorizontal]}>
        {/* Name + verified (real backend verification only) */}
        <View style={s.nameRow}>
          <Text style={s.name} numberOfLines={1}>
            {provider.name}
          </Text>
          {!provider.isMockData && provider.verified && (
            <View
              style={s.verifiedBadge}
              accessibilityLabel="Verified provider"
            >
              <Text style={s.verifiedText}>✓</Text>
            </View>
          )}
        </View>

        {/* Category */}
        <Text style={s.category}>{provider.categoryTitle}</Text>

        {/* Location */}
        <Text style={s.location} numberOfLines={1}>
          📍 {provider.city}
        </Text>

        {/* Rating row */}
        <View style={s.ratingRow}>
          <Text style={s.ratingStar}>⭐</Text>
          <Text style={s.ratingValue}>{provider.rating}</Text>
          {provider.isMockData ? (
            <Text style={s.mockRatingText}>(Demo)</Text>
          ) : (
            <Text style={s.reviewCount}>({provider.reviewCount})</Text>
          )}
        </View>

        {/* CTA */}
        <View style={s.viewBtn}>
          <Text style={s.viewBtnText}>View Details</Text>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SLATE_200,
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.2s ease, transform 0.15s ease",
        } as any
      : {}),
  },
  cardHovered: {
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 24px rgba(37, 99, 235, 0.10)" } as any
      : {}),
  },
  cardHorizontal: {
    flexDirection: "row",
  },

  /* Image */
  imgWrap: {
    height: 160,
    backgroundColor: SLATE_100,
  },
  imgWrapHorizontal: {
    height: "auto" as any,
    width: 140,
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
  imgPlaceholderIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  imgPlaceholderText: {
    fontSize: 32,
  },
  distBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  distText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: "700",
    ...WEB_FONT,
  },
  demoBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(30, 41, 59, 0.82)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  demoBadgeText: {
    color: "#FEF08A",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2,
    ...WEB_FONT,
  },

  /* Info */
  info: {
    padding: 14,
  },
  infoHorizontal: {
    flex: 1,
    paddingVertical: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: SLATE_900,
    flex: 1,
    ...WEB_FONT,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: SUCCESS,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: "900",
  },
  category: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND,
    marginTop: 3,
    ...WEB_FONT,
  },
  location: {
    fontSize: 12,
    color: SLATE_500,
    marginTop: 4,
    ...WEB_FONT,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  ratingStar: {
    fontSize: 12,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  reviewCount: {
    fontSize: 12,
    color: SLATE_500,
    ...WEB_FONT,
  },
  mockRatingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D97706",
    ...WEB_FONT,
  },

  /* CTA */
  viewBtn: {
    marginTop: 12,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BRAND,
    justifyContent: "center",
    alignItems: "center",
  },
  viewBtnText: {
    color: BRAND,
    fontSize: 12,
    fontWeight: "800",
    ...WEB_FONT,
  },
});
