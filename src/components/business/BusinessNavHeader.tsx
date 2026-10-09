import React from "react";
import { router } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  BRAND,
  SLATE_900,
  SLATE_500,
  SLATE_100,
  WHITE,
  WEB_FONT,
  CONTENT_MAX_WIDTH,
} from "@/constants/serviceTheme";

interface BusinessNavHeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export default function BusinessNavHeader({
  title = "Add Business",
  onBack,
  showBack = true,
}: BusinessNavHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/services" as any);
    }
  };

  return (
    <View style={s.header}>
      <View style={s.headerInner}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              s.backBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={s.backArrow}>←</Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}

        <View style={s.centerTitle}>
          <Pressable
            onPress={() => router.push("/")}
            accessibilityRole="link"
            accessibilityLabel="NalgondaOne Home"
          >
            <Text style={s.logoText}>
              Nalgonda<Text style={s.logoAccent}>One</Text>
            </Text>
          </Pressable>
          <Text style={s.headerSubtitle}>{title}</Text>
        </View>

        <Pressable
          onPress={() => router.push("/services" as any)}
          style={({ pressed }) => [
            s.servicesLink,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="link"
          accessibilityLabel="Cancel and return to Services"
        >
          <Text style={s.servicesLinkText}>Services</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    zIndex: 100,
    ...(Platform.OS === "web"
      ? {
          position: "sticky" as any,
          top: 0,
          backdropFilter: "blur(12px)" as any,
          WebkitBackdropFilter: "blur(12px)" as any,
        }
      : {}),
  },
  headerInner: {
    maxWidth: CONTENT_MAX_WIDTH,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: SLATE_100,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 18,
    fontWeight: "800",
    color: SLATE_900,
  },
  centerTitle: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.5,
    ...WEB_FONT,
  },
  logoAccent: {
    color: BRAND,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: SLATE_500,
    marginTop: 1,
    letterSpacing: 0.3,
    ...WEB_FONT,
  },
  servicesLink: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  servicesLinkText: {
    color: BRAND,
    fontSize: 12,
    fontWeight: "800",
    ...WEB_FONT,
  },
});
