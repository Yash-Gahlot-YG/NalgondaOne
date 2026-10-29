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
  width?: number | string;
  height?: number;
}

export default function ServiceCategoryCard({
  category,
  onPress,
  size = "normal",
  width: widthProp,
  height: heightProp,
}: ServiceCategoryCardProps) {
  const isCompact = size === "compact";
  const cardWidth = widthProp ?? (isCompact ? 116 : 140);
  const cardHeight = heightProp ?? (isCompact ? 116 : 124);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        s.card,
        {
          backgroundColor: category.bg,
          borderColor: category.accent + "25",
          width: cardWidth as any,
          height: cardHeight,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        Platform.OS === "web" && hovered ? (s.cardHovered as any) : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${category.title} — ${category.providerCount} providers`}
    >
      {/* Decorative accent circle in top corner */}
      <View
        style={[
          s.accentCircle,
          { backgroundColor: category.accent + "14" },
        ]}
      />

      {/* Top row: Icon on left, Arrow on right */}
      <View style={s.topRow}>
        <View
          style={[
            s.iconWrap,
            {
              backgroundColor: WHITE,
              borderColor: category.accent + "20",
              width: isCompact ? 36 : 40,
              height: isCompact ? 36 : 40,
            },
          ]}
        >
          <Text style={[s.icon, { fontSize: isCompact ? 18 : 20 }]}>
            {category.icon}
          </Text>
        </View>

        <View
          style={[
            s.arrowCircle,
            {
              backgroundColor: category.accent + "15",
              borderColor: category.accent + "25",
            },
          ]}
        >
          <Text style={[s.arrow, { color: category.accent }]}>→</Text>
        </View>
      </View>

      {/* Bottom section: Category title */}
      <View style={s.bottomContent}>
        <Text
          style={[
            s.title,
            {
              fontSize: isCompact ? 11.5 : 12.5,
            },
          ]}
          numberOfLines={2}
        >
          {category.title}
        </Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
    ...(Platform.OS === "web"
      ? ({
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          transition: "transform 0.15s ease, box-shadow 0.2s ease",
          cursor: "pointer",
        } as any)
      : {
          elevation: 1,
        }),
  },
  cardHovered: {
    ...(Platform.OS === "web"
      ? ({ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" } as any)
      : {}),
  },
  accentCircle: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -18,
    right: -18,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  iconWrap: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }
      : {}),
  },
  icon: {},
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  arrow: {
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 14,
  },
  bottomContent: {
    justifyContent: "flex-end",
    minHeight: 32,
    zIndex: 2,
  },
  title: {
    fontWeight: "800",
    color: SLATE_800,
    lineHeight: 16,
    letterSpacing: -0.2,
    ...WEB_FONT,
  },
});
