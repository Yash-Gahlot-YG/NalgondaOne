import React, { useState } from "react";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  WEB_FONT,
  CONTENT_MAX_WIDTH,
  isMobileWidth,
} from "@/constants/serviceTheme";
import { useAddBusiness } from "@/context/AddBusinessContext";
import { BUSINESS_CATEGORIES } from "@/data/business";
import StepIndicator from "@/components/business/StepIndicator";
import BusinessNavHeader from "@/components/business/BusinessNavHeader";
import { SingleImagePicker } from "@/components/business/ImageUploadCard";

const SERVICE_SUGGESTIONS = [
  "Doorstep Service",
  "Emergency 24/7",
  "Installation",
  "Repair & Service",
  "AMC Maintenance",
  "Consultation & Estimate",
];

export default function Step1BusinessDetails() {
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const { formData, updateField, addService, removeService, isStep1Valid } =
    useAddBusiness();

  const [serviceInput, setServiceInput] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const handleContinue = () => {
    if (!isStep1Valid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    router.push("/add-business/location" as any);
  };

  const handleAddService = () => {
    if (serviceInput.trim()) {
      addService(serviceInput.trim());
      setServiceInput("");
    }
  };

  const displayedCategories = showAllCategories
    ? BUSINESS_CATEGORIES
    : BUSINESS_CATEGORIES.slice(0, 12);

  return (
    <View style={s.page}>
      <BusinessNavHeader title="Step 1 — Business Details" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
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
            <StepIndicator currentStep={1} />

            {/* Error banner if invalid and tried to submit */}
            {showErrors && !isStep1Valid && (
              <View style={s.errorBanner}>
                <Text style={s.errorBannerIcon}>⚠️</Text>
                <Text style={s.errorBannerText}>
                  Please fill in all required fields (Business Name and
                  Category) before continuing.
                </Text>
              </View>
            )}

            {/* Form Card */}
            <View style={s.card}>
              <Text style={s.sectionHeading}>Basic Information</Text>

              {/* 1. Business Name * */}
              <View style={s.fieldGroup}>
                <View style={s.labelRow}>
                  <Text style={s.label}>Business Name</Text>
                  <Text style={s.requiredStar}>*</Text>
                </View>
                <TextInput
                  value={formData.businessName}
                  onChangeText={(val) => updateField("businessName", val)}
                  placeholder="e.g. Sri Sai Electrical Works"
                  placeholderTextColor={SLATE_400}
                  style={[
                    s.input,
                    showErrors &&
                      !formData.businessName.trim() &&
                      s.inputError,
                  ]}
                  accessibilityLabel="Business Name"
                />
                {showErrors && !formData.businessName.trim() && (
                  <Text style={s.fieldErrorText}>
                    Business name is required (min 2 characters).
                  </Text>
                )}
              </View>

              {/* 2. Category * */}
              <View style={s.fieldGroup}>
                <View style={s.labelRow}>
                  <Text style={s.label}>Category</Text>
                  <Text style={s.requiredStar}>*</Text>
                </View>
                <Text style={s.subLabel}>
                  Select the category that best matches your service
                </Text>

                <View style={s.categoryGrid}>
                  {displayedCategories.map((cat) => {
                    const isSelected = formData.category === cat.slug;
                    return (
                      <Pressable
                        key={cat.slug}
                        onPress={() => {
                          updateField("category", cat.slug);
                          updateField("categoryTitle", cat.title);
                        }}
                        style={({ pressed, hovered }: any) => [
                          s.categoryChip,
                          isSelected && s.categoryChipSelected,
                          { transform: [{ scale: pressed ? 0.96 : 1 }] },
                          Platform.OS === "web" && hovered && !isSelected
                            ? s.categoryChipHovered
                            : null,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Category: ${cat.title}`}
                      >
                        <Text style={s.categoryChipIcon}>{cat.icon}</Text>
                        <Text
                          style={[
                            s.categoryChipText,
                            isSelected && s.categoryChipTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {cat.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {BUSINESS_CATEGORIES.length > 12 && (
                  <Pressable
                    onPress={() => setShowAllCategories(!showAllCategories)}
                    style={({ pressed }) => [
                      s.toggleCategoriesBtn,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={s.toggleCategoriesText}>
                      {showAllCategories
                        ? "▲ Show Fewer Categories"
                        : `▼ Show All Categories (${BUSINESS_CATEGORIES.length})`}
                    </Text>
                  </Pressable>
                )}

                {showErrors && !formData.category && (
                  <Text style={s.fieldErrorText}>
                    Please select a business category.
                  </Text>
                )}
              </View>

              {/* 3. Short Description */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Short Description</Text>
                <Text style={s.subLabel}>
                  Describe your expertise, experience, and why customers should
                  choose you.
                </Text>
                <TextInput
                  value={formData.description}
                  onChangeText={(val) => updateField("description", val)}
                  placeholder="e.g. Providing trusted residential and commercial electrical wiring and repair services in Nalgonda for over 10 years."
                  placeholderTextColor={SLATE_400}
                  multiline
                  numberOfLines={4}
                  style={[s.input, s.textArea]}
                  accessibilityLabel="Business Description"
                />
              </View>

              {/* 4. Services Offered */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Services Offered</Text>
                <Text style={s.subLabel}>
                  Add specific services you provide (e.g. Fan Repair, Wiring,
                  Inverter Setup)
                </Text>

                <View style={s.addServiceRow}>
                  <TextInput
                    value={serviceInput}
                    onChangeText={setServiceInput}
                    placeholder="Type a service and press Add"
                    placeholderTextColor={SLATE_400}
                    style={[s.input, { flex: 1 }]}
                    onSubmitEditing={handleAddService}
                    accessibilityLabel="Add service input"
                  />
                  <Pressable
                    onPress={handleAddService}
                    style={({ pressed }) => [
                      s.addServiceBtn,
                      { opacity: pressed ? 0.8 : 1 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Add service"
                  >
                    <Text style={s.addServiceBtnText}>+ Add</Text>
                  </Pressable>
                </View>

                {/* Quick suggestions */}
                <View style={s.suggestionsRow}>
                  <Text style={s.suggestionsLabel}>Quick suggestions:</Text>
                  <View style={s.suggestionsList}>
                    {SERVICE_SUGGESTIONS.map((sug) => (
                      <Pressable
                        key={sug}
                        onPress={() => addService(sug)}
                        style={({ pressed }) => [
                          s.suggestionChip,
                          { opacity: pressed ? 0.6 : 1 },
                        ]}
                      >
                        <Text style={s.suggestionChipText}>+ {sug}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Added services tags */}
                {formData.services.length > 0 && (
                  <View style={s.tagsList}>
                    {formData.services.map((svc) => (
                      <View key={svc} style={s.serviceTag}>
                        <Text style={s.serviceTagText}>{svc}</Text>
                        <Pressable
                          onPress={() => removeService(svc)}
                          style={s.removeTagBtn}
                          accessibilityLabel={`Remove ${svc}`}
                        >
                          <Text style={s.removeTagText}>✕</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Photos Card */}
            <View style={s.card}>
              <Text style={s.sectionHeading}>Branding Photos</Text>
              <Text style={s.subLabel}>
                Add your business logo and a cover banner photo (optional).
              </Text>

              {/* 5. Logo */}
              <SingleImagePicker
                label="Business Logo"
                helperText="Square image works best (1:1 ratio)"
                imageUri={formData.logo}
                onImageSelected={(uri) => updateField("logo", uri)}
                onImageRemoved={() => updateField("logo", null)}
                aspectRatio={[1, 1]}
                height={120}
              />

              {/* 6. Cover Photo */}
              <SingleImagePicker
                label="Cover Banner Photo"
                helperText="Wide banner image representing your workshop or storefront (16:9 ratio)"
                imageUri={formData.coverPhoto}
                onImageSelected={(uri) => updateField("coverPhoto", uri)}
                onImageRemoved={() => updateField("coverPhoto", null)}
                aspectRatio={[16, 9]}
                height={160}
              />
            </View>

            {/* Bottom Navigation */}
            <View style={s.bottomNav}>
              <Pressable
                onPress={() => router.push("/services" as any)}
                style={({ pressed }) => [
                  s.cancelBtn,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={s.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleContinue}
                style={({ pressed }) => [
                  s.continueBtn,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Continue to Location & Contact"
              >
                <Text style={s.continueBtnText}>Continue to Step 2 →</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: SLATE_200,
    marginBottom: 20,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 16px rgba(0,0,0,0.03)" }
      : {}),
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "900",
    color: SLATE_900,
    marginBottom: 16,
    letterSpacing: -0.3,
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
  fieldGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  requiredStar: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "900",
  },
  subLabel: {
    fontSize: 12,
    color: SLATE_500,
    marginBottom: 8,
    ...WEB_FONT,
  },
  input: {
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: SLATE_900,
    ...(Platform.OS === "web"
      ? { outlineStyle: "none" as any }
      : {}),
    ...WEB_FONT,
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  fieldErrorText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    ...WEB_FONT,
  },

  /* Categories Grid */
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    backgroundColor: SLATE_50,
    ...(Platform.OS === "web"
      ? { cursor: "pointer", transition: "all 0.15s ease" } as any
      : {}),
  },
  categoryChipHovered: {
    borderColor: BRAND,
    backgroundColor: "#EFF6FF",
  },
  categoryChipSelected: {
    borderColor: BRAND,
    backgroundColor: BRAND,
  },
  categoryChipIcon: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: SLATE_800,
    ...WEB_FONT,
  },
  categoryChipTextSelected: {
    color: WHITE,
  },
  toggleCategoriesBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  toggleCategoriesText: {
    color: BRAND,
    fontSize: 12,
    fontWeight: "700",
    ...WEB_FONT,
  },

  /* Services Tag adder */
  addServiceRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  addServiceBtn: {
    backgroundColor: BRAND,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  addServiceBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "800",
    ...WEB_FONT,
  },
  suggestionsRow: {
    marginTop: 6,
    marginBottom: 8,
  },
  suggestionsLabel: {
    fontSize: 11,
    color: SLATE_400,
    fontWeight: "700",
    marginBottom: 4,
    ...WEB_FONT,
  },
  suggestionsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  suggestionChip: {
    backgroundColor: SLATE_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  suggestionChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  serviceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  serviceTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: BRAND,
    ...WEB_FONT,
  },
  removeTagBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  removeTagText: {
    fontSize: 9,
    fontWeight: "900",
    color: BRAND,
  },

  /* Bottom Nav */
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 40,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    backgroundColor: WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    color: SLATE_700,
    fontSize: 14,
    fontWeight: "800",
    ...WEB_FONT,
  },
  continueBtn: {
    flex: 1,
    backgroundColor: BRAND,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)" }
      : {}),
  },
  continueBtnText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "900",
    ...WEB_FONT,
  },
});
