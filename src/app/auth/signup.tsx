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
import { useAuth } from "@/context/AuthContext";

import { useLocalSearchParams } from "expo-router";

export default function SignupScreen() {
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();
  const { register: signup, isAuthenticated, loading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to destination or home
  if (authLoading) {
    return (
      <View style={[s.page, s.center]}>
        <ActivityIndicator color={BRAND} size="large" />
      </View>
    );
  }

  const targetPath = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/";

  if (isAuthenticated) {
    setTimeout(() => router.replace(targetPath as any), 0);
    return null;
  }

  const handleSignup = async () => {
    // 1. Validations
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await signup(name.trim(), email.trim(), password, phone.trim());
      router.replace(targetPath as any);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
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
            <Pressable onPress={() => router.push("/" as any)} style={s.logoCircle}>
              <Text style={s.logoText}>N1</Text>
            </Pressable>
            <Text style={s.title}>Create an Account</Text>
            <Text style={s.subtitle}>
              Join NalgondaOne to explore and connect locally
            </Text>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={s.errorBanner}>
              <Text style={s.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* Full Name */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>
              Full Name <Text style={s.req}>*</Text>
            </Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Ramesh Reddy"
              placeholderTextColor={SLATE_400}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError(null);
              }}
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          {/* Email */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>
              Email Address <Text style={s.req}>*</Text>
            </Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor={SLATE_400}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Phone (Optional) */}
          <View style={s.fieldGroup}>
            <View style={s.labelRow}>
              <Text style={s.label}>Phone Number</Text>
              <Text style={s.optTag}>Optional</Text>
            </View>
            <TextInput
              style={s.input}
              placeholder="+91 98765 43210"
              placeholderTextColor={SLATE_400}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (error) setError(null);
              }}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          {/* Password */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>
              Password <Text style={s.req}>*</Text>
            </Text>
            <View style={s.passwordRow}>
              <TextInput
                style={[s.input, { flex: 1, marginBottom: 0 }]}
                placeholder="At least 8 characters"
                placeholderTextColor={SLATE_400}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(null);
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={s.toggleBtn}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <Text style={s.toggleBtnText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>
              Confirm Password <Text style={s.req}>*</Text>
            </Text>
            <View style={s.passwordRow}>
              <TextInput
                style={[s.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Re-type password"
                placeholderTextColor={SLATE_400}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (error) setError(null);
                }}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
                onSubmitEditing={handleSignup}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={s.toggleBtn}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                <Text style={s.toggleBtnText}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Signup Button */}
          <Pressable
            onPress={handleSignup}
            disabled={isLoading}
            style={({ pressed }) => [
              s.signupBtn,
              isLoading && s.signupBtnDisabled,
              { opacity: pressed && !isLoading ? 0.85 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            {isLoading ? (
              <View style={s.loadingRow}>
                <ActivityIndicator color={WHITE} size="small" />
                <Text style={s.signupBtnText}>Creating account...</Text>
              </View>
            ) : (
              <Text style={s.signupBtnText}>Create Account</Text>
            )}
          </Pressable>

          {/* Login Link */}
          <View style={s.footerRow}>
            <Text style={s.footerText}>Already have an account?</Text>
            <Pressable
              onPress={() =>
                router.push(
                  redirectTo
                    ? (`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}` as any)
                    : ("/auth/login" as any)
                )
              }
              style={s.inlineLink}
            >
              <Text style={s.inlineLinkText}>Sign In</Text>
            </Pressable>
          </View>

          {/* Back link */}
          <Pressable
            onPress={() => router.push("/" as any)}
            style={s.backLink}
          >
            <Text style={s.backLinkText}>← Back to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: SLATE_50,
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
    maxWidth: 440,
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: SLATE_200,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)" }
      : {}),
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
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
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: SLATE_700,
    marginBottom: 6,
    ...WEB_FONT,
  },
  req: {
    color: "#EF4444",
  },
  optTag: {
    fontSize: 11,
    color: SLATE_400,
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
    backgroundColor: SLATE_50,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    borderRadius: 12,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toggleBtnText: {
    color: BRAND,
    fontSize: 13,
    fontWeight: "700",
    ...WEB_FONT,
  },
  signupBtn: {
    backgroundColor: BRAND,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)" }
      : {}),
  },
  signupBtnDisabled: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  signupBtnText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "900",
    ...WEB_FONT,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  footerText: {
    color: SLATE_500,
    fontSize: 13,
    ...WEB_FONT,
  },
  inlineLink: {
    paddingVertical: 4,
  },
  inlineLinkText: {
    color: BRAND,
    fontSize: 13,
    fontWeight: "700",
    ...WEB_FONT,
  },
  backLink: {
    alignSelf: "center",
    marginTop: 16,
  },
  backLinkText: {
    color: SLATE_400,
    fontSize: 13,
    fontWeight: "600",
    ...WEB_FONT,
  },
});
