import { Pressable, ScrollView, StyleSheet, Text, Platform } from "react-native";
import {
  BRAND,
  SLATE_500,
  SLATE_100,
  WHITE,
  WEB_FONT,
} from "@/constants/serviceTheme";

interface FilterOption {
  label: string;
  value: string;
}

interface ServiceFilterProps {
  options: FilterOption[];
  activeValue: string;
  onSelect: (value: string) => void;
}

export default function ServiceFilter({
  options,
  activeValue,
  onSelect,
}: ServiceFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.container}
      accessibilityRole="tablist"
    >
      {options.map((opt) => {
        const isActive = opt.value === activeValue;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={({ pressed, hovered }: any) => [
              s.chip,
              isActive ? s.chipActive : s.chipInactive,
              { opacity: pressed ? 0.8 : 1 },
              Platform.OS === "web" && hovered && !isActive ? s.chipHovered : null,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter: ${opt.label}`}
          >
            <Text style={[s.chipText, isActive && s.chipTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: BRAND,
    borderColor: BRAND,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)" }
      : {}),
  },
  chipInactive: {
    backgroundColor: WHITE,
    borderColor: SLATE_100,
  },
  chipHovered: {
    borderColor: "#CBD5E1",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: SLATE_500,
    ...WEB_FONT,
  },
  chipTextActive: {
    color: WHITE,
  },
});
