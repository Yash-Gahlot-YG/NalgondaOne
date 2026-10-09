import React from "react";
import { router } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  BRAND,
  SLATE_900,
  SLATE_800,
  SLATE_700,
  SLATE_500,
  SLATE_200,
  SLATE_100,
  SLATE_50,
  WHITE,
  SUCCESS,
  WARNING,
  WEB_FONT,
  CONTENT_MAX_WIDTH,
  isMobileWidth,
} from "@/constants/serviceTheme";
import { useAddBusiness } from "@/context/AddBusinessContext";
import BusinessNavHeader from "@/components/business/BusinessNavHeader";

export default function SubmissionSuccessScreen() {
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const { lastSubmitted, resetForm } = useAddBusiness();

  const handleAddAnother = () => {
    resetForm();
    router.replace("/add-business" as any);
  };

  return (
    <View style={s.page}>
      <BusinessNavHeader title="Submission Successful" showBack={false} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.contentContainer,
          { paddingHorizontal: isMobile ? 16 : 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.containerWrapper}>
          {/* Main Success Card */}
          <View style={s.card}>
            {/* Success icon */}
            <View style={s.iconCircle}>
              <Text style={s.iconCheck}>✓</Text>
            </View>

            <Text style={s.title}>Business Submitted</Text>
            <Text style={s.subText}>
              Your business listing has been submitted successfully and is
              awaiting verification.
            </Text>

            {/* Status Badge */}
            <View style={s.statusBadge}>
              <View style={s.statusDot} />
              <Text style={s.statusText}>Pending Verification</Text>
            </View>

            {/* Submission Details Box */}
            <View style={s.detailsBox}>
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Business Name</Text>
                <Text style={s.detailValue}>
                  {lastSubmitted?.businessName || "Your Business"}
                </Text>
              </View>

              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Category</Text>
                <Text style={s.detailValue}>
                  {lastSubmitted?.categoryTitle || "Service Category"}
                </Text>
              </View>

              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Location</Text>
                <Text style={s.detailValue}>
                  {lastSubmitted?.locality || "Nalgonda"},{" "}
                  {lastSubmitted?.city || "Nalgonda"}
                </Text>
              </View>

              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Contact</Text>
                <Text style={s.detailValue}>
                  {lastSubmitted?.phone || "Phone Number"}
                </Text>
              </View>

              {lastSubmitted?.id && (
                <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={s.detailLabel}>Submission Reference</Text>
                  <Text style={s.detailRefCode}>{lastSubmitted.id}</Text>
                </View>
              )}
            </View>

            {/* What happens next box */}
            <View style={s.nextStepsBox}>
              <Text style={s.nextStepsTitle}>📋 What happens next?</Text>
              <View style={s.stepsList}>
                <View style={s.stepItem}>
                  <View style={s.stepNum}>
                    <Text style={s.stepNumText}>1</Text>
                  </View>
                  <Text style={s.stepItemText}>
                    Our verification team will review your business details and
                    address within 24–48 hours.
                  </Text>
                </View>

                <View style={s.stepItem}>
                  <View style={s.stepNum}>
                    <Text style={s.stepNumText}>2</Text>
                  </View>
                  <Text style={s.stepItemText}>
                    We will verify your contact details to ensure high trust for
                    local Nalgonda residents.
                  </Text>
                </View>

                <View style={s.stepItem}>
                  <View style={s.stepNum}>
                    <Text style={s.stepNumText}>3</Text>
                  </View>
                  <Text style={s.stepItemText}>
                    Once verified, your listing will go live on NalgondaOne with
                    a verified badge.
                  </Text>
                </View>
              </View>
            </View>

            {/* Action buttons */}
            <View style={s.actionsCol}>
              <Pressable
                onPress={() => router.push("/services" as any)}
                style={({ pressed }) => [
                  s.primaryBtn,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Back to Services"
              >
                <Text style={s.primaryBtnText}>Back to Services</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/")}
                style={({ pressed }) => [
                  s.secondaryBtn,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Go to Home"
              >
                <Text style={s.secondaryBtnText}>Go to Home Page</Text>
              </Pressable>

              <Pressable
                onPress={handleAddAnother}
                style={({ pressed }) => [
                  s.textBtn,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Add another business"
              >
                <Text style={s.textBtnText}>+ Add Another Business</Text>
              </Pressable>
            </View>
          </View>
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
  contentContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  containerWrapper: {
    width: "100%",
    maxWidth: 640,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: SLATE_200,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 30px rgba(0,0,0,0.06)" }
      : {}),
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#ECFDF5",
    borderWidth: 2,
    borderColor: "#A7F3D0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCheck: {
    color: SUCCESS,
    fontSize: 32,
    fontWeight: "900",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.5,
    textAlign: "center",
    ...WEB_FONT,
  },
  subText: {
    fontSize: 14,
    color: SLATE_500,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 480,
    ...WEB_FONT,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D97706",
  },
  statusText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "800",
    ...WEB_FONT,
  },

  /* Details box */
  detailsBox: {
    width: "100%",
    backgroundColor: SLATE_50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SLATE_200,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: SLATE_200,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: SLATE_500,
    ...WEB_FONT,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  detailRefCode: {
    fontSize: 11,
    fontWeight: "800",
    color: BRAND,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    ...WEB_FONT,
  },

  /* Next steps */
  nextStepsBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: SLATE_200,
    marginBottom: 24,
  },
  nextStepsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: SLATE_900,
    marginBottom: 12,
    ...WEB_FONT,
  },
  stepsList: {
    gap: 10,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: "900",
    color: BRAND,
  },
  stepItemText: {
    fontSize: 12,
    color: SLATE_700,
    flex: 1,
    lineHeight: 18,
    ...WEB_FONT,
  },

  /* Action buttons */
  actionsCol: {
    width: "100%",
    gap: 10,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: BRAND,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)" }
      : {}),
  },
  primaryBtnText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "900",
    ...WEB_FONT,
  },
  secondaryBtn: {
    width: "100%",
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    paddingVertical: 13,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: {
    color: SLATE_800,
    fontSize: 14,
    fontWeight: "800",
    ...WEB_FONT,
  },
  textBtn: {
    paddingVertical: 8,
    alignSelf: "center",
  },
  textBtnText: {
    color: BRAND,
    fontSize: 13,
    fontWeight: "700",
    ...WEB_FONT,
  },
});
