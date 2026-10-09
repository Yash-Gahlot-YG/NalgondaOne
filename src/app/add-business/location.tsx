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
import { NALGONDA_AREAS } from "@/data/business";
import StepIndicator from "@/components/business/StepIndicator";
import BusinessNavHeader from "@/components/business/BusinessNavHeader";

export default function Step2LocationContact() {
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const { formData, updateField, isStep2Valid } = useAddBusiness();

  const [showErrors, setShowErrors] = useState(false);
  const [sameAsPhone, setSameAsPhone] = useState(
    Boolean(formData.whatsapp && formData.whatsapp === formData.phone)
  );

  const handleContinue = () => {
    if (!isStep2Valid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    router.push("/add-business/photos" as any);
  };

  const handlePhoneChange = (val: string) => {
    updateField("phone", val);
    if (sameAsPhone) {
      updateField("whatsapp", val);
    }
  };

  const handleSameAsPhoneToggle = () => {
    const next = !sameAsPhone;
    setSameAsPhone(next);
    if (next) {
      updateField("whatsapp", formData.phone);
    }
  };

  return (
    <View style={s.page}>
      <BusinessNavHeader
        title="Step 2 — Location & Contact"
        onBack={() => router.back()}
      />

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
            <StepIndicator currentStep={2} />

            {/* Error banner */}
            {showErrors && !isStep2Valid && (
              <View style={s.errorBanner}>
                <Text style={s.errorBannerIcon}>⚠️</Text>
                <Text style={s.errorBannerText}>
                  Please fill in Address, Locality, and a valid 10-digit Phone
                  number to continue.
                </Text>
              </View>
            )}

            {/* Location Card */}
            <View style={s.card}>
              <Text style={s.sectionHeading}>📍 Business Location</Text>

              {/* 1. Address * */}
              <View style={s.fieldGroup}>
                <View style={s.labelRow}>
                  <Text style={s.label}>Shop / Office Address</Text>
                  <Text style={s.requiredStar}>*</Text>
                </View>
                <TextInput
                  value={formData.address}
                  onChangeText={(val) => updateField("address", val)}
                  placeholder="e.g. Shop No. 12, Near Bus Stand, Main Road"
                  placeholderTextColor={SLATE_400}
                  style={[
                    s.input,
                    showErrors && !formData.address.trim() && s.inputError,
                  ]}
                  accessibilityLabel="Shop or Office Address"
                />
                {showErrors && !formData.address.trim() && (
                  <Text style={s.fieldErrorText}>
                    Street / Building address is required.
                  </Text>
                )}
              </View>

              {/* 2. Area / Locality * */}
              <View style={s.fieldGroup}>
                <View style={s.labelRow}>
                  <Text style={s.label}>Area / Locality</Text>
                  <Text style={s.requiredStar}>*</Text>
                </View>
                <Text style={s.subLabel}>
                  Choose or type your locality in Nalgonda
                </Text>

                <View style={s.areaChipsGrid}>
                  {NALGONDA_AREAS.map((area) => {
                    const isSelected = formData.locality === area;
                    return (
                      <Pressable
                        key={area}
                        onPress={() => updateField("locality", area)}
                        style={({ pressed }) => [
                          s.areaChip,
                          isSelected && s.areaChipSelected,
                          { opacity: pressed ? 0.8 : 1 },
                        ]}
                      >
                        <Text
                          style={[
                            s.areaChipText,
                            isSelected && s.areaChipTextSelected,
                          ]}
                        >
                          {area}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Custom locality input if selected 'Other Locality' or custom */}
                <TextInput
                  value={formData.locality}
                  onChangeText={(val) => updateField("locality", val)}
                  placeholder="Or enter custom locality / colony name"
                  placeholderTextColor={SLATE_400}
                  style={[
                    s.input,
                    { marginTop: 10 },
                    showErrors && !formData.locality.trim() && s.inputError,
                  ]}
                  accessibilityLabel="Locality"
                />
                {showErrors && !formData.locality.trim() && (
                  <Text style={s.fieldErrorText}>
                    Area or locality is required.
                  </Text>
                )}
              </View>

              {/* 3. City & Pincode */}
              <View style={s.rowFields}>
                <View style={[s.fieldGroup, { flex: 1 }]}>
                  <Text style={s.label}>City</Text>
                  <TextInput
                    value={formData.city}
                    onChangeText={(val) => updateField("city", val)}
                    placeholder="Nalgonda"
                    placeholderTextColor={SLATE_400}
                    style={s.input}
                    accessibilityLabel="City"
                  />
                </View>

                <View style={[s.fieldGroup, { flex: 1 }]}>
                  <Text style={s.label}>Pincode</Text>
                  <TextInput
                    value={formData.pincode}
                    onChangeText={(val) => updateField("pincode", val)}
                    placeholder="508001"
                    placeholderTextColor={SLATE_400}
                    keyboardType="numeric"
                    maxLength={6}
                    style={s.input}
                    accessibilityLabel="Pincode"
                  />
                </View>
              </View>

              {/* 4. Map Location / Coordinates Placeholder */}
              <View style={s.mapPlaceholderCard}>
                <View style={s.mapHeaderRow}>
                  <View>
                    <Text style={s.mapTitle}>🗺️ Map Coordinates</Text>
                    <Text style={s.mapSubTitle}>
                      Lat: {formData.latitude?.toFixed(4) ?? "17.0583"}, Lng:{" "}
                      {formData.longitude?.toFixed(4) ?? "79.2671"} (Nalgonda
                      Center)
                    </Text>
                  </View>
                  <View style={s.mapReadyBadge}>
                    <Text style={s.mapReadyText}>GPS Ready</Text>
                  </View>
                </View>
                <Text style={s.mapDescription}>
                  Map pin coordinates will automatically synchronize with your
                  locality when saved to backend.
                </Text>
              </View>
            </View>

            {/* Contact Details Card */}
            <View style={s.card}>
              <Text style={s.sectionHeading}>📞 Contact Information</Text>

              {/* 5. Phone * */}
              <View style={s.fieldGroup}>
                <View style={s.labelRow}>
                  <Text style={s.label}>Primary Phone / Mobile</Text>
                  <Text style={s.requiredStar}>*</Text>
                </View>
                <TextInput
                  value={formData.phone}
                  onChangeText={handlePhoneChange}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor={SLATE_400}
                  keyboardType="phone-pad"
                  maxLength={13}
                  style={[
                    s.input,
                    showErrors &&
                      formData.phone.replace(/[^0-9]/g, "").length < 10 &&
                      s.inputError,
                  ]}
                  accessibilityLabel="Primary Phone"
                />
                {showErrors &&
                  formData.phone.replace(/[^0-9]/g, "").length < 10 && (
                    <Text style={s.fieldErrorText}>
                      Please enter a valid 10-digit phone number.
                    </Text>
                  )}
              </View>

              {/* 6. WhatsApp Number */}
              <View style={s.fieldGroup}>
                <View style={s.labelRow}>
                  <Text style={s.label}>WhatsApp Number</Text>
                </View>

                {/* Same as phone toggle */}
                <Pressable
                  onPress={handleSameAsPhoneToggle}
                  style={s.checkboxRow}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: sameAsPhone }}
                >
                  <View
                    style={[
                      s.checkbox,
                      sameAsPhone && s.checkboxSelected,
                    ]}
                  >
                    {sameAsPhone && <Text style={s.checkMark}>✓</Text>}
                  </View>
                  <Text style={s.checkboxLabel}>
                    Same as Primary Phone number
                  </Text>
                </Pressable>

                {!sameAsPhone && (
                  <TextInput
                    value={formData.whatsapp}
                    onChangeText={(val) => updateField("whatsapp", val)}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor={SLATE_400}
                    keyboardType="phone-pad"
                    maxLength={13}
                    style={[s.input, { marginTop: 8 }]}
                    accessibilityLabel="WhatsApp Number"
                  />
                )}
              </View>

              {/* 7. Email */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Email Address (Optional)</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(val) => updateField("email", val)}
                  placeholder="e.g. contact@yourbusiness.com"
                  placeholderTextColor={SLATE_400}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={s.input}
                  accessibilityLabel="Email Address"
                />
              </View>

              {/* 8. Website */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Website / Social Link (Optional)</Text>
                <TextInput
                  value={formData.website}
                  onChangeText={(val) => updateField("website", val)}
                  placeholder="e.g. https://instagram.com/yourbusiness"
                  placeholderTextColor={SLATE_400}
                  keyboardType="url"
                  autoCapitalize="none"
                  style={s.input}
                  accessibilityLabel="Website"
                />
              </View>
            </View>

            {/* Bottom Navigation */}
            <View style={s.bottomNav}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  s.backBtn,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Back to Step 1"
              >
                <Text style={s.backBtnText}>← Back</Text>
              </Pressable>

              <Pressable
                onPress={handleContinue}
                style={({ pressed }) => [
                  s.continueBtn,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Continue to Photos & Hours"
              >
                <Text style={s.continueBtnText}>Continue to Step 3 →</Text>
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
  fieldErrorText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    ...WEB_FONT,
  },
  rowFields: {
    flexDirection: "row",
    gap: 12,
  },

  /* Area chips */
  areaChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  areaChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SLATE_200,
    backgroundColor: SLATE_50,
  },
  areaChipSelected: {
    borderColor: BRAND,
    backgroundColor: "#EFF6FF",
  },
  areaChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },
  areaChipTextSelected: {
    color: BRAND,
    fontWeight: "800",
  },

  /* Map placeholder */
  mapPlaceholderCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
  },
  mapHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  mapSubTitle: {
    fontSize: 11,
    color: SLATE_500,
    marginTop: 2,
    ...WEB_FONT,
  },
  mapReadyBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mapReadyText: {
    color: "#15803D",
    fontSize: 10,
    fontWeight: "800",
    ...WEB_FONT,
  },
  mapDescription: {
    fontSize: 11,
    color: SLATE_500,
    lineHeight: 16,
    ...WEB_FONT,
  },

  /* Checkbox */
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: SLATE_400,
    backgroundColor: WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  checkMark: {
    color: WHITE,
    fontSize: 11,
    fontWeight: "900",
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: SLATE_700,
    ...WEB_FONT,
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
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    backgroundColor: WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnText: {
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
