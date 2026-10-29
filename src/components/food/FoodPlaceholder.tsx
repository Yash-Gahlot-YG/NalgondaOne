import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { getFoodPlaceholder, type FoodPlaceholderConfig } from "@/data/cafes";

export interface FoodPlaceholderProps {
  item: {
    name: string;
    category?: string;
    isVeg?: boolean;
  };
  size?: "medium" | "small" | "mini";
  style?: StyleProp<ViewStyle>;
}

export function FoodPlaceholder({ item, size = "medium", style }: FoodPlaceholderProps) {
  const config: FoodPlaceholderConfig = getFoodPlaceholder(item);

  if (size === "mini") {
    return (
      <View
        style={[
          s.miniWrap,
          { backgroundColor: config.bgColor, borderColor: config.borderColor },
          style,
        ]}
        accessibilityRole="image"
        accessibilityLabel={`${item.name} placeholder`}
      >
        <Text style={s.miniIcon}>{config.icon}</Text>
      </View>
    );
  }

  if (size === "small") {
    return (
      <View
        style={[
          s.smallWrap,
          { backgroundColor: config.bgColor, borderColor: config.borderColor },
          style,
        ]}
        accessibilityRole="image"
        accessibilityLabel={`${item.name} placeholder`}
      >
        <Text style={s.smallIcon}>{config.icon}</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        s.mediumWrap,
        { backgroundColor: config.bgColor, borderColor: config.borderColor },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={`${item.name} placeholder`}
    >
      <Text style={s.mediumIcon}>{config.icon}</Text>
      <View style={[s.badge, { backgroundColor: config.badgeBg }]}>
        <Text style={[s.badgeText, { color: config.textColor }]} numberOfLines={1}>
          {config.label}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  mediumWrap: {
    width: 100,
    height: 86,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 12,
    paddingHorizontal: 4,
    overflow: "hidden",
  },
  mediumIcon: {
    fontSize: 26,
    lineHeight: 30,
    marginBottom: 3,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 92,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.2,
    textAlign: "center",
  },

  smallWrap: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  smallIcon: {
    fontSize: 18,
  },

  miniWrap: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  miniIcon: {
    fontSize: 14,
  },
});
