import React, { useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  BRAND,
  BRAND_DARK,
  SLATE_900,
  SLATE_700,
  SLATE_500,
  SLATE_400,
  SLATE_200,
  SLATE_100,
  SLATE_50,
  WHITE,
  WEB_FONT,
  isMobileWidth,
} from "@/constants/serviceTheme";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLoginScreen() {
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const { login, isAuthenticated, isLoading: authLoading } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  if (authLoading) {
    return (
      <View style={[s.page, s.center]}>
        <ActivityIndicator color={BRAND} size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    // Use setTimeout to avoid state update during render
    setTimeout(() => router.replace("/admin" as any), 0);
    return null;
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      router.replace("/admin" as any);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={s.page}>
      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          { paddingHorizontal: isMobile ? 20 : 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.formCard}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.logoCircle}>
              <Text style={s.logoText}>N1</Text>
            </View>
            <Text style={s.title}>NalgondaOne Admin</Text>
            <Text style={s.subtitle}>
              Sign in to manage business verifications
            </Text>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={s.errorBanner}>
              <Text style={s.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Email */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              placeholder="admin@nalgondaone.com"
              placeholderTextColor={SLATE_400}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Password */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Password</Text>
            <View style={s.passwordRow}>
              <TextInput
                style={[s.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Enter password"
                placeholderTextColor={SLATE_400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                onSubmitEditing={handleLogin}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={s.toggleBtn}
              >
                <Text style={s.toggleBtnText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              s.loginBtn,
              isLoading && s.loginBtnDisabled,
              { opacity: pressed && !isLoading ? 0.85 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            {isLoading ? (
              <View style={s.loadingRow}>
                <ActivityIndicator color={WHITE} size="small" />
                <Text style={s.loginBtnText}>Signing in...</Text>
              </View>
            ) : (
              <Text style={s.loginBtnText}>Sign In</Text>
            )}
          </Pressable>

          {/* Back link */}
          <Pressable
            onPress={() => router.push("/" as any)}
            style={s.backLink}
          >
            <Text style={s.backLinkText}>← Back to NalgondaOne</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: SLATE_900,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  formCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 32,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }
      : {}),
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: BRAND,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    color: WHITE,
    fontSize: 20,
    fontWeight: "900",
    ...WEB_FONT,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.5,
    ...WEB_FONT,
  },
  subtitle: {
    fontSize: 13,
    color: SLATE_500,
    marginTop: 4,
    ...WEB_FONT,
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "700",
    ...WEB_FONT,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: SLATE_700,
    marginBottom: 6,
    ...WEB_FONT,
  },
  input: {
    backgroundColor: SLATE_50,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: SLATE_900,
    ...WEB_FONT,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  toggleBtnText: {
    color: BRAND,
    fontSize: 13,
    fontWeight: "700",
    ...WEB_FONT,
  },
  loginBtn: {
    backgroundColor: BRAND,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)" }
      : {}),
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginBtnText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "900",
    ...WEB_FONT,
  },
  backLink: {
    alignSelf: "center",
    marginTop: 20,
  },
  backLinkText: {
    color: SLATE_500,
    fontSize: 13,
    fontWeight: "600",
    ...WEB_FONT,
  },
});
