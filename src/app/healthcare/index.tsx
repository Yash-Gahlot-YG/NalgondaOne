import { router } from "expo-router";
import { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";
import * as Location from "expo-location";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Linking,
  Modal,
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
  BRAND_DARK,
  SLATE_900,
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
  isTabletWidth,
} from "@/constants/serviceTheme";
import EmptyState from "@/components/services/EmptyState";
import ErrorState from "@/components/services/ErrorState";
import {
  fetchHealthcareListings,
  getCachedHealthcare,
} from "@/services/healthcareApi";
import type { BusinessDocument } from "@/services/businessApi";
import {
  isPhoneVerified,
  isHealthcareListingVerified,
} from "@/services/healthcareVerification";

/* ================================================================ */
/* SPECIALTY CATEGORIES                                              */
/* ================================================================ */

const SPECIALTIES = [
  { label: "All", value: "All", emoji: "🏥" },
  { label: "General Physician", value: "General Physician", emoji: "🩺" },
  { label: "Pediatrician", value: "Pediatrician", emoji: "👶" },
  { label: "Gynecologist", value: "Gynecologist", emoji: "👩‍⚕️" },
  { label: "Orthopedic", value: "Orthopedic", emoji: "🦴" },
  { label: "Dermatologist", value: "Dermatologist", emoji: "🧴" },
  { label: "Dentist", value: "Dentist", emoji: "🦷" },
  { label: "ENT", value: "ENT", emoji: "👂" },
  { label: "Ophthalmologist", value: "Ophthalmologist", emoji: "👁️" },
  { label: "Cardiologist", value: "Cardiologist", emoji: "❤️" },
];

/* Facility types for doctor-first categorization */
const FACILITY_TYPES = [
  { label: "All Types", value: "all", emoji: "🏥" },
  { label: "Doctor Clinics", value: "doctor_clinic", emoji: "🩺" },
  { label: "Private Clinics", value: "private_clinic", emoji: "🏨" },
  { label: "Govt Facilities", value: "government_hospital", emoji: "🏛️" },
  { label: "Diagnostics", value: "diagnostic_center", emoji: "🔬" },
];

/* Localities across Nalgonda district for manual fallback */
const LOCALITIES = [
  "All",
  "Bottu Guda",
  "Ramagiri",
  "Prakasham Bazar",
  "Doctors Colony",
  "Vivekananda Nagar",
  "Gollaguda",
  "Miryalaguda",
  "Devarakonda",
];

/* Pincodes for manual fallback */
const PINCODES = ["All", "508001", "508207", "508248", "508266"];

/* Distance filter options */
const DISTANCE_FILTERS = [
  { label: "All Distance", value: "all" },
  { label: "Within 5 km", value: "5" },
  { label: "Within 10 km", value: "10" },
  { label: "Within 25 km", value: "25" },
  { label: "All District", value: "district" },
];

/* Facility-type categories to visually distinguish from individual doctors */
const FACILITY_CATEGORIES = ["Hospital", "Clinic", "Diagnostic Center", "Pharmacy"];

function isFacility(category: string) {
  return FACILITY_CATEGORIES.includes(category);
}

/** Check if current runtime environment is a mobile phone/tablet client */
function checkIsMobileDevice(): boolean {
  if (Platform.OS !== "web") return true;
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
  return false;
}

/** Haversine formula distance calculation in kilometers */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/** Copy string content to system clipboard with web fallback */
async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else if (typeof document !== "undefined") {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      const success = document.execCommand("copy");
      document.body.removeChild(el);
      return success;
    }
    return false;
  } catch (err) {
    console.error("Clipboard copy error:", err);
    return false;
  }
}

/* ================================================================ */
/* HEALTHCARE CARD                                                    */
/* ================================================================ */

const HealthcareCard = memo(function HealthcareCard({
  listing,
  cardWidth,
  distanceKm,
  onBookAppointment,
  onCallNow,
}: {
  listing: BusinessDocument;
  cardWidth: string;
  distanceKm?: number | null;
  onBookAppointment: (listing: BusinessDocument) => void;
  onCallNow: (listing: BusinessDocument) => void;
}) {
  const facility = isFacility(listing.category);
  const verified = isHealthcareListingVerified(listing);
  const phoneVerified = isPhoneVerified(listing.phone);

  const getFacilityBadgeStyle = () => {
    if (listing.facilityType === "doctor_clinic") return s.doctorBadge;
    if (listing.facilityType === "private_clinic") return s.privateClinicBadge;
    if (listing.facilityType === "government_hospital") return s.govBadge;
    if (listing.facilityType === "diagnostic_center") return s.diagBadge;
    return facility ? s.facilityBadge : s.doctorBadge;
  };

  const getFacilityBadgeTextStyle = () => {
    if (listing.facilityType === "doctor_clinic") return s.doctorBadgeText;
    if (listing.facilityType === "private_clinic") return s.privateClinicBadgeText;
    if (listing.facilityType === "government_hospital") return s.govBadgeText;
    if (listing.facilityType === "diagnostic_center") return s.diagBadgeText;
    return facility ? s.facilityBadgeText : s.doctorBadgeText;
  };

  const getFacilityLabel = () => {
    if (listing.facilityType === "doctor_clinic") return "🩺 Doctor Clinic";
    if (listing.facilityType === "private_clinic") return "🏨 Private Clinic";
    if (listing.facilityType === "government_hospital") return "🏛️ Govt Facility";
    if (listing.facilityType === "diagnostic_center") return "🔬 Diagnostics";
    return facility ? "🏥 Facility" : "👨‍⚕️ Doctor";
  };

  return (
    <View style={[s.cardWrapper, { width: cardWidth as any }]}>
      <View style={s.card}>
        {/* Badge Header */}
        <View style={s.cardHeader}>
          <View style={[s.badge, getFacilityBadgeStyle()]}>
            <Text style={[s.badgeText, getFacilityBadgeTextStyle()]}>
              {getFacilityLabel()}
            </Text>
          </View>

          <View style={s.cardHeaderRight}>
            {distanceKm !== null && distanceKm !== undefined && (
              <View style={s.distanceBadge}>
                <Text style={s.distanceText}>📍 {distanceKm} km</Text>
              </View>
            )}

            {verified && (
              <View style={s.verifiedBadge}>
                <Text style={s.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Card Body - flex: 1 pushes actions to bottom */}
        <View style={s.cardBody}>
          {/* Individual Doctor Profile Highlight */}
          {listing.doctorName ? (
            <View style={s.doctorProfileBox}>
              <View style={s.doctorAvatarWrap}>
                <Text style={s.doctorAvatarEmoji}>
                  {listing.category === "Gynecologist" ? "👩‍⚕️" : "👨‍⚕️"}
                </Text>
              </View>
              <View style={s.doctorMetaWrap}>
                <Text style={s.doctorNameText} numberOfLines={1}>
                  {listing.doctorName}
                </Text>
                {listing.qualifications ? (
                  <Text style={s.doctorQualText} numberOfLines={1}>
                    {listing.qualifications}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Business / Clinic Name */}
          <Text style={s.cardName} numberOfLines={2}>
            {listing.businessName}
          </Text>

          <View style={s.specialtyRow}>
            <Text style={s.specialtyLabel}>Specialty:</Text>
            <Text style={s.specialtyValue}>{listing.category}</Text>
          </View>

          {listing.description ? (
            <Text style={s.cardDesc} numberOfLines={2}>
              {listing.description}
            </Text>
          ) : null}

          {/* Consultation Timings / Hours */}
          {listing.consultationTimings ? (
            <View style={s.infoRow}>
              <Text style={s.infoIcon}>🕒</Text>
              <Text style={s.timingText} numberOfLines={2}>
                {listing.consultationTimings}
              </Text>
            </View>
          ) : (listing.is24Hours || listing.openingTime) ? (
            <View style={s.infoRow}>
              <Text style={s.infoIcon}>🕐</Text>
              <Text style={s.infoText}>
                {listing.is24Hours
                  ? "Open 24 Hours"
                  : `${listing.openingTime} – ${listing.closingTime}`}
              </Text>
            </View>
          ) : null}

          {/* Address */}
          <View style={s.infoRow}>
            <Text style={s.infoIcon}>📍</Text>
            <Text style={s.infoText} numberOfLines={2}>
              {listing.address}
              {listing.locality ? `, ${listing.locality}` : ""}
              {listing.city ? `, ${listing.city}` : ""}
              {listing.pincode ? ` - ${listing.pincode}` : ""}
            </Text>
          </View>

          {/* Contact Information Status */}
          <View style={s.infoRow}>
            <Text style={s.infoIcon}>📞</Text>
            {phoneVerified ? (
              <Text style={[s.infoText, s.verifiedPhoneText]}>
                {listing.phone}
              </Text>
            ) : (
              <Text style={[s.infoText, s.unverifiedContactNotice]}>
                Contact details pending confirmation
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons - Anchored to bottom with marginTop: 'auto' */}
        <View style={s.cardActions}>
          {phoneVerified && (
            <Pressable
              onPress={() => onCallNow(listing)}
              style={({ pressed }) => [
                s.actionBtn,
                s.callBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Call ${listing.businessName}`}
            >
              <Text style={s.callBtnText}>📞 Call Clinic</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => onBookAppointment(listing)}
            style={({ pressed }) => [
              s.actionBtn,
              s.bookBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Consultation details for ${listing.businessName}`}
          >
            <Text style={s.bookBtnText}>📋 Consultation Info</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

/* ================================================================ */
/* SKELETON CARD                                                      */
/* ================================================================ */

function SkeletonCard({ cardWidth }: { cardWidth: string }) {
  return (
    <View style={[s.cardWrapper, { width: cardWidth as any }]}>
      <View style={[s.card, s.skeletonCard]}>
        <View style={s.cardHeader}>
          <View style={[s.skeletonBox, { width: 100, height: 22, borderRadius: 11 }]} />
        </View>
        <View style={s.cardBody}>
          <View style={[s.skeletonBox, { width: "75%", height: 18, borderRadius: 6 }]} />
          <View style={[s.skeletonBox, { width: "50%", height: 14, borderRadius: 6, marginTop: 8 }]} />
          <View style={[s.skeletonBox, { width: "90%", height: 12, borderRadius: 6, marginTop: 8 }]} />
          <View style={[s.skeletonBox, { width: "60%", height: 12, borderRadius: 6, marginTop: 6 }]} />
        </View>
        <View style={s.cardActions}>
          <View style={[s.skeletonBox, { width: "100%", height: 44, borderRadius: 12 }]} />
        </View>
      </View>
    </View>
  );
}

/* ================================================================ */
/* CONTENT WRAPPER                                                    */
/* ================================================================ */

function ContentWrap({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const isTablet = isTabletWidth(width);
  const contentPad = isMobile ? 16 : isTablet ? 36 : 0;

  return (
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
}

/* ================================================================ */
/* MAIN SCREEN                                                        */
/* ================================================================ */

export default function HealthcareScreen() {
  const insets = useSafeAreaInsets();
  const goBackToHome = useSafeBack("/");
  const { width, height } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const isTablet = isTabletWidth(width);

  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [rawListings, setRawListings] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const mountedRef = useRef(true);
  const inputRef = useRef<TextInput>(null);

  /* Nearby Discovery & Geolocation state */
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [distanceRadius, setDistanceRadius] = useState<string>("all");

  /* Manual Fallback & Filter state */
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>("all");
  const [selectedLocality, setSelectedLocality] = useState<string>("All");
  const [selectedPincode, setSelectedPincode] = useState<string>("All");

  /* Modal state for Call Now on desktop */
  const [callModalListing, setCallModalListing] = useState<BusinessDocument | null>(null);
  const [callModalCopied, setCallModalCopied] = useState(false);

  /* Modal state for Book Appointment */
  const [appointmentModalListing, setAppointmentModalListing] = useState<BusinessDocument | null>(null);
  const [appointmentCopied, setAppointmentCopied] = useState(false);

  /* ---- Data fetching with Cache & Background Revalidation ---- */
  const loadListings = useCallback(
    async (forceRefresh = false) => {
      // Check in-memory cache first for instant display
      if (!forceRefresh) {
        const cached = getCachedHealthcare("all");
        if (cached && cached.length > 0) {
          setRawListings(cached);
          setLoading(false);
          setError(false);
          return;
        }
      }

      setLoading(true);
      setError(false);
      setErrorMessage("");
      try {
        const result = await fetchHealthcareListings({
          forceRefresh,
        });
        if (!mountedRef.current) return;
        if (result.success) {
          setRawListings(result.data);
          setError(false);
        } else {
          setRawListings([]);
          setError(true);
          setErrorMessage(result.message);
        }
      } catch (err: any) {
        if (!mountedRef.current) return;
        setRawListings([]);
        setError(true);
        setErrorMessage(
          typeof __DEV__ !== "undefined" && __DEV__
            ? `Error: ${err?.message || "Failed to load listings"}`
            : "We couldn't reach the server. Please check your connection and try again."
        );
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    mountedRef.current = true;
    loadListings();
    return () => {
      mountedRef.current = false;
    };
  }, [loadListings]);

  /* ---- Search text & submit handlers ---- */
  const handleSearchSubmit = useCallback(() => {
    // Search is handled client-side instantly in processedListings
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText("");
  }, []);

  /* ---- Device Geolocation Handler ---- */
  const handleRequestDeviceLocation = async () => {
    setLocLoading(true);
    setLocError(null);

    // Platform: Web Browser check
    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.isSecureContext === false &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        setLocLoading(false);
        setLocError(
          "Browser geolocation requires a secure connection (HTTPS). Please select your locality or PIN code from the filters below."
        );
        return;
      }
    }

    try {
      // 1. Check whether location services (GPS) are enabled on device
      let servicesEnabled = true;
      try {
        servicesEnabled = await Location.hasServicesEnabledAsync();
      } catch {
        servicesEnabled = true;
      }

      if (!servicesEnabled) {
        setLocLoading(false);
        setLocError(
          "Device location services (GPS) are turned off. Please turn on GPS in your device settings or choose a locality below."
        );
        return;
      }

      // 2. Request foreground location permission
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== Location.PermissionStatus.GRANTED) {
        setLocLoading(false);
        setLocError(
          "Location permission was denied. Please allow location access in your device settings or choose a locality below."
        );
        return;
      }

      // 3. Obtain current coordinates with timeout protection
      const locPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("LOCATION_TIMEOUT")), 15000)
      );

      const loc = await Promise.race([locPromise, timeoutPromise]);

      if (loc && loc.coords) {
        setUserCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        setLocError(null);
      } else {
        setLocError(
          "Unable to determine current coordinates. Please check your GPS signal or select your locality below."
        );
      }
    } catch (err: any) {
      if (err?.message === "LOCATION_TIMEOUT") {
        setLocError(
          "Location request timed out. Please tap Try Again or select a locality below."
        );
      } else {
        // Fallback for web browser navigator if expo-location encountered an issue
        if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setLocLoading(false);
              setUserCoords({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
              setLocError(null);
            },
            (geoErr) => {
              setLocLoading(false);
              let msg = "Could not access location.";
              if (geoErr.code === 1) {
                msg = "Location permission was denied. Please allow location access or choose a locality below.";
              } else if (geoErr.code === 2) {
                msg = "GPS position unavailable. Please check device location settings or choose a locality below.";
              } else if (geoErr.code === 3) {
                msg = "Location request timed out. Please tap Try Again or choose a locality below.";
              }
              setLocError(msg);
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
          );
          return;
        }

        setLocError(
          "Could not access device location. Please ensure GPS is turned on or select your locality below."
        );
      }
    } finally {
      setLocLoading(false);
    }
  };

  const handleClearLocation = () => {
    setUserCoords(null);
    setLocError(null);
    setDistanceRadius("all");
  };

  /* ---- Process, Filter & Distance Sort Listings ---- */
  const processedListings = useMemo(() => {
    let result = rawListings.map((item) => {
      const hasCoords = Boolean(
        item.location?.coordinates &&
          (item.location.coordinates[0] !== 0 || item.location.coordinates[1] !== 0)
      );

      let distanceKm: number | null = null;
      if (userCoords && hasCoords) {
        distanceKm = calculateHaversineDistanceKm(
          userCoords.latitude,
          userCoords.longitude,
          item.location!.coordinates[1],
          item.location!.coordinates[0]
        );
      }

      return {
        item,
        distanceKm,
        hasCoords,
      };
    });

    // 0. Search Text Filter (instant client-side filtering across all fields)
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(({ item }) => {
        const name = (item.businessName || "").toLowerCase();
        const doc = (item.doctorName || "").toLowerCase();
        const qual = (item.qualifications || "").toLowerCase();
        const cat = (item.category || "").toLowerCase();
        const desc = (item.description || "").toLowerCase();
        const addr = (item.address || "").toLowerCase();
        const loc = (item.locality || "").toLowerCase();
        const svcs = (item.services || []).join(" ").toLowerCase();
        return (
          name.includes(q) ||
          doc.includes(q) ||
          qual.includes(q) ||
          cat.includes(q) ||
          desc.includes(q) ||
          addr.includes(q) ||
          loc.includes(q) ||
          svcs.includes(q)
        );
      });
    }

    // 0b. Specialty / Category Filter (instant client-side filtering)
    if (activeCategory !== "All") {
      const catLower = activeCategory.toLowerCase();
      result = result.filter(({ item }) =>
        (item.category || "").toLowerCase() === catLower
      );
    }

    // 1. Facility Type Filter
    if (selectedFacilityType !== "all") {
      result = result.filter(({ item }) => item.facilityType === selectedFacilityType);
    }

    // 2. Locality Filter
    if (selectedLocality !== "All") {
      const locLower = selectedLocality.toLowerCase();
      result = result.filter(({ item }) =>
        (item.locality || "").toLowerCase().includes(locLower)
      );
    }

    // 3. Pincode Filter
    if (selectedPincode !== "All") {
      result = result.filter(
        ({ item }) => (item.pincode || "").trim() === selectedPincode.trim()
      );
    }

    // 4. Distance Radius Filter
    if (userCoords && distanceRadius !== "all" && distanceRadius !== "district") {
      const maxKm = parseFloat(distanceRadius);
      result = result.filter(
        ({ distanceKm }) => distanceKm !== null && distanceKm <= maxKm
      );
    }

    // 5. Distance Sorting (when location is active)
    if (userCoords) {
      result.sort((a, b) => {
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        }
        if (a.distanceKm !== null) return -1;
        if (b.distanceKm !== null) return 1;
        return 0;
      });
    }

    // 6. Move the two doctor/clinic cards without confirmed contact details
    // (MaxHealth Multispecialty Clinic, Sri Sai Tejaswi Poly Clinic)
    // to the bottom of the healthcare results list. Preserve verified-contact clinics.
    const pinnedToBottom: typeof result = [];
    const standardListings: typeof result = [];
    for (const entry of result) {
      const name = (entry.item.businessName || "").toLowerCase();
      if (name.includes("maxhealth") || name.includes("sri sai tejaswi")) {
        pinnedToBottom.push(entry);
      } else {
        standardListings.push(entry);
      }
    }
    result = [...standardListings, ...pinnedToBottom];

    return result;
  }, [
    rawListings,
    searchText,
    userCoords,
    selectedFacilityType,
    selectedLocality,
    selectedPincode,
    distanceRadius,
    activeCategory,
  ]);

  /* ---- Layout helpers ---- */
  const getCardWidth = () => {
    if (isMobile) return "100%";
    if (isTablet) return "48.5%";
    return "32%";
  };

  /* ---- Dial action helper ---- */
  const triggerPhoneDialer = (phone: string) => {
    const clean = phone.replace(/\s+/g, "");
    const telUrl = `tel:${clean}`;
    Linking.openURL(telUrl).catch(() => {
      if (Platform.OS === "web") {
        window.open(telUrl, "_self");
      }
    });
  };

  /* ---- Call Now Handler ---- */
  const handleCallNow = (listing: BusinessDocument) => {
    if (!isPhoneVerified(listing.phone)) {
      return; // Never dial for unverified numbers
    }

    const isMobileDevice = checkIsMobileDevice();
    if (isMobileDevice) {
      triggerPhoneDialer(listing.phone!);
    } else {
      setCallModalCopied(false);
      setCallModalListing(listing);
    }
  };

  /* ---- Book Appointment Handler ---- */
  const handleBookAppointment = (listing: BusinessDocument) => {
    setAppointmentCopied(false);
    setAppointmentModalListing(listing);
  };

  /* ---- Copy Number Helpers ---- */
  const handleCopyCallModalPhone = async () => {
    if (!callModalListing?.phone) return;
    const ok = await copyToClipboard(callModalListing.phone);
    if (ok) {
      setCallModalCopied(true);
      setTimeout(() => setCallModalCopied(false), 2500);
    }
  };

  const handleCopyAppointmentPhone = async () => {
    if (!appointmentModalListing?.phone) return;
    const ok = await copyToClipboard(appointmentModalListing.phone);
    if (ok) {
      setAppointmentCopied(true);
      setTimeout(() => setAppointmentCopied(false), 2500);
    }
  };

  const appointmentEffectiveTimings =
    appointmentModalListing?.consultationTimings ||
    (appointmentModalListing?.is24Hours
      ? "Open 24 Hours"
      : appointmentModalListing?.openingTime
      ? `${appointmentModalListing.openingTime}${appointmentModalListing.closingTime ? ` – ${appointmentModalListing.closingTime}` : ""}`
      : null);

  const appointmentEffectiveSetting =
    appointmentModalListing?.consultationSetting ||
    (appointmentModalListing?.facilityType === "doctor_clinic"
      ? "Doctor Clinic (OPD)"
      : appointmentModalListing?.facilityType === "government_hospital"
      ? "Government Hospital"
      : appointmentModalListing?.facilityType === "diagnostic_center"
      ? "Diagnostic Center"
      : appointmentModalListing?.facilityType === "private_clinic"
      ? "Private Clinic / Hospital"
      : null);

  const appointmentFormattedAddress = appointmentModalListing
    ? [
        appointmentModalListing.address,
        appointmentModalListing.locality,
        appointmentModalListing.city,
      ]
        .filter(Boolean)
        .join(", ") +
      (appointmentModalListing.pincode
        ? ` - ${appointmentModalListing.pincode}`
        : "")
    : "";

  return (
    <View style={s.page}>
      {/* ---- Sticky Header ---- */}
      <View style={[s.header, { paddingTop: insets.top }]}>
        <View style={s.headerInner}>
          <Pressable
            onPress={goBackToHome}
            style={({ pressed }) => [s.backBtn, { opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Go back to home"
          >
            <Text style={s.backArrow}>←</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/")} accessibilityRole="link">
            <Text style={s.headerLogo}>
              Nalgonda<Text style={s.headerLogoAccent}>One</Text>
            </Text>
          </Pressable>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ============================================================ */}
        {/* HERO SECTION                                                  */}
        {/* ============================================================ */}
        <View style={s.heroSection}>
          <View pointerEvents="none" style={s.heroBlob1} />
          <View pointerEvents="none" style={s.heroBlob2} />
          <View pointerEvents="none" style={s.heroBlob3} />

          <ContentWrap style={{ zIndex: 2, paddingTop: 32, paddingBottom: 28 }}>
            <Text style={s.heroKicker}>DOCTORS & HEALTHCARE DIRECTORY</Text>
            <Text style={[s.heroTitle, { fontSize: isMobile ? 28 : 38 }]}>
              Find Doctors in Nalgonda
            </Text>
            <Text style={s.heroSub}>
              Discover independent doctors, private consultation clinics, and medical
              facilities across Nalgonda town and district.
            </Text>

            {/* Search Bar */}
            <View style={[s.searchContainer, isMobile && s.searchContainerMobile]}>
              <Pressable
                key="search-icon"
                onPress={handleSearchSubmit}
                style={({ pressed }) => [
                  s.searchIconWrap,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Submit search"
              >
                <Text style={[s.searchIcon, isMobile && s.searchIconMobile]} accessibilityElementsHidden>
                  🔍
                </Text>
              </Pressable>
              <TextInput
                key="search-input"
                ref={inputRef}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearchSubmit}
                placeholder={
                  isMobile
                    ? "Search doctors, clinics, specialties..."
                    : "Search by doctor name, specialty, clinic or locality..."
                }
                placeholderTextColor={SLATE_400}
                style={[
                  s.searchInput,
                  isMobile && s.searchInputMobile,
                ] as any}
                returnKeyType="search"
                accessibilityLabel="Search doctors and clinics"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchText.length > 0 && (
                <Pressable
                  key="search-clear"
                  onPress={handleClearSearch}
                  style={({ pressed }) => [
                    s.clearBtn,
                    isMobile && s.clearBtnMobile,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <Text style={s.clearText}>✕</Text>
                </Pressable>
              )}
            </View>
          </ContentWrap>
        </View>

        {/* ============================================================ */}
        {/* NEARBY DISCOVERY & FILTER CONTROL PANEL                       */}
        {/* ============================================================ */}
        <ContentWrap style={{ paddingTop: 20 }}>
          <View style={s.discoveryPanel}>
            {/* Top Discovery Action Row: Location Toggle & Facility Type */}
            <View style={[s.discoveryTopRow, isMobile && s.discoveryTopRowMobile]}>
              {userCoords ? (
                <View style={[s.activeGpsBadgeWrap, isMobile && s.activeGpsBadgeWrapMobile]}>
                  <View style={s.activeGpsIndicator} />
                  <Text style={[s.activeGpsText, isMobile && s.activeGpsTextMobile]} numberOfLines={2}>
                    📍 Location Active ({userCoords.latitude.toFixed(2)}°, {userCoords.longitude.toFixed(2)}°)
                  </Text>
                  <Pressable
                    onPress={handleClearLocation}
                    style={[s.clearGpsBtn, isMobile && s.clearGpsBtnMobile]}
                    accessibilityRole="button"
                    accessibilityLabel="Clear location filter"
                  >
                    <Text style={s.clearGpsText}>Clear GPS</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={handleRequestDeviceLocation}
                  disabled={locLoading}
                  style={({ pressed }) => [
                    s.locationPromptBtn,
                    isMobile && s.locationPromptBtnMobile,
                    { opacity: pressed || locLoading ? 0.8 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Use device location to find nearby doctors"
                >
                  <Text style={s.locationPromptIcon}>📍</Text>
                  <Text style={s.locationPromptText}>
                    {locLoading ? "Detecting Location..." : "Use Current Location"}
                  </Text>
                </Pressable>
              )}

              {/* Facility Type Selector Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[s.facilityScroll, isMobile && s.facilityScrollMobile]}
                contentContainerStyle={s.facilityScrollRow}
              >
                {FACILITY_TYPES.map((f) => {
                  const isSelected = selectedFacilityType === f.value;
                  return (
                    <Pressable
                      key={f.value}
                      onPress={() => setSelectedFacilityType(f.value)}
                      style={[
                        s.facilityPill,
                        isSelected && s.facilityPillActive,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Filter by ${f.label}`}
                    >
                      <Text style={s.facilityPillEmoji}>{f.emoji}</Text>
                      <Text
                        style={[
                          s.facilityPillText,
                          isSelected && s.facilityPillTextActive,
                        ]}
                      >
                        {f.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Location Permission / Error Alert with Retry Action */}
            {locError && (
              <View style={[s.locErrorBox, isMobile && s.locErrorBoxMobile]}>
                <View style={s.locErrorContent}>
                  <Text style={s.locErrorIcon}>⚠️</Text>
                  <Text style={s.locErrorText}>{locError}</Text>
                </View>
                <Pressable
                  onPress={handleRequestDeviceLocation}
                  disabled={locLoading}
                  style={({ pressed }) => [
                    s.locRetryBtn,
                    { opacity: pressed || locLoading ? 0.7 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Retry device location"
                >
                  <Text style={s.locRetryBtnText}>
                    {locLoading ? "Detecting..." : "🔄 Try Again"}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Distance Filter (Active when device location is available) */}
            {userCoords && (
              <View style={[s.distanceFilterRow, isMobile && s.distanceFilterRowMobile]}>
                <Text style={[s.filterRowLabel, isMobile && s.filterRowLabelMobile]}>Distance Radius:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={s.rowScrollView}
                  contentContainerStyle={s.distancePillGroup}
                >
                  {DISTANCE_FILTERS.map((df) => {
                    const isSelected = distanceRadius === df.value;
                    return (
                      <Pressable
                        key={df.value}
                        onPress={() => setDistanceRadius(df.value)}
                        style={[
                          s.distancePill,
                          isSelected && s.distancePillActive,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Distance radius ${df.label}`}
                      >
                        <Text
                          style={[
                            s.distancePillText,
                            isSelected && s.distancePillTextActive,
                          ]}
                        >
                          {df.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Manual Locality & PIN Fallback Filters */}
            <View style={s.fallbackFilterRow}>
              <View style={[s.fallbackGroup, isMobile && s.fallbackGroupMobile]}>
                <Text style={[s.fallbackLabel, isMobile && s.fallbackLabelMobile]}>Locality:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={s.rowScrollView}
                  contentContainerStyle={s.fallbackChipRow}
                >
                  {LOCALITIES.map((loc) => {
                    const isSelected = selectedLocality === loc;
                    return (
                      <Pressable
                        key={loc}
                        onPress={() => setSelectedLocality(loc)}
                        style={[
                          s.fallbackChip,
                          isSelected && s.fallbackChipActive,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`Locality ${loc}`}
                      >
                        <Text
                          style={[
                            s.fallbackChipText,
                            isSelected && s.fallbackChipTextActive,
                          ]}
                        >
                          {loc}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={[s.fallbackGroup, { marginTop: 8 }, isMobile && s.fallbackGroupMobile]}>
                <Text style={[s.fallbackLabel, isMobile && s.fallbackLabelMobile]}>PIN Code:</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={s.rowScrollView}
                  contentContainerStyle={s.fallbackChipRow}
                >
                  {PINCODES.map((pin) => {
                    const isSelected = selectedPincode === pin;
                    return (
                      <Pressable
                        key={pin}
                        onPress={() => setSelectedPincode(pin)}
                        style={[
                          s.fallbackChip,
                          isSelected && s.fallbackChipActive,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={`PIN code ${pin}`}
                      >
                        <Text
                          style={[
                            s.fallbackChipText,
                            isSelected && s.fallbackChipTextActive,
                          ]}
                        >
                          {pin}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </View>
        </ContentWrap>

        {/* ============================================================ */}
        {/* SPECIALTY CATEGORY FILTERS                                    */}
        {/* ============================================================ */}
        <ContentWrap style={{ paddingTop: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.specialtyScrollView}
            contentContainerStyle={s.filterContainer}
            accessibilityRole="tablist"
          >
            {SPECIALTIES.map((spec) => {
              const isActive = spec.value === activeCategory;
              return (
                <Pressable
                  key={spec.value}
                  onPress={() => setActiveCategory(spec.value)}
                  style={({ pressed, hovered }: any) => [
                    s.filterChip,
                    isActive ? s.filterChipActive : s.filterChipInactive,
                    { opacity: pressed ? 0.8 : 1 },
                    Platform.OS === "web" && hovered && !isActive
                      ? s.filterChipHovered
                      : null,
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Specialty: ${spec.label}`}
                >
                  <Text style={s.filterEmoji}>{spec.emoji}</Text>
                  <Text style={[s.filterText, isActive && s.filterTextActive]}>
                    {spec.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </ContentWrap>

        {/* ============================================================ */}
        {/* RESULTS                                                       */}
        {/* ============================================================ */}
        <ContentWrap style={{ paddingTop: 20, paddingBottom: 80 }}>
          {/* Results Summary Header */}
          {!loading && !error && (
            <View style={s.resultsMetaRow}>
              <Text style={s.resultsCount}>
                {processedListings.length > 0
                  ? `${processedListings.length} provider${processedListings.length > 1 ? "s" : ""} found`
                  : "0 providers found"}
              </Text>
              {userCoords && (
                <Text style={s.sortedDistanceNotice}>
                  Sorted by distance from your location
                </Text>
              )}
            </View>
          )}

          {/* Loading state */}
          {loading && (
            <View style={s.listingGrid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} cardWidth={getCardWidth()} />
              ))}
            </View>
          )}

          {/* Error state */}
          {error && !loading && (
            <ErrorState
              icon="⚠️"
              title="Unable to load healthcare listings"
              description={
                errorMessage ||
                "We couldn't reach the server. Please check your connection and try again."
              }
              retryLabel="Retry"
              onRetry={() => loadListings(true)}
            />
          )}

          {/* Empty state */}
          {!loading && !error && processedListings.length === 0 && (
            <EmptyState
              icon="🩺"
              title="No doctors or clinics found"
              description={
                searchText.trim()
                  ? `No listings match "${searchText}". Try a broader term or different distance filter.`
                  : activeCategory !== "All"
                  ? `No providers found for ${activeCategory} within the selected location or radius filter.`
                  : selectedFacilityType !== "all" || selectedLocality !== "All" || selectedPincode !== "All"
                  ? "No providers match the current location or facility filter. Try resetting filters."
                  : "No healthcare providers have been listed matching your criteria. Check back soon!"
              }
              actionLabel="Reset All Filters"
              onAction={() => {
                setSearchText("");
                setActiveCategory("All");
                setSelectedFacilityType("all");
                setSelectedLocality("All");
                setSelectedPincode("All");
                setDistanceRadius("all");
              }}
            />
          )}

          {/* Listing cards grid */}
          {!loading && !error && processedListings.length > 0 && (
            <View style={s.listingGrid}>
              {processedListings.map(({ item, distanceKm }) => (
                <HealthcareCard
                  key={item._id}
                  listing={item}
                  cardWidth={getCardWidth()}
                  distanceKm={distanceKm}
                  onBookAppointment={handleBookAppointment}
                  onCallNow={handleCallNow}
                />
              ))}
            </View>
          )}
        </ContentWrap>
      </ScrollView>

      {/* ============================================================ */}
      {/* DESKTOP CALL NOW DIALOG                                       */}
      {/* Displayed only for verified phone numbers on desktop         */}
      {/* ============================================================ */}
      {callModalListing && (
        <Modal
          visible={Boolean(callModalListing)}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setCallModalListing(null)}
        >
          <Pressable
            style={s.modalOverlay}
            onPress={() => setCallModalListing(null)}
          >
            <Pressable
              style={s.modalCard}
              onPress={(e) => e.stopPropagation()}
              accessibilityLabel="Verified Facility Contact Dialog"
            >
              {/* Header */}
              <View style={s.modalHeader}>
                <View style={s.modalIconWrap}>
                  <Text style={s.modalIcon}>📞</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.modalTitle}>Clinic Contact</Text>
                  <Text style={s.modalSubtitle} numberOfLines={1}>
                    {callModalListing.doctorName || callModalListing.businessName}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setCallModalListing(null)}
                  style={s.modalCloseIconBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Close dialog"
                >
                  <Text style={s.modalCloseIconText}>✕</Text>
                </Pressable>
              </View>

              {/* Verified Phone Box */}
              <View style={s.modalPhoneBox}>
                <Text style={s.modalPhoneLabel}>Verified Contact Number</Text>
                <Text style={s.modalPhoneNumber} selectable={true}>
                  {callModalListing.phone}
                </Text>
              </View>

              <Text style={s.modalMessage}>
                Direct telephone dialing via browser is configured for mobile devices. On desktop, copy the verified number below to place a call from your phone.
              </Text>

              {/* Actions */}
              <View style={s.modalActions}>
                <Pressable
                  onPress={handleCopyCallModalPhone}
                  style={({ pressed }) => [
                    s.modalBtn,
                    s.copyBtn,
                    callModalCopied ? s.copyBtnSuccess : null,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={callModalCopied ? "Phone number copied" : "Copy Number"}
                >
                  <Text style={s.copyBtnIcon}>{callModalCopied ? "✓" : "📋"}</Text>
                  <Text style={[s.copyBtnText, callModalCopied ? s.copyBtnTextSuccess : null]}>
                    {callModalCopied ? "Copied to clipboard!" : "Copy Number"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setCallModalListing(null)}
                  style={({ pressed }) => [
                    s.modalBtn,
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
      )}

      {/* ============================================================ */}
      {/* CONSULTATION INFO & APPOINTMENT DIALOG                        */}
      {/* ============================================================ */}
      {appointmentModalListing && (
        <Modal
          visible={Boolean(appointmentModalListing)}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setAppointmentModalListing(null)}
        >
          <Pressable
            style={[
              s.modalOverlay,
              {
                paddingTop: Math.max(insets.top + 16, 20),
                paddingBottom: Math.max(insets.bottom + 16, 20),
                paddingHorizontal: 16,
              },
            ]}
            onPress={() => setAppointmentModalListing(null)}
          >
            <Pressable
              style={[
                s.modalCard,
                isMobile && s.modalCardMobile,
                {
                  maxHeight: Math.min(
                    height - (insets.top + insets.bottom + 36),
                    660
                  ),
                },
              ]}
              onPress={(e) => e.stopPropagation()}
              accessibilityLabel="Consultation Information Dialog"
            >
              {/* Header */}
              <View style={[s.modalHeader, isMobile && s.modalHeaderMobile]}>
                <View style={[s.modalIconWrap, isMobile && s.modalIconWrapMobile, { backgroundColor: "#DBEAFE" }]}>
                  <Text style={[s.modalIcon, isMobile && s.modalIconMobile]}>📋</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                  <Text style={[s.modalTitle, isMobile && s.modalTitleMobile]}>Consultation Details</Text>
                  <Text style={[s.modalSubtitle, isMobile && s.modalSubtitleMobile]} numberOfLines={2}>
                    {appointmentModalListing.doctorName
                      ? `${appointmentModalListing.doctorName} — ${appointmentModalListing.businessName}`
                      : appointmentModalListing.businessName}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setAppointmentModalListing(null)}
                  style={({ pressed }) => [
                    s.modalCloseIconBtn,
                    isMobile && s.modalCloseIconBtnMobile,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityRole="button"
                  accessibilityLabel="Close dialog"
                >
                  <Text style={s.modalCloseIconText}>✕</Text>
                </Pressable>
              </View>

              {/* Scrollable content area */}
              <ScrollView
                style={[
                  s.modalScrollArea,
                  {
                    maxHeight: Math.min(
                      height - (insets.top + insets.bottom + 170),
                      520
                    ),
                  },
                ]}
                contentContainerStyle={s.modalScrollContent}
                showsVerticalScrollIndicator={true}
                bounces={false}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {/* Consultation Details Box */}
                <View style={[s.appointmentDetailBox, isMobile && s.appointmentDetailBoxMobile]}>
                  {appointmentModalListing.doctorName ? (
                    <View style={[s.detailRow, isMobile && s.detailRowMobile]}>
                      <Text style={[s.detailLabel, isMobile && s.detailLabelMobile]}>Doctor:</Text>
                      <Text style={[s.detailValue, isMobile && s.detailValueMobile]}>
                        {appointmentModalListing.doctorName}
                        {appointmentModalListing.qualifications
                          ? ` (${appointmentModalListing.qualifications})`
                          : ""}
                      </Text>
                    </View>
                  ) : appointmentModalListing.qualifications ? (
                    <View style={[s.detailRow, isMobile && s.detailRowMobile]}>
                      <Text style={[s.detailLabel, isMobile && s.detailLabelMobile]}>Qualifications:</Text>
                      <Text style={[s.detailValue, isMobile && s.detailValueMobile]}>
                        {appointmentModalListing.qualifications}
                      </Text>
                    </View>
                  ) : null}
                  <View style={[s.detailRow, isMobile && s.detailRowMobile]}>
                    <Text style={[s.detailLabel, isMobile && s.detailLabelMobile]}>Facility:</Text>
                    <Text style={[s.detailValue, isMobile && s.detailValueMobile]}>{appointmentModalListing.businessName}</Text>
                  </View>
                  <View style={[s.detailRow, isMobile && s.detailRowMobile]}>
                    <Text style={[s.detailLabel, isMobile && s.detailLabelMobile]}>Specialty:</Text>
                    <Text style={[s.detailValue, isMobile && s.detailValueMobile]}>{appointmentModalListing.category}</Text>
                  </View>
                  {appointmentEffectiveTimings ? (
                    <View style={[s.detailRow, isMobile && s.detailRowMobile]}>
                      <Text style={[s.detailLabel, isMobile && s.detailLabelMobile]}>Timings:</Text>
                      <Text style={[s.detailValue, isMobile && s.detailValueMobile]}>{appointmentEffectiveTimings}</Text>
                    </View>
                  ) : null}
                  {appointmentEffectiveSetting ? (
                    <View style={[s.detailRow, isMobile && s.detailRowMobile]}>
                      <Text style={[s.detailLabel, isMobile && s.detailLabelMobile]}>Setting:</Text>
                      <Text style={[s.detailValue, isMobile && s.detailValueMobile]}>{appointmentEffectiveSetting}</Text>
                    </View>
                  ) : null}
                  {appointmentFormattedAddress ? (
                    <View style={[s.detailRow, isMobile && s.detailRowMobile]}>
                      <Text style={[s.detailLabel, isMobile && s.detailLabelMobile]}>Address:</Text>
                      <Text style={[s.detailValue, isMobile && s.detailValueMobile]}>
                        {appointmentFormattedAddress}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Contact Status Section */}
                {isPhoneVerified(appointmentModalListing.phone) ? (
                  <View style={[s.confirmedContactBox, isMobile && s.confirmedContactBoxMobile]}>
                    <Text style={[s.confirmedContactLabel, isMobile && s.confirmedContactLabelMobile]}>Confirmed Clinic Contact</Text>
                    <Text style={[s.confirmedContactNumber, isMobile && s.confirmedContactNumberMobile]} selectable={true}>
                      {appointmentModalListing.phone}
                    </Text>
                    <View style={s.contactActionRow}>
                      <Pressable
                        onPress={handleCopyAppointmentPhone}
                        style={({ pressed }) => [
                          s.inlineActionBtn,
                          isMobile && s.inlineActionBtnMobile,
                          appointmentCopied ? s.inlineCopyBtnSuccess : s.inlineCopyBtn,
                          { opacity: pressed ? 0.85 : 1 },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Copy verified phone number"
                      >
                        <Text style={[s.inlineActionText, isMobile && s.inlineActionTextMobile]}>
                          {appointmentCopied ? "✓ Copied!" : "📋 Copy"}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => triggerPhoneDialer(appointmentModalListing.phone!)}
                        style={({ pressed }) => [
                          s.inlineActionBtn,
                          isMobile && s.inlineActionBtnMobile,
                          s.inlineCallBtn,
                          { opacity: pressed ? 0.85 : 1 },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="Call verified number"
                      >
                        <Text style={[s.inlineCallText, isMobile && s.inlineCallTextMobile]}>📞 Call</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View style={[s.unverifiedAlertBox, isMobile && s.unverifiedAlertBoxMobile]}>
                    <View style={s.unverifiedAlertHeader}>
                      <Text style={s.unverifiedAlertIcon}>⚠️</Text>
                      <Text style={[s.unverifiedAlertTitle, isMobile && s.unverifiedAlertTitleMobile]}>Contact pending confirmation</Text>
                    </View>
                    <Text style={[s.unverifiedAlertDesc, isMobile && s.unverifiedAlertDescMobile]}>
                      Contact numbers are being verified with official registries. Direct dialing is temporarily withheld.
                    </Text>
                  </View>
                )}

                {/* Mandatory Booking Notice */}
                <View style={[s.appointmentDisclaimerBox, isMobile && s.appointmentDisclaimerBoxMobile]}>
                  <Text style={s.appointmentDisclaimerIcon}>ℹ️</Text>
                  <Text style={[s.appointmentDisclaimerText, isMobile && s.appointmentDisclaimerTextMobile]}>
                    Contact the clinic directly to confirm availability. NalgondaOne provides directory listings only.
                  </Text>
                </View>
              </ScrollView>

              {/* Dialog Close Button - always visible outside scroll */}
              <Pressable
                onPress={() => setAppointmentModalListing(null)}
                style={({ pressed }) => [
                  s.modalFullCloseBtn,
                  isMobile && s.modalFullCloseBtnMobile,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
              >
                <Text style={[s.modalFullCloseBtnText, isMobile && s.modalFullCloseBtnTextMobile]}>Close</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
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
    ...(Platform.OS === "web"
      ? {
          overflowX: "hidden" as any,
          maxWidth: "100vw" as any,
        }
      : {}),
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
  headerLogo: {
    fontSize: 20,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.5,
    ...WEB_FONT,
  },
  headerLogoAccent: {
    color: BRAND,
  },

  /* ---- hero ---- */
  heroSection: {
    backgroundColor: "#EFF6FF",
    overflow: "hidden",
  },
  heroBlob1: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "#BFDBFE",
    opacity: 0.25,
    top: -170,
    right: -120,
    ...(Platform.OS === "web" ? { pointerEvents: "none" as any } : {}),
  },
  heroBlob2: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#A7F3D0",
    opacity: 0.15,
    bottom: -110,
    left: -90,
    ...(Platform.OS === "web" ? { pointerEvents: "none" as any } : {}),
  },
  heroBlob3: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#DDD6FE",
    opacity: 0.12,
    top: 20,
    left: "50%" as any,
    ...(Platform.OS === "web" ? { pointerEvents: "none" as any } : {}),
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: BRAND,
    marginBottom: 6,
    ...WEB_FONT,
  },
  heroTitle: {
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -1.5,
    ...WEB_FONT,
  },
  heroSub: {
    fontSize: 15,
    color: SLATE_500,
    marginTop: 6,
    lineHeight: 22,
    ...WEB_FONT,
  },

  /* ---- search ---- */
  searchContainer: {
    marginTop: 20,
    height: 56,
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    paddingRight: 14,
    width: "100%",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 4px 20px rgba(37, 99, 235, 0.08)",
          boxSizing: "border-box" as any,
        }
      : {}),
  },
  searchContainerMobile: {
    height: 50,
    borderRadius: 14,
    paddingLeft: 2,
    paddingRight: 10,
    marginTop: 16,
  },
  searchIconWrap: {
    justifyContent: "center",
    alignItems: "center",
    width: 44,
    height: 44,
    borderRadius: 12,
    flexShrink: 0,
  },
  searchIcon: {
    fontSize: 18,
    color: SLATE_400,
  },
  searchIconMobile: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    flexGrow: 1,
    height: "100%",
    fontSize: 15,
    color: SLATE_900,
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 4,
    ...(Platform.OS === "web"
      ? {
          outlineStyle: "none" as any,
          boxShadow: "none" as any,
        }
      : {}),
    ...WEB_FONT,
  } as any,
  searchInputMobile: {
    fontSize: 14,
    paddingHorizontal: 2,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: SLATE_100,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  clearBtnMobile: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  clearText: {
    fontSize: 12,
    color: SLATE_400,
    fontWeight: "700",
  },

  /* ---- nearby discovery panel ---- */
  discoveryPanel: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    gap: 12,
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
          overflow: "hidden" as any,
        }
      : {}),
  },
  discoveryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  discoveryTopRowMobile: {
    flexDirection: "column" as any,
    alignItems: "flex-start" as any,
    gap: 10,
  },
  locationPromptBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 12,
    gap: 6,
    flexShrink: 0,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)" }
      : {}),
  },
  locationPromptBtnMobile: {
    alignSelf: "flex-start",
    height: 42,
    paddingHorizontal: 14,
    paddingVertical: 0,
    justifyContent: "center",
  },
  locationPromptIcon: {
    fontSize: 14,
    color: WHITE,
  },
  locationPromptText: {
    fontSize: 13,
    fontWeight: "800",
    color: WHITE,
    ...WEB_FONT,
  },
  activeGpsBadgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 8,
    flexShrink: 0,
  },
  activeGpsBadgeWrapMobile: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexWrap: "wrap" as any,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },
  activeGpsIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A",
    flexShrink: 0,
  },
  activeGpsText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
    ...WEB_FONT,
  },
  activeGpsTextMobile: {
    fontSize: 11,
    flexShrink: 1,
    minWidth: 0,
  },
  clearGpsBtn: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  clearGpsBtnMobile: {
    minHeight: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  clearGpsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803D",
    ...WEB_FONT,
  },
  facilityScroll: {
    flex: 1,
    minWidth: 0,
    ...(Platform.OS === "web"
      ? {
          overflowX: "auto" as any,
          WebkitOverflowScrolling: "touch" as any,
        }
      : {}),
  },
  facilityScrollMobile: {
    width: "100%",
    maxWidth: "100%",
    alignSelf: "stretch",
    flexGrow: 0,
  },
  facilityScrollRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  facilityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: SLATE_100,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    flexShrink: 0,
  },
  facilityPillActive: {
    backgroundColor: "#1E293B",
  },
  facilityPillEmoji: {
    fontSize: 13,
  },
  facilityPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },
  facilityPillTextActive: {
    color: WHITE,
  },
  locErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 10,
    marginTop: 10,
  },
  locErrorBoxMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
  },
  locErrorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  locErrorIcon: {
    fontSize: 16,
  },
  locErrorText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
    flex: 1,
    ...WEB_FONT,
  },
  locRetryBtn: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  locRetryBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "700",
    ...WEB_FONT,
  },
  distanceFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: SLATE_100,
  },
  distanceFilterRowMobile: {
    paddingTop: 8,
    gap: 8,
  },
  filterRowLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: SLATE_500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flexShrink: 0,
    ...WEB_FONT,
  },
  filterRowLabelMobile: {
    fontSize: 11,
    fontWeight: "800",
    flexShrink: 0,
  },
  rowScrollView: {
    flex: 1,
    minWidth: 0,
    maxWidth: "100%",
    ...(Platform.OS === "web"
      ? {
          overflowX: "auto" as any,
          WebkitOverflowScrolling: "touch" as any,
        }
      : {}),
  },
  distancePillGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  distancePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: SLATE_100,
    flexShrink: 0,
  },
  distancePillActive: {
    backgroundColor: BRAND,
  },
  distancePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },
  distancePillTextActive: {
    color: WHITE,
  },
  fallbackFilterRow: {
    borderTopWidth: 1,
    borderTopColor: SLATE_100,
    paddingTop: 8,
  },
  fallbackGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fallbackGroupMobile: {
    gap: 8,
  },
  fallbackLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: SLATE_400,
    textTransform: "uppercase",
    width: 65,
    flexShrink: 0,
    ...WEB_FONT,
  },
  fallbackLabelMobile: {
    fontSize: 11,
    fontWeight: "800",
    width: 65,
    flexShrink: 0,
  },
  fallbackChipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fallbackChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: SLATE_50,
    borderWidth: 1,
    borderColor: SLATE_200,
    flexShrink: 0,
  },
  fallbackChipActive: {
    backgroundColor: "#DBEAFE",
    borderColor: BRAND,
  },
  fallbackChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },
  fallbackChipTextActive: {
    color: BRAND_DARK,
  },

  /* ---- specialty filters ---- */
  specialtyScrollView: {
    width: "100%",
    maxWidth: "100%",
    ...(Platform.OS === "web"
      ? {
          overflowX: "auto" as any,
          WebkitOverflowScrolling: "touch" as any,
        }
      : {}),
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  filterChipActive: {
    backgroundColor: BRAND,
    borderColor: BRAND,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)" }
      : {}),
  },
  filterChipInactive: {
    backgroundColor: WHITE,
    borderColor: SLATE_100,
  },
  filterChipHovered: {
    borderColor: SLATE_300,
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: SLATE_500,
    ...WEB_FONT,
  },
  filterTextActive: {
    color: WHITE,
  },

  /* ---- results ---- */
  resultsMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  resultsCount: {
    fontSize: 13,
    color: SLATE_700,
    fontWeight: "700",
    ...WEB_FONT,
  },
  sortedDistanceNotice: {
    fontSize: 12,
    color: BRAND,
    fontWeight: "700",
    ...WEB_FONT,
  },
  listingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "stretch",
  },

  /* ---- card wrapper & card ---- */
  cardWrapper: {
    display: "flex",
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SLATE_100,
    overflow: "hidden",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 2px 12px rgba(15, 23, 42, 0.05)",
          transition: "box-shadow 0.2s ease, transform 0.2s ease" as any,
        }
      : {}),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  facilityBadge: {
    backgroundColor: "#DBEAFE",
  },
  doctorBadge: {
    backgroundColor: "#ECFDF5",
  },
  privateClinicBadge: {
    backgroundColor: "#F5F3FF",
  },
  govBadge: {
    backgroundColor: "#EFF6FF",
  },
  diagBadge: {
    backgroundColor: "#FFFBEB",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    ...WEB_FONT,
  },
  facilityBadgeText: {
    color: "#1D4ED8",
  },
  doctorBadgeText: {
    color: "#047857",
  },
  privateClinicBadgeText: {
    color: "#6D28D9",
  },
  govBadgeText: {
    color: "#1D4ED8",
  },
  diagBadgeText: {
    color: "#B45309",
  },
  distanceBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#0369A1",
    ...WEB_FONT,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "800",
    color: SUCCESS,
    ...WEB_FONT,
  },
  cardBody: {
    padding: 16,
    paddingTop: 12,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  doctorProfileBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
    gap: 8,
  },
  doctorAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  doctorAvatarEmoji: {
    fontSize: 18,
  },
  doctorMetaWrap: {
    flex: 1,
  },
  doctorNameText: {
    fontSize: 14,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  doctorQualText: {
    fontSize: 11,
    fontWeight: "600",
    color: SLATE_500,
    ...WEB_FONT,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.3,
    ...WEB_FONT,
  },
  specialtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  specialtyLabel: {
    fontSize: 12,
    color: SLATE_500,
    fontWeight: "600",
    ...WEB_FONT,
  },
  specialtyValue: {
    fontSize: 12.5,
    color: BRAND,
    fontWeight: "800",
    ...WEB_FONT,
  },
  cardDesc: {
    fontSize: 12.5,
    color: SLATE_500,
    marginTop: 8,
    lineHeight: 18,
    ...WEB_FONT,
  },
  timingText: {
    fontSize: 12,
    color: SLATE_700,
    fontWeight: "600",
    flex: 1,
    ...WEB_FONT,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 8,
  },
  infoIcon: {
    fontSize: 13,
    marginTop: 1,
  },
  infoText: {
    fontSize: 12.5,
    color: SLATE_500,
    flex: 1,
    lineHeight: 18,
    ...WEB_FONT,
  },
  verifiedPhoneText: {
    fontWeight: "700",
    color: SLATE_900,
  },
  unverifiedContactNotice: {
    fontStyle: "italic",
    color: SLATE_400,
  },

  /* ---- action buttons ---- */
  cardActions: {
    padding: 16,
    paddingTop: 0,
    marginTop: "auto",
    width: "100%",
    gap: 8,
  },
  actionBtn: {
    width: "100%",
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  bookBtn: {
    backgroundColor: BRAND,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)" }
      : {}),
  },
  bookBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "800",
    ...WEB_FONT,
  },
  callBtn: {
    backgroundColor: "#059669",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(5, 150, 105, 0.2)" }
      : {}),
  },
  callBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "800",
    ...WEB_FONT,
  },

  /* ---- skeleton ---- */
  skeletonCard: {
    minHeight: 220,
  },
  skeletonBox: {
    backgroundColor: SLATE_200,
    opacity: 0.6,
  },

  /* ---- Modals shared ---- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    ...(Platform.OS === "web"
      ? {
          backdropFilter: "blur(4px)" as any,
          WebkitBackdropFilter: "blur(4px)" as any,
        }
      : {}),
  },
  modalCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    maxWidth: 480,
    width: "100%",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.2)",
          maxHeight: "90vh" as any,
        }
      : {}),
  },
  modalCardMobile: {
    padding: 16,
    borderRadius: 16,
    width: "100%",
    ...(Platform.OS === "web"
      ? {
          maxHeight: "92vh" as any,
        }
      : {}),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    flexShrink: 0,
  },
  modalHeaderMobile: {
    gap: 8,
    marginBottom: 12,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  modalIconWrapMobile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    flexShrink: 0,
  },
  modalIcon: {
    fontSize: 20,
  },
  modalIconMobile: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: SLATE_900,
    ...WEB_FONT,
  },
  modalTitleMobile: {
    fontSize: 15,
  },
  modalSubtitle: {
    fontSize: 13,
    color: SLATE_500,
    marginTop: 2,
    ...WEB_FONT,
  },
  modalSubtitleMobile: {
    fontSize: 11,
    marginTop: 1,
  },
  modalCloseIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SLATE_100,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    zIndex: 10,
  },
  modalCloseIconBtnMobile: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  modalCloseIconText: {
    fontSize: 16,
    fontWeight: "800",
    color: SLATE_700,
    lineHeight: 18,
    textAlign: "center",
  },
  modalScrollArea: {
    flexGrow: 0,
    flexShrink: 1,
    width: "100%",
    ...(Platform.OS === "web"
      ? {
          maxHeight: "60vh" as any,
          overflowY: "auto" as any,
          WebkitOverflowScrolling: "touch" as any,
        }
      : {}),
  } as any,
  modalScrollContent: {
    paddingBottom: 8,
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
  modalBtn: {
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  copyBtn: {
    flex: 1.2,
    backgroundColor: BRAND,
    flexDirection: "row",
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
    flex: 1,
    backgroundColor: SLATE_100,
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: SLATE_700,
    ...WEB_FONT,
  },

  /* ---- Appointment Dialog specific styles ---- */
  appointmentDetailBox: {
    backgroundColor: SLATE_50,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: SLATE_100,
    gap: 8,
    marginBottom: 16,
  },
  appointmentDetailBoxMobile: {
    padding: 10,
    gap: 6,
    marginBottom: 10,
    borderRadius: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  detailRowMobile: {
    flexDirection: "column" as any,
    gap: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: SLATE_500,
    width: 120,
    ...WEB_FONT,
  },
  detailLabelMobile: {
    fontSize: 10.5,
    fontWeight: "800",
    width: "auto" as any,
    textTransform: "uppercase" as any,
    letterSpacing: 0.3,
    color: SLATE_400,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: SLATE_900,
    flex: 1,
    ...WEB_FONT,
  },
  detailValueMobile: {
    fontSize: 12,
    flex: undefined as any,
  },
  confirmedContactBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    marginBottom: 14,
  },
  confirmedContactBoxMobile: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  confirmedContactLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    ...WEB_FONT,
  },
  confirmedContactLabelMobile: {
    fontSize: 9.5,
    marginBottom: 2,
  },
  confirmedContactNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: "#15803D",
    marginBottom: 10,
    ...WEB_FONT,
  },
  confirmedContactNumberMobile: {
    fontSize: 16,
    marginBottom: 8,
  },
  contactActionRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  inlineActionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  inlineActionBtnMobile: {
    height: 36,
    borderRadius: 8,
  },
  inlineCopyBtn: {
    backgroundColor: BRAND,
  },
  inlineCopyBtnSuccess: {
    backgroundColor: SUCCESS,
  },
  inlineActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: WHITE,
    ...WEB_FONT,
  },
  inlineActionTextMobile: {
    fontSize: 11,
  },
  inlineCallBtn: {
    backgroundColor: "#059669",
  },
  inlineCallText: {
    fontSize: 12,
    fontWeight: "800",
    color: WHITE,
    ...WEB_FONT,
  },
  inlineCallTextMobile: {
    fontSize: 11,
  },
  unverifiedAlertBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 14,
  },
  unverifiedAlertBoxMobile: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  unverifiedAlertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  unverifiedAlertIcon: {
    fontSize: 16,
  },
  unverifiedAlertTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#B45309",
    ...WEB_FONT,
  },
  unverifiedAlertTitleMobile: {
    fontSize: 12,
    flex: 1,
  },
  unverifiedAlertDesc: {
    fontSize: 12,
    color: "#78350F",
    lineHeight: 18,
    ...WEB_FONT,
  },
  unverifiedAlertDescMobile: {
    fontSize: 11,
    lineHeight: 16,
  },
  appointmentDisclaimerBox: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
  },
  appointmentDisclaimerBoxMobile: {
    padding: 10,
    gap: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  appointmentDisclaimerIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  appointmentDisclaimerText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "700",
    color: "#92400E",
    flex: 1,
    ...WEB_FONT,
  },
  appointmentDisclaimerTextMobile: {
    fontSize: 11,
    lineHeight: 16,
  },
  modalFullCloseBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: SLATE_100,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    flexShrink: 0,
    marginTop: 8,
  },
  modalFullCloseBtnMobile: {
    height: 40,
    borderRadius: 10,
    marginTop: 6,
  },
  modalFullCloseBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: SLATE_700,
    ...WEB_FONT,
  },
  modalFullCloseBtnTextMobile: {
    fontSize: 13,
  },
});
