import { Pressable, StyleSheet, Text, TextInput, View, Platform } from "react-native";
import {
  BRAND,
  SLATE_400,
  SLATE_900,
  SLATE_200,
  WHITE,
  WEB_FONT,
} from "@/constants/serviceTheme";

interface ServiceSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export default function ServiceSearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Search services or providers...",
}: ServiceSearchBarProps) {
  return (
    <View style={s.container}>
      <Text style={s.icon} accessibilityElementsHidden>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={SLATE_400}
        style={s.input as any}
        returnKeyType="search"
        accessibilityLabel="Search services and providers"
        accessibilityHint="Type a service name, provider name, or category"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText("")}
          style={({ pressed }) => [s.clearBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Text style={s.clearText}>✕</Text>
        </Pressable>
      )}
      <Pressable
        onPress={onSubmit}
        style={({ pressed }) => [s.searchBtn, { opacity: pressed ? 0.85 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel="Submit search"
      >
        <Text style={s.searchBtnText}>Search</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SLATE_200,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 5,
    width: "100%",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 4px 16px rgba(37, 99, 235, 0.06)",
          boxSizing: "border-box" as any,
        }
      : {}),
  },
  icon: {
    fontSize: 22,
    color: SLATE_400,
    marginRight: 8,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    flexGrow: 1,
    height: "100%",
    fontSize: 14,
    color: SLATE_900,
    ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : {}),
    ...WEB_FONT,
  } as any,
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    flexShrink: 0,
  },
  clearText: {
    fontSize: 12,
    color: SLATE_400,
    fontWeight: "700",
  },
  searchBtn: {
    height: 44,
    paddingHorizontal: 18,
    backgroundColor: BRAND,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  searchBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "800",
    ...WEB_FONT,
  },
});
