import { Image as ExpoImage } from "expo-image";
import { useState, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, Platform } from "react-native";
import { SLATE_100, SLATE_500, SLATE_200, WEB_FONT } from "@/constants/serviceTheme";
import { resolveImage } from "@/data/services";

interface ProviderGalleryProps {
  images: string[];
  providerName: string;
  isMockData?: boolean;
}

function GalleryImage({ imageKey, index, providerName, isMockData }: { imageKey: string; index: number; providerName: string; isMockData?: boolean }) {
  const [error, setError] = useState(false);
  const source = resolveImage(imageKey);

  if (!source || error) {
    return (
      <View style={[s.imageWrap, s.imageFallback]}>
        <Text style={s.fallbackIcon}>📷</Text>
        <Text style={s.fallbackText}>Photo {index + 1}</Text>
      </View>
    );
  }

  return (
    <View style={s.imageWrap}>
      <ExpoImage
        source={source}
        style={s.image}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
        onError={() => setError(true)}
        accessibilityLabel={`${providerName} — demo photo ${index + 1}`}
      />
      {/* Demo overlay label — only for mock/placeholder images */}
      {isMockData && (
        <View style={s.demoLabel}>
          <Text style={s.demoLabelText}>Demo</Text>
        </View>
      )}
    </View>
  );
}

export default function ProviderGallery({
  images,
  providerName,
  isMockData,
}: ProviderGalleryProps) {
  // Filter to unique keys only — no duplicating the same image
  const uniqueImages = [...new Set(images)];

  if (uniqueImages.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyIcon}>📷</Text>
        <Text style={s.emptyText}>No photos available yet</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.container}
    >
      {uniqueImages.map((key, idx) => (
        <GalleryImage
          key={`${key}-${idx}`}
          imageKey={key}
          index={idx}
          providerName={providerName}
          isMockData={isMockData}
        />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 10,
    paddingVertical: 4,
  },
  imageWrap: {
    width: 200,
    height: 140,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: SLATE_100,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }
      : {}),
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  fallbackIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  fallbackText: {
    fontSize: 11,
    color: SLATE_500,
    ...WEB_FONT,
  },
  demoLabel: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  demoLabelText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
    ...WEB_FONT,
  },
  empty: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyText: {
    fontSize: 13,
    color: SLATE_500,
    ...WEB_FONT,
  },
});
