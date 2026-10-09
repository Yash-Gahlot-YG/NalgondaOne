import { Pressable, StyleSheet, Text, View, Platform } from "react-native";
import {
  SLATE_800,
  WHITE,
  WEB_FONT,
} from "@/constants/serviceTheme";
import type { ServiceCategory } from "@/data/services";

interface ServiceCategoryCardProps {
  category: ServiceCategory;
  onPress: () => void;
  size?: "normal" | "compact";
}

export default function ServiceCategoryCard({
  category,
  onPress,
  size = "normal",
}: ServiceCategoryCardProps) {
  const isCompact = size === "compact";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        s.card,
        {
          backgroundColor: category.bg,
          borderColor: category.accent + "20",
          width: isCompact ? 110 : 140,
          height: isCompact ? 110 : 130,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        Platform.OS === "web" && hovered ? s.cardHovered : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${category.title} — ${category.providerCount} providers`}
    >
      {/* Decorative accent circle */}
      <View
        style={[
          s.accentCircle,
          { backgroundColor: category.accent + "12" },
        ]}
      />

      <View
        style={[
          s.iconWrap,
          {
            backgroundColor: WHITE,
            borderColor: category.accent + "18",
            width: isCompact ? 38 : 44,
            height: isCompact ? 38 : 44,
          },
        ]}
      >
        <Text style={[s.icon, { fontSize: isCompact ? 18 : 22 }]}>
          {category.icon}
        </Text>
      </View>

      <Text
        style={[s.title, { fontSize: isCompact ? 11 : 12.5 }]}
        numberOfLines={2}
      >
        {category.title}
      </Text>

      <View style={[s.arrowCircle, { backgroundColor: category.accent + "12" }]}>
        <Text style={[s.arrow, { color: category.accent }]}>→</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    justifyContent: "space-between",
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
          transition: "transform 0.15s ease, box-shadow 0.2s ease",
        } as any
      : {}),
  },
  cardHovered: {
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" } as any
      : {}),
  },
  accentCircle: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    top: -25,
    right: -25,
  },
  iconWrap: {
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }
      : {}),
  },
  icon: {},
  title: {
    fontWeight: "800",
    color: SLATE_800,
    marginTop: 8,
    ...WEB_FONT,
  },
  arrowCircle: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 13,
    fontWeight: "800",
  },
});
