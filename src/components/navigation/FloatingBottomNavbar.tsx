import React from "react";
import { router, usePathname } from "expo-router";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BRAND, WEB_FONT } from "@/constants/serviceTheme";

/* ---------------------------------------------------------------- */
/* SCREENS WHERE THE NAVBAR MUST BE HIDDEN                          */
/* ---------------------------------------------------------------- */
/* Prevent interference with forms, checkout bars, sticky actions,   */
/* cart controls, and admin management.                             */
/* ---------------------------------------------------------------- */
function shouldHideNavbar(pathname: string): boolean {
  if (!pathname) return false;

  // Add Business multi-step form wizard
  if (pathname.startsWith("/add-business")) return true;

  // Food cart & checkout screens with bottom order buttons
  if (pathname === "/food/cart" || pathname.startsWith("/food/cart/")) return true;
  if (pathname === "/food/checkout" || pathname.startsWith("/food/checkout/")) return true;

  // Food detail screen with sticky bottom CartBar
  if (pathname.startsWith("/food/") && pathname !== "/food") return true;

  // Provider detail screen with sticky Call / WhatsApp action buttons
  if (pathname.startsWith("/services/provider/")) return true;

  // Edit business form wizard
  if (pathname.startsWith("/profile/edit-business")) return true;

  // Authentication screens
  if (pathname.startsWith("/auth/")) return true;

  // Admin dashboard and sub-screens
  if (pathname.startsWith("/admin")) return true;

  return false;
}

/* ---------------------------------------------------------------- */
/* ICON COMPONENTS (Pure React Native Views for crisp rendering)     */
/* ---------------------------------------------------------------- */

function HomeIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {/* Roof */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderBottomWidth: 7,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: color,
        }}
      />
      {/* Base */}
      <View
        style={{
          width: 13,
          height: 9,
          backgroundColor: color,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            width: 4,
            height: 4.5,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 1,
            borderTopRightRadius: 1,
          }}
        />
      </View>
    </View>
  );
}

function ExploreIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 2,
          borderColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Top needle */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 3,
            borderRightWidth: 3,
            borderBottomWidth: 5,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: color,
            transform: [{ rotate: "45deg" }],
          }}
        />
        {/* Bottom needle */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 3,
            borderRightWidth: 3,
            borderTopWidth: 5,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: color,
            transform: [{ rotate: "45deg" }],
            marginTop: -1,
          }}
        />
      </View>
    </View>
  );
}

function AddPlusIcon() {
  return (
    <View style={{ width: 18, height: 18, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: 14, height: 2.5, backgroundColor: "#FFFFFF", borderRadius: 1.5 }} />
      <View
        style={{
          position: "absolute",
          width: 2.5,
          height: 14,
          backgroundColor: "#FFFFFF",
          borderRadius: 1.5,
        }}
      />
    </View>
  );
}

function EventsIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {/* Top binder rings */}
      <View
        style={{
          flexDirection: "row",
          width: 12,
          justifyContent: "space-between",
          marginBottom: -2,
          zIndex: 2,
        }}
      >
        <View style={{ width: 2, height: 3, backgroundColor: color, borderRadius: 1 }} />
        <View style={{ width: 2, height: 3, backgroundColor: color, borderRadius: 1 }} />
      </View>
      {/* Calendar body */}
      <View
        style={{
          width: 17,
          height: 15,
          borderRadius: 3.5,
          borderWidth: 1.8,
          borderColor: color,
          overflow: "hidden",
        }}
      >
        <View style={{ height: 3.5, backgroundColor: color }} />
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            flexWrap: "wrap",
            padding: 1.5,
            gap: 1.5,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color }} />
          <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color }} />
          <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color }} />
          <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: color }} />
        </View>
      </View>
    </View>
  );
}

function ProfileIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      {/* Head */}
      <View
        style={{
          width: 7.5,
          height: 7.5,
          borderRadius: 4,
          backgroundColor: color,
          marginBottom: 1.5,
        }}
      />
      {/* Body / Shoulders */}
      <View
        style={{
          width: 14,
          height: 6.5,
          borderTopLeftRadius: 7,
          borderTopRightRadius: 7,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* COMPONENT                                                         */
/* ---------------------------------------------------------------- */

export default function FloatingBottomNavbar() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  // Mobile-only: Hide on desktop screens (>= 768px)
  if (width >= 768) {
    return null;
  }

  // Hide on screens where it would interfere with forms, cart, checkout, or detail actions
  if (shouldHideNavbar(pathname)) {
    return null;
  }

  // Active tab detection
  const isHomeActive = pathname === "/";
  const isExploreActive = pathname === "/explore";
  const isAddActive = pathname.startsWith("/add-business");
  const isEventsActive = pathname === "/events" || pathname.startsWith("/events/");
  const isProfileActive = pathname === "/profile" || pathname.startsWith("/profile/");

  const handleNavigate = (destination: string) => {
    if (pathname === destination) return;
    router.push(destination as any);
  };

  const bottomInset = insets.bottom > 0 ? insets.bottom + 6 : 14;

  return (
    <View style={[s.wrapper, { bottom: bottomInset }]} pointerEvents="box-none">
      <View style={s.container}>
        {/* 1. Home */}
        <Pressable
          style={({ pressed }) => [
            s.tabItem,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => handleNavigate("/")}
          accessibilityRole="tab"
          accessibilityState={{ selected: isHomeActive }}
          accessibilityLabel="Home"
        >
          <HomeIcon color={isHomeActive ? BRAND : "#64748B"} />
          <Text style={[s.label, isHomeActive && s.labelActive]}>Home</Text>
          {isHomeActive && <View style={s.activeDot} />}
        </Pressable>

        {/* 2. Explore (Navigates to existing Explore Nalgonda section) */}
        <Pressable
          style={({ pressed }) => [
            s.tabItem,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => handleNavigate("/explore")}
          accessibilityRole="tab"
          accessibilityState={{ selected: isExploreActive }}
          accessibilityLabel="Explore Nalgonda"
        >
          <ExploreIcon color={isExploreActive ? BRAND : "#64748B"} />
          <Text style={[s.label, isExploreActive && s.labelActive]}>Explore</Text>
          {isExploreActive && <View style={s.activeDot} />}
        </Pressable>

        {/* 3. Add Business (Center Button) */}
        <Pressable
          style={({ pressed }) => [
            s.centerTabItem,
            { transform: [{ scale: pressed ? 0.94 : 1 }] },
          ]}
          onPress={() => handleNavigate("/add-business")}
          accessibilityRole="button"
          accessibilityState={{ selected: isAddActive }}
          accessibilityLabel="Add Business"
        >
          <View style={[s.centerCircle, isAddActive && s.centerCircleActive]}>
            <AddPlusIcon />
          </View>
          <Text style={[s.centerLabel, isAddActive && s.centerLabelActive]}>
            Add Business
          </Text>
        </Pressable>

        {/* 4. Events */}
        <Pressable
          style={({ pressed }) => [
            s.tabItem,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => handleNavigate("/events")}
          accessibilityRole="tab"
          accessibilityState={{ selected: isEventsActive }}
          accessibilityLabel="Events"
        >
          <EventsIcon color={isEventsActive ? BRAND : "#64748B"} />
          <Text style={[s.label, isEventsActive && s.labelActive]}>Events</Text>
          {isEventsActive && <View style={s.activeDot} />}
        </Pressable>

        {/* 5. Profile */}
        <Pressable
          style={({ pressed }) => [
            s.tabItem,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => handleNavigate("/profile")}
          accessibilityRole="tab"
          accessibilityState={{ selected: isProfileActive }}
          accessibilityLabel="Profile"
        >
          <ProfileIcon color={isProfileActive ? BRAND : "#64748B"} />
          <Text style={[s.label, isProfileActive && s.labelActive]}>Profile</Text>
          {isProfileActive && <View style={s.activeDot} />}
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* STYLES                                                            */
/* ---------------------------------------------------------------- */

const s = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 32,
    height: 62,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
    width: "92%",
    maxWidth: 420,
    ...(Platform.OS === "web"
      ? ({
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 30px -4px rgba(15, 23, 42, 0.16), 0 0 1px 1px rgba(0,0,0,0.04)",
        } as any)
      : {
          elevation: 10,
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.14,
          shadowRadius: 12,
        }),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    height: "100%",
    minWidth: 0,
  },
  centerTabItem: {
    flex: 1.25,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  centerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -16,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    ...(Platform.OS === "web"
      ? ({
          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
        } as any)
      : {
          elevation: 6,
          shadowColor: BRAND,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
        }),
  },
  centerCircleActive: {
    backgroundColor: "#1D4ED8",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 3,
    letterSpacing: -0.2,
    ...WEB_FONT,
  },
  labelActive: {
    color: BRAND,
    fontWeight: "800",
  },
  centerLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 2,
    letterSpacing: -0.2,
    ...WEB_FONT,
  },
  centerLabelActive: {
    color: BRAND,
    fontWeight: "800",
  },
  activeDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: BRAND,
    marginTop: 2,
  },
});
