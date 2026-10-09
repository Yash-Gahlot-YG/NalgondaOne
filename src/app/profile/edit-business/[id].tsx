import React, { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
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
  SLATE_800,
  SLATE_700,
  SLATE_500,
  SLATE_400,
  SLATE_300,
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
import { useAuth } from "@/context/AuthContext";
import {
  fetchMyBusinessById,
  updateMyBusiness,
  type BusinessDocument,
} from "@/services/businessApi";
import { uploadAllBusinessImages } from "@/services/uploadApi";
import { BUSINESS_CATEGORIES } from "@/data/business";
import { SingleImagePicker, MultiImagePicker } from "@/components/business/ImageUploadCard";

const SERVICE_SUGGESTIONS = [
  "Doorstep Service",
  "Emergency 24/7",
  "Installation",
  "Repair & Service",
  "AMC Maintenance",
  "Consultation & Estimate",
];

export default function EditBusinessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState("");
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("Nalgonda");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [openingTime, setOpeningTime] = useState("09:00 AM");
  const [closingTime, setClosingTime] = useState("08:00 PM");
  const [is24Hours, setIs24Hours] = useState(false);
  const [closedDays, setClosedDays] = useState<string[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [businessPhotos, setBusinessPhotos] = useState<string[]>([]);
  const [originalStatus, setOriginalStatus] = useState<string>("pending");
  const [adminNotes, setAdminNotes] = useState<string>("");

  const loadBusiness = useCallback(async () => {
    if (!id) return;
    try {
      setLoadError(null);
      const biz = await fetchMyBusinessById(id);
      setBusinessName(biz.businessName || "");
      setCategory(biz.category || "");
      setDescription(biz.description || "");
      setServices(biz.services || []);
      setAddress(biz.address || "");
      setLocality(biz.locality || "");
      setCity(biz.city || "Nalgonda");
      setPincode(biz.pincode || "");
      setPhone(biz.phone || "");
      setWhatsapp(biz.whatsapp || "");
      setEmail(biz.email || "");
      setWebsite(biz.website || "");
      setOpeningTime(biz.openingTime || "09:00 AM");
      setClosingTime(biz.closingTime || "08:00 PM");
      setIs24Hours(!!biz.is24Hours);
      setClosedDays(biz.closedDays || []);
      setLogo(biz.logo || null);
      setCoverPhoto(biz.coverPhoto || null);
      setBusinessPhotos(biz.businessPhotos || []);
      setOriginalStatus(biz.status);
      setAdminNotes(biz.adminNotes || biz.rejectionReason || "");
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load business details."
      );
    }
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      setLoading(true);
      loadBusiness().finally(() => setLoading(false));
    }
  }, [isAuthenticated, id, loadBusiness]);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/auth/login?redirectTo=/profile/edit-business/${id}` as any);
    }
  }, [authLoading, isAuthenticated, id]);

  if (authLoading || !isAuthenticated) {
    return (
      <View style={[s.page, s.center]}>
        <ActivityIndicator color={BRAND} size="large" />
      </View>
    );
  }

  const handleAddService = () => {
    const val = serviceInput.trim();
    if (val && !services.includes(val)) {
      setServices([...services, val]);
      setServiceInput("");
    }
  };

  const handleRemoveService = (service: string) => {
    setServices(services.filter((s) => s !== service));
  };

  const toggleClosedDay = (day: string) => {
    if (closedDays.includes(day)) {
      setClosedDays(closedDays.filter((d) => d !== day));
    } else {
      setClosedDays([...closedDays, day]);
    }
  };

  const handleSave = async () => {
    // Validations
    if (!businessName.trim()) {
      setSaveError("Business name is required.");
      return;
    }
    if (!category.trim()) {
      setSaveError("Category is required.");
      return;
    }
    if (!address.trim()) {
      setSaveError("Address is required.");
      return;
    }
    if (!locality.trim()) {
      setSaveError("Locality is required.");
      return;
    }
    if (!phone.trim()) {
      setSaveError("Phone number is required.");
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      // 1. Upload local images to Cloudinary if newly selected
      const uploadedImages = await uploadAllBusinessImages({
        logo,
        coverPhoto,
        businessPhotos,
      });

      // 2. Submit update to backend
      await updateMyBusiness(id as string, {
        businessName: businessName.trim(),
        category: category.trim(),
        description: description.trim(),
        services,
        address: address.trim(),
        locality: locality.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        website: website.trim(),
        openingTime,
        closingTime,
        is24Hours,
        closedDays,
        logo: uploadedImages.logo,
        coverPhoto: uploadedImages.coverPhoto,
        businessPhotos: uploadedImages.businessPhotos,
      });

      setSaveSuccess(true);
      const msg =
        "Your business has been updated and submitted for admin re-verification.";
      if (Platform.OS === "web") {
        window.alert(msg);
        router.replace("/profile" as any);
      } else {
        Alert.alert("Changes Saved", msg, [
          { text: "OK", onPress: () => router.replace("/profile" as any) },
        ]);
      }
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save changes. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const DAYS_OF_WEEK = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <View style={s.page}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <View style={s.topBarInner}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backBtnText}>← Back to Dashboard</Text>
          </Pressable>
          <Text style={s.topBarTitle}>Edit Business</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingHorizontal: isMobile ? 16 : 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.container}>
          {/* Loading */}
          {loading && (
            <View style={[s.center, { paddingVertical: 60 }]}>
              <ActivityIndicator color={BRAND} size="large" />
              <Text style={s.loadingText}>Loading business details...</Text>
            </View>
          )}

          {/* Load Error */}
          {loadError && !loading && (
            <View style={s.errorBanner}>
              <Text style={s.errorText}>⚠️ {loadError}</Text>
              <Pressable onPress={loadBusiness}>
                <Text style={s.retryText}>Retry</Text>
              </Pressable>
            </View>
          )}

          {!loading && !loadError && (
            <>
              {/* Re-verification Notice */}
              <View style={s.noticeBanner}>
                <Text style={s.noticeBannerIcon}>ℹ️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.noticeBannerTitle}>Safe Re-Verification</Text>
                  <Text style={s.noticeBannerText}>
                    Saving changes to this business will reset its status to
                    Pending Verification so admins can review the updated
                    information before public re-publishing.
                  </Text>
                </View>
              </View>

              {/* Admin Notes / Reason if changes were requested */}
              {adminNotes ? (
                <View style={s.adminFeedbackBox}>
                  <Text style={s.adminFeedbackTitle}>
                    📝 Feedback from Admin:
                  </Text>
                  <Text style={s.adminFeedbackBody}>{adminNotes}</Text>
                </View>
              ) : null}

              {/* Save Error */}
              {saveError && (
                <View style={s.errorBanner}>
                  <Text style={s.errorText}>⚠️ {saveError}</Text>
                </View>
              )}

              {/* Form Card */}
              <View style={s.formCard}>
                {/* 1. Basic Info */}
                <Text style={s.sectionTitle}>1. Business Information</Text>

                <View style={s.fieldGroup}>
                  <Text style={s.label}>
                    Business Name <Text style={s.req}>*</Text>
                  </Text>
                  <TextInput
                    style={s.input}
                    placeholder="e.g. Reddy Electronics"
                    placeholderTextColor={SLATE_400}
                    value={businessName}
                    onChangeText={setBusinessName}
                  />
                </View>

                <View style={s.fieldGroup}>
                  <Text style={s.label}>
                    Category <Text style={s.req}>*</Text>
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={s.categoryChips}
                  >
                    {BUSINESS_CATEGORIES.map((cat) => {
                      const isSelected = category === cat.title;
                      return (
                        <Pressable
                          key={cat.slug}
                          onPress={() => setCategory(cat.title)}
                          style={[
                            s.categoryChip,
                            isSelected && s.categoryChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              s.categoryChipText,
                              isSelected && s.categoryChipTextSelected,
                            ]}
                          >
                            {cat.icon} {cat.title}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={s.fieldGroup}>
                  <Text style={s.label}>Description</Text>
                  <TextInput
                    style={[s.input, s.textArea]}
                    placeholder="Tell customers about your business, products, or services..."
                    placeholderTextColor={SLATE_400}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Services */}
                <View style={s.fieldGroup}>
                  <Text style={s.label}>Services & Offerings</Text>
                  <View style={s.serviceInputRow}>
                    <TextInput
                      style={[s.input, { flex: 1 }]}
                      placeholder="Add a service (e.g. Free Consultation)"
                      placeholderTextColor={SLATE_400}
                      value={serviceInput}
                      onChangeText={setServiceInput}
                      onSubmitEditing={handleAddService}
                    />
                    <Pressable
                      onPress={handleAddService}
                      style={s.addServiceBtn}
                    >
                      <Text style={s.addServiceBtnText}>Add</Text>
                    </Pressable>
                  </View>

                  {services.length > 0 && (
                    <View style={s.tagsWrap}>
                      {services.map((svc) => (
                        <View key={svc} style={s.tag}>
                          <Text style={s.tagText}>{svc}</Text>
                          <Pressable onPress={() => handleRemoveService(svc)}>
                            <Text style={s.removeTagText}>✕</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* 2. Contact & Location */}
                <Text style={[s.sectionTitle, { marginTop: 24 }]}>
                  2. Location & Contact
                </Text>

                <View style={s.fieldGroup}>
                  <Text style={s.label}>
                    Street Address <Text style={s.req}>*</Text>
                  </Text>
                  <TextInput
                    style={s.input}
                    placeholder="Shop/Building #, Street name"
                    placeholderTextColor={SLATE_400}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>

                <View style={s.fieldRow}>
                  <View style={[s.fieldGroup, { flex: 1 }]}>
                    <Text style={s.label}>
                      Locality / Area <Text style={s.req}>*</Text>
                    </Text>
                    <TextInput
                      style={s.input}
                      placeholder="e.g. Clock Tower"
                      placeholderTextColor={SLATE_400}
                      value={locality}
                      onChangeText={setLocality}
                    />
                  </View>
                  <View style={[s.fieldGroup, { flex: 1 }]}>
                    <Text style={s.label}>City</Text>
                    <TextInput
                      style={s.input}
                      placeholder="Nalgonda"
                      placeholderTextColor={SLATE_400}
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>
                </View>

                <View style={s.fieldRow}>
                  <View style={[s.fieldGroup, { flex: 1 }]}>
                    <Text style={s.label}>
                      Phone Number <Text style={s.req}>*</Text>
                    </Text>
                    <TextInput
                      style={s.input}
                      placeholder="9876543210"
                      placeholderTextColor={SLATE_400}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={[s.fieldGroup, { flex: 1 }]}>
                    <Text style={s.label}>WhatsApp (Optional)</Text>
                    <TextInput
                      style={s.input}
                      placeholder="9876543210"
                      placeholderTextColor={SLATE_400}
                      value={whatsapp}
                      onChangeText={setWhatsapp}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={s.fieldRow}>
                  <View style={[s.fieldGroup, { flex: 1 }]}>
                    <Text style={s.label}>Email</Text>
                    <TextInput
                      style={s.input}
                      placeholder="business@example.com"
                      placeholderTextColor={SLATE_400}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                    />
                  </View>
                  <View style={[s.fieldGroup, { flex: 1 }]}>
                    <Text style={s.label}>Website</Text>
                    <TextInput
                      style={s.input}
                      placeholder="https://..."
                      placeholderTextColor={SLATE_400}
                      value={website}
                      onChangeText={setWebsite}
                    />
                  </View>
                </View>

                {/* 3. Business Hours */}
                <Text style={[s.sectionTitle, { marginTop: 24 }]}>
                  3. Business Hours
                </Text>

                <Pressable
                  onPress={() => setIs24Hours(!is24Hours)}
                  style={s.checkboxRow}
                >
                  <View
                    style={[
                      s.checkbox,
                      is24Hours && s.checkboxChecked,
                    ]}
                  >
                    {is24Hours && <Text style={s.checkboxTick}>✓</Text>}
                  </View>
                  <Text style={s.checkboxLabel}>Open 24 Hours / 7 Days</Text>
                </Pressable>

                {!is24Hours && (
                  <View style={s.fieldRow}>
                    <View style={[s.fieldGroup, { flex: 1 }]}>
                      <Text style={s.label}>Opening Time</Text>
                      <TextInput
                        style={s.input}
                        placeholder="09:00 AM"
                        placeholderTextColor={SLATE_400}
                        value={openingTime}
                        onChangeText={setOpeningTime}
                      />
                    </View>
                    <View style={[s.fieldGroup, { flex: 1 }]}>
                      <Text style={s.label}>Closing Time</Text>
                      <TextInput
                        style={s.input}
                        placeholder="08:00 PM"
                        placeholderTextColor={SLATE_400}
                        value={closingTime}
                        onChangeText={setClosingTime}
                      />
                    </View>
                  </View>
                )}

                <View style={s.fieldGroup}>
                  <Text style={s.label}>Closed Days</Text>
                  <View style={s.daysRow}>
                    {DAYS_OF_WEEK.map((day) => {
                      const isClosed = closedDays.includes(day);
                      return (
                        <Pressable
                          key={day}
                          onPress={() => toggleClosedDay(day)}
                          style={[
                            s.dayChip,
                            isClosed && s.dayChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              s.dayChipText,
                              isClosed && s.dayChipTextActive,
                            ]}
                          >
                            {day.slice(0, 3)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* 4. Images */}
                <Text style={[s.sectionTitle, { marginTop: 24 }]}>
                  4. Business Photos
                </Text>

                <View style={s.fieldGroup}>
                  <SingleImagePicker
                    label="Business Logo"
                    helperText="Square image recommended"
                    imageUri={logo}
                    onImageSelected={(uri) => setLogo(uri)}
                    onImageRemoved={() => setLogo(null)}
                    aspectRatio={[1, 1]}
                  />
                </View>

                <View style={s.fieldGroup}>
                  <SingleImagePicker
                    label="Cover Photo"
                    helperText="Header banner for your listing"
                    imageUri={coverPhoto}
                    onImageSelected={(uri) => setCoverPhoto(uri)}
                    onImageRemoved={() => setCoverPhoto(null)}
                    aspectRatio={[16, 9]}
                  />
                </View>

                <View style={s.fieldGroup}>
                  <MultiImagePicker
                    label="Gallery Photos"
                    helperText="Up to 5 storefront, interior or product photos"
                    images={businessPhotos}
                    onAddImage={(uri: string) =>
                      setBusinessPhotos((prev) =>
                        prev.length < 5 ? [...prev, uri] : prev
                      )
                    }
                    onRemoveImage={(idx: number) =>
                      setBusinessPhotos((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                  />
                </View>

                {/* Submit Action */}
                <View style={s.submitBar}>
                  <Pressable
                    onPress={() => router.back()}
                    style={s.cancelBtn}
                    disabled={isSaving}
                  >
                    <Text style={s.cancelBtnText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSave}
                    disabled={isSaving}
                    style={({ pressed }) => [
                      s.saveBtn,
                      { opacity: pressed || isSaving ? 0.85 : 1 },
                    ]}
                  >
                    {isSaving ? (
                      <View style={s.loadingRow}>
                        <ActivityIndicator color={WHITE} size="small" />
                        <Text style={s.saveBtnText}>Saving Changes...</Text>
                      </View>
                    ) : (
                      <Text style={s.saveBtnText}>Save & Submit Changes</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </>
          )}
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

  /* Top Bar */
  topBar: {
    backgroundColor: SLATE_900,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  topBarInner: {
    maxWidth: CONTENT_MAX_WIDTH,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  backBtnText: {
    color: SLATE_300,
    fontSize: 12,
    fontWeight: "700",
    ...WEB_FONT,
  },
  topBarTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "900",
    ...WEB_FONT,
  },

  /* Content */
  scrollContent: {
    paddingVertical: 24,
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: 800,
    paddingBottom: 40,
  },

  /* Notices */
  noticeBanner: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  noticeBannerIcon: {
    fontSize: 22,
  },
  noticeBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E40AF",
    marginBottom: 2,
    ...WEB_FONT,
  },
  noticeBannerText: {
    fontSize: 12,
    color: SLATE_700,
    lineHeight: 18,
    ...WEB_FONT,
  },

  adminFeedbackBox: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#D97706",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  adminFeedbackTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#92400E",
    marginBottom: 4,
    ...WEB_FONT,
  },
  adminFeedbackBody: {
    fontSize: 12,
    color: "#78350F",
    lineHeight: 18,
    ...WEB_FONT,
  },

  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    ...WEB_FONT,
  },
  retryText: {
    color: BRAND,
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 12,
    ...WEB_FONT,
  },
  loadingText: {
    color: SLATE_500,
    fontSize: 13,
    marginTop: 12,
    ...WEB_FONT,
  },

  /* Form Card */
  formCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: SLATE_200,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }
      : {}),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: SLATE_900,
    marginBottom: 16,
    ...WEB_FONT,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 12,
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
  input: {
    backgroundColor: SLATE_50,
    borderWidth: 1.5,
    borderColor: SLATE_200,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: SLATE_900,
    ...WEB_FONT,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  /* Category Chips */
  categoryChips: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: SLATE_50,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  categoryChipSelected: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },
  categoryChipTextSelected: {
    color: WHITE,
  },

  /* Services */
  serviceInputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  addServiceBtn: {
    backgroundColor: BRAND,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addServiceBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "800",
    ...WEB_FONT,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: SLATE_100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "700",
    color: SLATE_800,
    ...WEB_FONT,
  },
  removeTagText: {
    fontSize: 12,
    color: SLATE_400,
    fontWeight: "800",
  },

  /* Checkbox */
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: SLATE_300,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: BRAND,
    borderColor: BRAND,
  },
  checkboxTick: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "900",
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: SLATE_800,
    ...WEB_FONT,
  },

  /* Days */
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: SLATE_50,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  dayChipActive: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },
  dayChipTextActive: {
    color: "#DC2626",
  },

  /* Submit Bar */
  submitBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: SLATE_100,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },
  saveBtn: {
    backgroundColor: BRAND,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)" }
      : {}),
  },
  saveBtnText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "800",
    ...WEB_FONT,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
