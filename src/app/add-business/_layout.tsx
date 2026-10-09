import React, { useEffect } from "react";
import { router, Slot } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AddBusinessProvider } from "@/context/AddBusinessContext";
import { useAuth } from "@/context/AuthContext";
import { BRAND, SLATE_50 } from "@/constants/serviceTheme";

export default function AddBusinessLayout() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth/login?redirectTo=/add-business" as any);
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={BRAND} size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={BRAND} size="large" />
      </View>
    );
  }

  return (
    <AddBusinessProvider>
      <Slot />
    </AddBusinessProvider>
  );
}

const s = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: SLATE_50,
    justifyContent: "center",
    alignItems: "center",
  },
});
