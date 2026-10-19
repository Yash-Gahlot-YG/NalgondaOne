import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
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
  BRAND_DARK,
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
  WEB_FONT,
  CONTENT_MAX_WIDTH,
  isMobileWidth,
  isTabletWidth,
} from "@/constants/serviceTheme";
import {
  getProviderById,
  isMockContact,
  getCategoryBySlug,
  normalizeCategorySlug,
  isHealthcareCategory,
  type ServiceProvider,
} from "@/data/services";
import {
  getApprovedBusinessById,
  type BusinessDocument,
} from "@/services/businessApi";
import ProviderHeader from "@/components/services/ProviderHeader";
import ProviderGallery from "@/components/services/ProviderGallery";
import ProviderActionButtons from "@/components/services/ProviderActionButtons";
import ProviderLocationMap from "@/components/services/ProviderLocationMap";
import ErrorState from "@/components/services/ErrorState";

/* ================================================================ */
/* HELPERS                                                           */
/* ================================================================ */

/**
 * Convert a BusinessDocument from the API into a ServiceProvider
 * so that existing components (ProviderHeader, Gallery, etc.) work unchanged.
 */
function businessDocToProvider(biz: BusinessDocument): ServiceProvider {
  const normalizedSlug = normalizeCategorySlug(biz.category);
  const cat = getCategoryBySlug(normalizedSlug) || getCategoryBySlug(biz.category);

  // Build images array: prefer coverPhoto, then logo, then businessPhotos
  const images: string[] = [];
  if (biz.coverPhoto) images.push(biz.coverPhoto);
  else if (biz.logo) images.push(biz.logo);
  else if (biz.businessPhotos?.length > 0) images.push(biz.businessPhotos[0]);

  const photos: string[] = [];
  if (biz.coverPhoto) photos.push(biz.coverPhoto);
  if (biz.logo && biz.logo !== biz.coverPhoto) photos.push(biz.logo);
  biz.businessPhotos?.forEach((p) => {
    if (!photos.includes(p)) photos.push(p);
  });

  // Build opening hours string
  let openingHours = "Contact for hours";
  if (biz.is24Hours) {
    openingHours = "Open 24/7";
  } else if (biz.openingTime && biz.closingTime) {
    const closedStr = biz.closedDays?.length
      ? ` (Closed: ${biz.closedDays.join(", ")})`
      : "";
    openingHours = `${biz.openingTime} – ${biz.closingTime}${closedStr}`;
  }

  // Map city: backend stores "Nalgonda" but frontend uses "Nalgonda Town"
  let city = biz.city || "Nalgonda";
  if (city === "Nalgonda") city = "Nalgonda Town";

  // Safely extract coordinates from GeoJSON [lng, lat]
  const rawLng = biz.location?.coordinates?.[0];
  const rawLat = biz.location?.coordinates?.[1];
  const hasValidCoords =
    typeof rawLat === "number" &&
    typeof rawLng === "number" &&
    (rawLat !== 0 || rawLng !== 0);

  return {
    id: `api-${biz._id}`,
    name: biz.businessName,
    slug: biz.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    category: normalizedSlug || biz.category,
    categoryTitle: cat?.title || biz.category,
    description: biz.description || "",
    phone: biz.phone,
    whatsapp: biz.whatsapp || biz.phone,
    address: biz.address,
    locality: biz.locality || "",
    city,
    latitude: hasValidCoords ? rawLat : 0,
    longitude: hasValidCoords ? rawLng : 0,
    rating: 0,
    reviewCount: 0,
    distanceKm: undefined,
    verified: biz.verified === true,
    services: biz.services || [],
    openingHours,
    images,
    photos,
    faqs: [],
    isMockData: false,
  };
}

/* ================================================================ */
/* COMPONENT                                                         */
/* ================================================================ */

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const isTablet = isTabletWidth(width);

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const contentPad = isMobile ? 20 : isTablet ? 36 : 0;

  /* ---- Try mock provider lookup first (synchronous) ---- */
  const mockProvider = useMemo(() => getProviderById(id ?? ""), [id]);

  /* ---- API provider fetch (for real businesses) ---- */
  const [apiProvider, setApiProvider] = useState<ServiceProvider | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiFetched, setApiFetched] = useState(false);

  useEffect(() => {
    // Only fetch from API if not found in mock data
    if (mockProvider || !id) return;

    // Extract MongoDB _id from the "api-" prefixed ID
    const mongoId = id.startsWith("api-") ? id.slice(4) : id;

    let cancelled = false;
    setApiLoading(true);

    getApprovedBusinessById(mongoId).then((biz) => {
      if (cancelled) return;
      if (biz) {
        setApiProvider(businessDocToProvider(biz));
      }
      setApiLoading(false);
      setApiFetched(true);
    });

    return () => {
      cancelled = true;
    };
  }, [id, mockProvider]);

  /* ---- Resolved provider: mock takes priority, then API ---- */
  const provider = mockProvider ?? apiProvider;
  const isMock = provider ? isMockContact(provider) : true;

  /* ---- Loading state while fetching API business ---- */
  if (!mockProvider && apiLoading) {
    return (
      <View style={s.page}>
        <View style={s.header}>
          <View style={s.headerInner}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                s.backBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={s.backArrow}>←</Text>
            </Pressable>
            <Text style={s.headerTitle}>Loading...</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND} />
          <Text style={s.loadingText}>Loading provider details...</Text>
        </View>
      </View>
    );
  }

  /* ---- Not found: no mock AND API fetch returned nothing ---- */
  if (!provider) {
    return (
      <View style={s.page}>
        <View style={s.header}>
          <View style={s.headerInner}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                s.backBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={s.backArrow}>←</Text>
            </Pressable>
            <Text style={s.headerTitle}>Provider</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <ErrorState
          icon="🔍"
          title="Service provider not found"
          description="This provider may have been removed or the link is incorrect."
          retryLabel="← Back to Services"
          onRetry={() => router.push("/services")}
        />
      </View>
    );
  }

  /* ---- Healthcare listings belong in the /healthcare directory ---- */
  const isHealthcare =
    isHealthcareCategory(provider.category) ||
    isHealthcareCategory(provider.categoryTitle);

  if (isHealthcare) {
    return (
      <View style={s.page}>
        <View style={s.header}>
          <View style={s.headerInner}>
            <Pressable
              onPress={() => router.push("/healthcare")}
              style={({ pressed }) => [
                s.backBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go to Healthcare"
            >
              <Text style={s.backArrow}>←</Text>
            </Pressable>
            <Text style={s.headerTitle}>Healthcare Facility</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <ErrorState
          icon="🏥"
          title="Healthcare Provider"
          description={`${provider.name} is a verified medical/healthcare listing and is available in the NalgondaOne Healthcare directory.`}
          retryLabel="Open Healthcare Directory →"
          onRetry={() => router.push("/healthcare")}
        />
      </View>
    );
  }

  /* ---- Action handlers ---- */
  const handleCall = () => {
    if (isMock) {
      if (Platform.OS === "web") {
        alert("This is a demo listing. Real contact details will be available when the provider is verified.");
      } else {
        Alert.alert("Demo Listing", "Real contact details will be available when the provider is verified.");
      }
      return;
    }

    const isMobileDevice =
      Platform.OS !== "web" ||
      (typeof navigator !== "undefined" &&
        navigator.userAgent &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    if (isMobileDevice) {
      const telUrl = `tel:${provider.phone}`;
      Linking.openURL(telUrl).catch(() => {
        if (Platform.OS === "web") {
          window.open(telUrl, "_self");
        }
      });
    } else {
      setCopied(false);
      setShowCallModal(true);
    }
  };

  const handleCopyPhone = async () => {
    if (!provider?.phone) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(provider.phone);
      } else if (typeof document !== "undefined") {
        const el = document.createElement("textarea");
        el.value = provider.phone;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const handleWhatsApp = () => {
    if (isMock) {
      if (Platform.OS === "web") {
        alert("This is a demo listing. Real WhatsApp contact will be available when the provider is verified.");
      } else {
        Alert.alert("Demo Listing", "Real WhatsApp contact will be available when the provider is verified.");
      }
      return;
    }
    const cleanPhone = provider.whatsapp.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      `Hi ${provider.name}, I found your service on NalgondaOne and would like to inquire about your services.`
    )}`;
    Linking.openURL(waUrl).catch(() => {
      if (Platform.OS === "web") {
        window.open(waUrl, "_blank");
      }
    });
  };

  /* ---- Map handler ---- */
  const handleViewOnMap = () => {
    let mapUrl = "";
    if (
      provider.latitude &&
      provider.longitude &&
      (provider.latitude !== 0 || provider.longitude !== 0)
    ) {
      const lat = Number(provider.latitude).toFixed(6);
      const lng = Number(provider.longitude).toFixed(6);
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else {
      const addressQuery = encodeURIComponent(
        `${provider.address}, ${provider.city}`
      );
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
    }

    Linking.openURL(mapUrl).catch(() => {
      if (Platform.OS === "web") {
        window.open(mapUrl, "_blank");
      }
    });
  };

  /* ---- Content wrapper ---- */
  const ContentWrap = ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: any;
  }) => (
    <View
      style={[
        {
          width: "100%",
          maxWidth: CONTENT_MAX_WIDTH,
          alignSelf: "center",
          paddingHorizontal: contentPad,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  /* ---- Gallery images: combine images + photos, deduplicate ---- */
  const galleryImages = [...new Set([...provider.images, ...provider.photos])];

  return (
    <View style={s.page}>
      {/* ---- Sticky Header ---- */}
      <View style={s.header}>
        <View style={s.headerInner}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              s.backBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={s.backArrow}>←</Text>
          </Pressable>
          <Text style={s.headerTitle} numberOfLines={1}>
            {provider.name}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Provider Header (image + info card) ---- */}
        <ProviderHeader provider={provider} />

        <ContentWrap style={{ paddingTop: 28, paddingBottom: 100 }}>
          {/* ============================================================ */}
          {/* ABOUT                                                        */}
          {/* ============================================================ */}

          <View style={s.section}>
            <Text style={s.sectionTitle} accessibilityRole="header">About</Text>
            <Text style={s.aboutText}>{provider.description}</Text>
          </View>

          {/* ============================================================ */}
          {/* SERVICES OFFERED                                              */}
          {/* ============================================================ */}

          <View style={s.section}>
            <Text style={s.sectionTitle} accessibilityRole="header">Services</Text>
            <View style={s.servicesList}>
              {provider.services.map((svc, idx) => (
                <View key={idx} style={s.serviceItem} accessibilityLabel={svc}>
                  <View style={s.serviceDot} />
                  <Text style={s.serviceText}>{svc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ============================================================ */}
          {/* WORKING HOURS                                                 */}
          {/* ============================================================ */}

          <View style={s.section}>
            <Text style={s.sectionTitle} accessibilityRole="header">Working Hours</Text>
            <View style={s.hoursCard}>
              <Text style={s.hoursIcon}>🕐</Text>
              <Text style={s.hoursText}>{provider.openingHours}</Text>
            </View>
          </View>

          {/* ============================================================ */}
          {/* LOCATION                                                      */}
          {/* ============================================================ */}

          <ProviderLocationMap provider={provider} />

          {/* ============================================================ */}
          {/* PHOTO GALLERY                                                 */}
          {/* ============================================================ */}

          <View style={s.section}>
            <Text style={s.sectionTitle} accessibilityRole="header">Photos</Text>
            <ProviderGallery
              images={galleryImages}
              providerName={provider.name}
              isMockData={provider.isMockData}
            />
          </View>

          {/* ============================================================ */}
          {/* FAQ                                                           */}
          {/* ============================================================ */}

          {provider.faqs.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle} accessibilityRole="header">
                Frequently Asked Questions
              </Text>
              {provider.faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <Pressable
                    key={idx}
                    onPress={() =>
                      setExpandedFaq(isOpen ? null : idx)
                    }
                    style={({ pressed }) => [
                      s.faqItem,
                      { opacity: pressed ? 0.95 : 1 },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                    accessibilityLabel={faq.question}
                  >
                    <View style={s.faqHeader}>
                      <Text style={s.faqQuestion}>
                        {faq.question}
                      </Text>
                      <Text style={s.faqToggle}>
                        {isOpen ? "−" : "+"}
                      </Text>
                    </View>
                    {isOpen && (
                      <Text style={s.faqAnswer}>{faq.answer}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* ============================================================ */}
          {/* DISCLAIMER                                                    */}
          {/* ============================================================ */}

          {provider.isMockData && (
            <View style={s.disclaimer}>
              <Text style={s.disclaimerText}>
                ℹ️ This is demo/mock data for preview purposes only. Provider
                details shown here are not real business listings. Phone numbers
                and contact details are placeholders.
              </Text>
            </View>
          )}
        </ContentWrap>
      </ScrollView>

      {/* ---- Bottom Action Buttons ---- */}
      <ProviderActionButtons
        onCall={handleCall}
        onWhatsApp={handleWhatsApp}
        isMock={isMock}
      />

      {/* ---- Desktop Call Modal ---- */}
      <Modal
        visible={showCallModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCallModal(false)}
      >
        <Pressable
          style={s.modalOverlay}
          onPress={() => setShowCallModal(false)}
        >
          <Pressable
            style={s.modalCard}
            onPress={(e) => e.stopPropagation()}
            accessibilityLabel="Call Business Dialog"
          >
            {/* Header */}
            <View style={s.modalHeader}>
              <View style={s.modalIconWrap}>
                <Text style={s.modalIcon}>📞</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.modalTitle}>Call Business</Text>
                <Text style={s.modalSubtitle} numberOfLines={1}>
                  {provider.name}
                </Text>
              </View>
              <Pressable
                onPress={() => setShowCallModal(false)}
                style={s.modalCloseIconBtn}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
              >
                <Text style={s.modalCloseIconText}>✕</Text>
              </Pressable>
            </View>

            {/* Phone Box */}
            <View style={s.modalPhoneBox}>
              <Text style={s.modalPhoneLabel}>Phone</Text>
              <Text style={s.modalPhoneNumber} selectable={true}>
                {provider.phone}
              </Text>
            </View>

            {/* Message */}
            <Text style={s.modalMessage}>
              Calling is available on mobile. You can also copy the number and call from your phone.
            </Text>

            {/* Buttons */}
            <View style={s.modalActions}>
              <Pressable
                onPress={handleCopyPhone}
                style={({ pressed }) => [
                  s.copyBtn,
                  copied ? s.copyBtnSuccess : null,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={copied ? "Phone number copied" : "Copy Number"}
              >
                <Text style={s.copyBtnIcon}>{copied ? "✓" : "📋"}</Text>
                <Text
                  style={[
                    s.copyBtnText,
                    copied ? s.copyBtnTextSuccess : null,
                  ]}
                >
                  {copied ? "Phone number copied" : "Copy Number"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowCallModal(false)}
                style={({ pressed }) => [
                  s.modalCloseBtn,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
              >
                <Text style={s.modalCloseBtnText}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ================================================================ */
/* STYLES                                                            */
/* ================================================================ */

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: SLATE_50,
  },

  /* ---- header ---- */
  header: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderBottomWidth: 1,
    borderBottomColor: "#E8EEF5",
    ...(Platform.OS === "web"
      ? {
          position: "sticky" as any,
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(16px)" as any,
          WebkitBackdropFilter: "blur(16px)" as any,
        }
      : {}),
  },
  headerInner: {
    maxWidth: CONTENT_MAX_WIDTH,
    width: "100%",
    alignSelf: "center",
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: SLATE_100,
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 20,
    color: SLATE_900,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: SLATE_900,
    flex: 1,
    textAlign: "center",
    ...WEB_FONT,
  },

  /* ---- loading ---- */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: SLATE_500,
    ...WEB_FONT,
  },

  /* ---- sections ---- */
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: SLATE_900,
    marginBottom: 14,
    letterSpacing: -0.3,
    ...WEB_FONT,
  },

  /* ---- about ---- */
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: SLATE_700,
    ...WEB_FONT,
  },

  /* ---- services list ---- */
  servicesList: {
    gap: 10,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  serviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: "600",
    color: SLATE_800,
    ...WEB_FONT,
  },

  /* ---- working hours ---- */
  hoursCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  hoursIcon: {
    fontSize: 18,
  },
  hoursText: {
    fontSize: 14,
    fontWeight: "600",
    color: SLATE_800,
    ...WEB_FONT,
  },

  /* ---- FAQ ---- */
  faqItem: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SLATE_200,
    padding: 16,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "700",
    color: SLATE_900,
    flex: 1,
    ...WEB_FONT,
  },
  faqToggle: {
    fontSize: 20,
    fontWeight: "700",
    color: BRAND,
    width: 24,
    textAlign: "center",
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    color: SLATE_500,
    marginTop: 10,
    ...WEB_FONT,
  },

  /* ---- disclaimer ---- */
  disclaimer: {
    marginTop: 32,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  disclaimerText: {
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
    ...WEB_FONT,
  },

  /* ---- Call Modal ---- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    ...(Platform.OS === "web" ? ({ cursor: "default" } as any) : {}),
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)" }
      : { elevation: 8 }),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  modalIcon: {
    fontSize: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  modalSubtitle: {
    fontSize: 13,
    color: SLATE_500,
    marginTop: 2,
    ...WEB_FONT,
  },
  modalCloseIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SLATE_100,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseIconText: {
    fontSize: 14,
    color: SLATE_500,
    fontWeight: "700",
  },
  modalPhoneBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: SLATE_200,
    marginBottom: 14,
    alignItems: "center",
  },
  modalPhoneLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: SLATE_500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    ...WEB_FONT,
  },
  modalPhoneNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: BRAND_DARK,
    letterSpacing: 0.5,
    ...WEB_FONT,
  },
  modalMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: SLATE_700,
    marginBottom: 20,
    textAlign: "center",
    ...WEB_FONT,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  copyBtn: {
    flex: 1.2,
    height: 46,
    borderRadius: 12,
    backgroundColor: BRAND,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  copyBtnSuccess: {
    backgroundColor: SUCCESS,
  },
  copyBtnIcon: {
    fontSize: 16,
    color: WHITE,
  },
  copyBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: WHITE,
    ...WEB_FONT,
  },
  copyBtnTextSuccess: {
    color: WHITE,
  },
  modalCloseBtn: {
    flex: 0.8,
    height: 46,
    borderRadius: 12,
    backgroundColor: SLATE_100,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },
});
