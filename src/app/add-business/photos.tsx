import React from "react";
import { router } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
import { DAYS_OF_WEEK } from "@/data/business";
import StepIndicator from "@/components/business/StepIndicator";
import BusinessNavHeader from "@/components/business/BusinessNavHeader";
import { MultiImagePicker } from "@/components/business/ImageUploadCard";

const TIME_PRESETS_OPEN = [
  "07:00 AM",
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
];
const TIME_PRESETS_CLOSE = [
  "06:00 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "10:00 PM",
];

export default function Step3PhotosHours() {
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const {
    formData,
    updateField,
    addBusinessPhoto,
    removeBusinessPhoto,
    toggleClosedDay,
  } = useAddBusiness();

  const handlePreview = () => {
    router.push("/add-business/preview" as any);
  };

  return (
    <View style={s.page}>
      <BusinessNavHeader
        title="Step 3 — Photos & Business Hours"
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
          <StepIndicator currentStep={3} />

          {/* Photos Card */}
          <View style={s.card}>
            <Text style={s.sectionHeading}>🖼️ Business Gallery Photos</Text>
            <Text style={s.subLabel}>
              Add photos of your storefront, past work, tools, and workshop to
              build trust with local customers.
            </Text>

            <MultiImagePicker
              label="Work & Storefront Photos"
              helperText="Add multiple photos. Selected images are stored locally."
              images={formData.businessPhotos}
              onAddImage={addBusinessPhoto}
              onRemoveImage={removeBusinessPhoto}
            />
          </View>

          {/* Business Hours Card */}
          <View style={s.card}>
            <Text style={s.sectionHeading}>🕐 Business Working Hours</Text>

            {/* 24 Hours Toggle */}
            <View style={s.toggleRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={s.toggleLabel}>Open 24 Hours / Emergency</Text>
                <Text style={s.subLabel}>
                  Turn on if you provide 24/7 round-the-clock service
                </Text>
              </View>
              <Switch
                value={formData.is24Hours}
                onValueChange={(val) => updateField("is24Hours", val)}
                trackColor={{ false: SLATE_200, true: BRAND }}
                thumbColor={WHITE}
              />
            </View>

            {/* Timing Inputs (if not 24 hours) */}
            {!formData.is24Hours && (
              <View style={{ marginTop: 16 }}>
                {/* Opening Time */}
                <View style={s.fieldGroup}>
                  <Text style={s.label}>Opening Time</Text>
                  <TextInput
                    value={formData.openingTime}
                    onChangeText={(val) => updateField("openingTime", val)}
                    placeholder="09:00 AM"
                    placeholderTextColor={SLATE_400}
                    style={s.input}
                    accessibilityLabel="Opening Time"
                  />
                  <View style={s.timePresetsRow}>
                    {TIME_PRESETS_OPEN.map((t) => (
                      <Pressable
                        key={t}
                        onPress={() => updateField("openingTime", t)}
                        style={({ pressed }) => [
                          s.timeChip,
                          formData.openingTime === t && s.timeChipSelected,
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                      >
                        <Text
                          style={[
                            s.timeChipText,
                            formData.openingTime === t &&
                              s.timeChipTextSelected,
                          ]}
                        >
                          {t}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Closing Time */}
                <View style={s.fieldGroup}>
                  <Text style={s.label}>Closing Time</Text>
                  <TextInput
                    value={formData.closingTime}
                    onChangeText={(val) => updateField("closingTime", val)}
                    placeholder="08:00 PM"
                    placeholderTextColor={SLATE_400}
                    style={s.input}
                    accessibilityLabel="Closing Time"
                  />
                  <View style={s.timePresetsRow}>
                    {TIME_PRESETS_CLOSE.map((t) => (
                      <Pressable
                        key={t}
                        onPress={() => updateField("closingTime", t)}
                        style={({ pressed }) => [
                          s.timeChip,
                          formData.closingTime === t && s.timeChipSelected,
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                      >
                        <Text
                          style={[
                            s.timeChipText,
                            formData.closingTime === t &&
                              s.timeChipTextSelected,
                          ]}
                        >
                          {t}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Closed Days */}
            <View style={[s.fieldGroup, { marginTop: 12 }]}>
              <Text style={s.label}>Closed Days / Weekly Off</Text>
              <Text style={s.subLabel}>
                Select days when your business is closed (leave unselected if open
                every day)
              </Text>

              <View style={s.daysGrid}>
                {DAYS_OF_WEEK.map((day) => {
                  const isClosed = formData.closedDays.includes(day);
                  return (
                    <Pressable
                      key={day}
                      onPress={() => toggleClosedDay(day)}
                      style={({ pressed }) => [
                        s.dayChip,
                        isClosed && s.dayChipClosed,
                        { opacity: pressed ? 0.8 : 1 },
                      ]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isClosed }}
                      accessibilityLabel={`${day}: ${isClosed ? "Closed" : "Open"}`}
                    >
                      <Text
                        style={[
                          s.dayChipText,
                          isClosed && s.dayChipTextClosed,
                        ]}
                      >
                        {day}
                      </Text>
                      {isClosed && <Text style={s.dayChipIcon}>🚫</Text>}
                    </Pressable>
                  );
                })}
              </View>
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
              accessibilityLabel="Back to Step 2"
            >
              <Text style={s.backBtnText}>← Back</Text>
            </Pressable>

            <Pressable
              onPress={handlePreview}
              style={({ pressed }) => [
                s.continueBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Preview Business Listing"
            >
              <Text style={s.continueBtnText}>Preview Listing →</Text>
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
  subLabel: {
    fontSize: 12,
    color: SLATE_500,
    marginBottom: 12,
    ...WEB_FONT,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: SLATE_900,
    marginBottom: 4,
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
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: SLATE_100,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  timePresetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SLATE_200,
    backgroundColor: SLATE_50,
  },
  timeChipSelected: {
    borderColor: BRAND,
    backgroundColor: "#EFF6FF",
  },
  timeChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },
  timeChipTextSelected: {
    color: BRAND,
    fontWeight: "800",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  dayChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SLATE_200,
    backgroundColor: SLATE_50,
  },
  dayChipClosed: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: SLATE_800,
    ...WEB_FONT,
  },
  dayChipTextClosed: {
    color: "#DC2626",
    fontWeight: "800",
  },
  dayChipIcon: {
    fontSize: 10,
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
