import React, { useState } from "react";
import { router } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import {
  ActivityIndicator,
  Alert,
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
  SLATE_400,
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
import { clearBusinessDraft, BusinessSubmission } from "@/data/business";
import { createBusiness } from "@/services/businessApi";
import { uploadAllBusinessImages } from "@/services/uploadApi";
import StepIndicator from "@/components/business/StepIndicator";
import BusinessNavHeader from "@/components/business/BusinessNavHeader";

export default function PreviewScreen() {
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const {
    formData,
    isStep1Valid,
    isStep2Valid,
    setLastSubmitted,
    isSubmitting,
    setIsSubmitting,
  } = useAddBusiness();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitStage, setSubmitStage] = useState<
    "idle" | "uploading" | "submitting" | "success"
  >("idle");

  const handleSubmit = async () => {
    // Validate again
    if (!isStep1Valid || !isStep2Valid) {
      const msg =
        "Some required fields are missing. Please go back and ensure Business Name, Category, Address, and Phone are filled.";
      setErrorMessage(msg);
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Incomplete Submission", msg);
      }
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    setSubmitStage("uploading");

    try {
      // 1. Upload local images to backend -> Cloudinary
      const uploadedImages = await uploadAllBusinessImages({
        logo: formData.logo,
        coverPhoto: formData.coverPhoto,
        businessPhotos: formData.businessPhotos,
      });

      // 2. Submit business data with Cloudinary URLs to MongoDB
      setSubmitStage("submitting");
      const submissionPayload = {
        ...formData,
        logo: uploadedImages.logo,
        coverPhoto: uploadedImages.coverPhoto,
        businessPhotos: uploadedImages.businessPhotos,
      };

      const businessDoc = await createBusiness(submissionPayload);

      setSubmitStage("success");

      // Map the API response to the existing BusinessSubmission shape
      // so the success screen works without any changes
      const submission: BusinessSubmission = {
        ...submissionPayload,
        id: businessDoc._id,
        status: businessDoc.status === "pending" ? "pending" : "pending",
        verified: businessDoc.verified,
        createdAt: businessDoc.createdAt,
      };

      setLastSubmitted(submission);

      // Clear the local draft since submission succeeded
      await clearBusinessDraft();

      setIsSubmitting(false);
      setSubmitStage("idle");

      // Navigate to success screen
      router.replace("/add-business/success" as any);
    } catch (err) {
      setIsSubmitting(false);
      setSubmitStage("idle");
      const errMsg =
        err instanceof Error
          ? err.message
          : "Failed to submit business. Please try again.";
      setErrorMessage(errMsg);
      if (Platform.OS === "web") {
        window.alert(errMsg);
      } else {
        Alert.alert("Submission Error", errMsg);
      }
    }
  };

  const hoursDisplay = formData.is24Hours
    ? "Open 24 Hours / 7 Days a Week"
    : `${formData.openingTime || "09:00 AM"} – ${formData.closingTime || "08:00 PM"}`;

  const closedDaysDisplay =
    formData.closedDays.length > 0
      ? `Closed on ${formData.closedDays.join(", ")}`
      : "Open all days";

  return (
    <View style={s.page}>
      <BusinessNavHeader
        title="Step 4 — Preview Listing"
        onBack={() => router.back()}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.contentContainer,
          { paddingHorizontal: isMobile ? 16 : 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.formWrapper}>
          {/* Step Indicator */}
          <StepIndicator currentStep={4} />

          {/* Draft Status Banner */}
          <View style={s.statusBanner}>
            <View style={s.statusBadge}>
              <Text style={s.statusBadgeText}>Draft Preview</Text>
            </View>
            <Text style={s.statusBannerText}>
              Review how your business listing will look on NalgondaOne before
              submitting for verification.
            </Text>
          </View>

          {errorMessage && (
            <View style={s.errorBanner}>
              <Text style={s.errorBannerIcon}>⚠️</Text>
              <Text style={s.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* ============================================================ */}
          {/* LISTING PREVIEW CARD                                          */}
          {/* ============================================================ */}
          <View style={s.previewCard}>
            {/* Cover photo or Placeholder */}
            <View style={s.coverWrap}>
              {formData.coverPhoto ? (
                <ExpoImage
                  source={{ uri: formData.coverPhoto }}
                  style={s.coverImage}
                  contentFit="cover"
                />
              ) : (
                <View style={s.coverPlaceholder}>
                  <Text style={s.coverPlaceholderIcon}>🏢</Text>
                  <Text style={s.coverPlaceholderText}>
                    {formData.categoryTitle || "Business"} Banner
                  </Text>
                </View>
              )}

              {/* Status pill on image */}
              <View style={s.draftOverlayPill}>
                <Text style={s.draftOverlayText}>Pending Verification</Text>
              </View>
            </View>

            {/* Header info */}
            <View style={s.infoSection}>
              <View style={s.logoAndTitleRow}>
                {/* Logo */}
                {formData.logo ? (
                  <ExpoImage
                    source={{ uri: formData.logo }}
                    style={s.logoImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={s.logoPlaceholder}>
                    <Text style={s.logoPlaceholderText}>
                      {formData.businessName ? formData.businessName[0] : "B"}
                    </Text>
                  </View>
                )}

                {/* Title & Category */}
                <View style={{ flex: 1 }}>
                  <Text style={s.businessName}>
                    {formData.businessName || "Business Name"}
                  </Text>
                  <View style={s.categoryPill}>
                    <Text style={s.categoryPillText}>
                      {formData.categoryTitle || "General Category"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Location */}
              <Text style={s.locationText}>
                📍 {formData.address || "Address"},{" "}
                {formData.locality || "Locality"},{" "}
                {formData.city || "Nalgonda"}{" "}
                {formData.pincode ? `- ${formData.pincode}` : ""}
              </Text>

              {/* Contact numbers */}
              <View style={s.contactRow}>
                <View style={s.contactItem}>
                  <Text style={s.contactLabel}>Phone:</Text>
                  <Text style={s.contactValue}>
                    {formData.phone || "Not provided"}
                  </Text>
                </View>
                {formData.whatsapp ? (
                  <View style={s.contactItem}>
                    <Text style={s.contactLabel}>WhatsApp:</Text>
                    <Text style={s.contactValue}>{formData.whatsapp}</Text>
                  </View>
                ) : null}
              </View>

              {formData.email ? (
                <Text style={s.secondaryContact}>
                  ✉️ {formData.email}
                </Text>
              ) : null}

              {formData.website ? (
                <Text style={s.secondaryContact}>
                  🌐 {formData.website}
                </Text>
              ) : null}
            </View>

            {/* Description */}
            {formData.description ? (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>About</Text>
                <Text style={s.descriptionText}>{formData.description}</Text>
              </View>
            ) : null}

            {/* Services Offered */}
            {formData.services.length > 0 && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Services Offered</Text>
                <View style={s.servicesGrid}>
                  {formData.services.map((svc, i) => (
                    <View key={i} style={s.serviceTag}>
                      <Text style={s.serviceTagDot}>•</Text>
                      <Text style={s.serviceTagText}>{svc}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Working Hours */}
            <View style={s.sectionBlock}>
              <Text style={s.sectionHeading}>Business Hours</Text>
              <View style={s.hoursBox}>
                <Text style={s.hoursTimeText}>🕐 {hoursDisplay}</Text>
                <Text style={s.hoursClosedText}>🗓️ {closedDaysDisplay}</Text>
              </View>
            </View>

            {/* Business Photos */}
            {formData.businessPhotos.length > 0 && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>
                  Photos ({formData.businessPhotos.length})
                </Text>
                <View style={s.photosGrid}>
                  {formData.businessPhotos.map((uri, idx) => (
                    <View key={idx} style={s.galleryItem}>
                      <ExpoImage
                        source={{ uri }}
                        style={s.galleryImage}
                        contentFit="cover"
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Disclaimer */}
            <View style={s.previewDisclaimer}>
              <Text style={s.previewDisclaimerText}>
                ℹ️ Once submitted, our team will review the details. Your
                listing will remain in "Pending Verification" status until
                approved.
              </Text>
            </View>
          </View>

          {/* ============================================================ */}
          {/* BOTTOM ACTIONS                                               */}
          {/* ============================================================ */}
          <View style={s.bottomNav}>
            <Pressable
              onPress={() => router.push("/add-business" as any)}
              style={({ pressed }) => [
                s.editBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Back to edit business details"
            >
              <Text style={s.editBtnText}>✏️ Edit Details</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={({ pressed }) => [
                s.submitBtn,
                isSubmitting && s.submitBtnDisabled,
                { opacity: pressed && !isSubmitting ? 0.85 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Submit business for verification"
            >
              {isSubmitting ? (
                <View style={s.submittingRow}>
                  <ActivityIndicator color={WHITE} size="small" />
                  <Text style={s.submitBtnText}>
                    {submitStage === "uploading"
                      ? "Uploading images..."
                      : submitStage === "success"
                      ? "Business Submitted Successfully"
                      : "Submitting business..."}
                  </Text>
                </View>
              ) : (
                <Text style={s.submitBtnText}>Submit for Verification ✓</Text>
              )}
            </Pressable>
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
    paddingVertical: 24,
    alignItems: "center",
  },
  formWrapper: {
    width: "100%",
    maxWidth: 720,
  },
  statusBanner: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: BRAND,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: "900",
    ...WEB_FONT,
  },
  statusBannerText: {
    color: SLATE_700,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    lineHeight: 18,
    ...WEB_FONT,
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  errorBannerIcon: {
    fontSize: 20,
  },
  errorBannerText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    ...WEB_FONT,
  },

  /* Preview Card */
  previewCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SLATE_200,
    marginBottom: 20,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }
      : {}),
  },
  coverWrap: {
    height: 180,
    backgroundColor: SLATE_100,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
  },
  coverPlaceholderIcon: {
    fontSize: 40,
  },
  coverPlaceholderText: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND,
    marginTop: 4,
    ...WEB_FONT,
  },
  draftOverlayPill: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  draftOverlayText: {
    color: "#FEF08A",
    fontSize: 11,
    fontWeight: "800",
    ...WEB_FONT,
  },

  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: SLATE_100,
  },
  logoAndTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: WHITE,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: BRAND,
    justifyContent: "center",
    alignItems: "center",
  },
  logoPlaceholderText: {
    color: WHITE,
    fontSize: 24,
    fontWeight: "900",
  },
  businessName: {
    fontSize: 20,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.3,
    ...WEB_FONT,
  },
  categoryPill: {
    backgroundColor: "#EFF6FF",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  categoryPillText: {
    color: BRAND,
    fontSize: 11,
    fontWeight: "700",
    ...WEB_FONT,
  },
  locationText: {
    fontSize: 13,
    color: SLATE_700,
    fontWeight: "600",
    marginBottom: 10,
    ...WEB_FONT,
  },
  contactRow: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
    marginTop: 4,
  },
  contactItem: {
    flexDirection: "row",
    gap: 6,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: SLATE_500,
    ...WEB_FONT,
  },
  contactValue: {
    fontSize: 12,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  secondaryContact: {
    fontSize: 12,
    color: SLATE_500,
    marginTop: 6,
    ...WEB_FONT,
  },

  sectionBlock: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: SLATE_100,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: SLATE_900,
    marginBottom: 10,
    ...WEB_FONT,
  },
  descriptionText: {
    fontSize: 13,
    color: SLATE_700,
    lineHeight: 20,
    ...WEB_FONT,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: SLATE_100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  serviceTagDot: {
    color: BRAND,
    fontWeight: "900",
  },
  serviceTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: SLATE_800,
    ...WEB_FONT,
  },
  hoursBox: {
    backgroundColor: SLATE_50,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SLATE_200,
    gap: 6,
  },
  hoursTimeText: {
    fontSize: 13,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  hoursClosedText: {
    fontSize: 12,
    color: SLATE_500,
    ...WEB_FONT,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  galleryItem: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  previewDisclaimer: {
    backgroundColor: "#FFFBEB",
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#FEF3C7",
  },
  previewDisclaimerText: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "600",
    lineHeight: 16,
    ...WEB_FONT,
  },

  /* Bottom Nav */
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    gap: 12,
  },
  editBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    backgroundColor: WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnText: {
    color: SLATE_700,
    fontSize: 14,
    fontWeight: "800",
    ...WEB_FONT,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: SUCCESS,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)" }
      : {}),
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submittingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitBtnText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "900",
    ...WEB_FONT,
  },
});
