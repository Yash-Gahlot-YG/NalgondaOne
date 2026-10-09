import { router } from "expo-router";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  SLATE_700,
  SLATE_500,
  SLATE_100,
  SLATE_50,
  WHITE,
  WEB_FONT,
  CONTENT_MAX_WIDTH,
  isMobileWidth,
  isTabletWidth,
} from "@/constants/serviceTheme";
import {
  popularCategories,
  allCategories,
  searchServices,
  nalgondaLocations,
  getAllProviders,
  getNearbyProviders,
  withCalculatedDistance,
  applyFilter,
  fetchApprovedProviders,
  type LocationOption,
  type ServiceProvider,
} from "@/data/services";
import ServiceSearchBar from "@/components/services/ServiceSearchBar";
import ServiceCategoryCard from "@/components/services/ServiceCategoryCard";
import ServiceProviderCard from "@/components/services/ServiceProviderCard";
import ServiceFilter from "@/components/services/ServiceFilter";
import LocationSelectorModal from "@/components/services/LocationSelectorModal";
import EmptyState from "@/components/services/EmptyState";
import ErrorState from "@/components/services/ErrorState";

/* ================================================================ */
/* FILTER OPTIONS                                                     */
/* ================================================================ */

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Nearby", value: "nearby" },
  { label: "Rating", value: "rating" },
  { label: "Verified", value: "verified" },
];

/* ================================================================ */
/* COMPONENT                                                         */
/* ================================================================ */

export default function ServicesHomeScreen() {
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const isTablet = isTabletWidth(width);

  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(
    nalgondaLocations[0]
  );
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  /* ---- Approved providers from API ---- */
  const [approvedProviders, setApprovedProviders] = useState<ServiceProvider[]>([]);
  const [apiError, setApiError] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);
  const mountedRef = useRef(true);

  const loadApprovedProviders = useCallback(async () => {
    setApiLoading(true);
    setApiError(false);
    try {
      const result = await fetchApprovedProviders();
      if (!mountedRef.current) return;
      if (result.success) {
        setApprovedProviders(result.data);
        setApiError(false);
      } else {
        setApprovedProviders([]);
        setApiError(true);
      }
    } catch {
      if (!mountedRef.current) return;
      setApprovedProviders([]);
      setApiError(true);
    } finally {
      if (mountedRef.current) setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadApprovedProviders();
    return () => { mountedRef.current = false; };
  }, [loadApprovedProviders]);

  const contentPad = isMobile ? 20 : isTablet ? 36 : 0;

  /* ---- Search logic ---- */
  const isSearching = searchText.trim().length > 0;
  const searchResults = useMemo(() => {
    if (!isSearching) return null;
    return searchServices(searchText, approvedProviders);
  }, [searchText, isSearching, approvedProviders]);

  /* ---- Filtered providers ---- */
  const filteredProviders = useMemo(() => {
    // When "Nearby" tab is active, evaluate all providers by distance from search origin
    if (activeFilter === "nearby") {
      return getNearbyProviders(selectedLocation, approvedProviders);
    }

    // For "All", "Rating", "Verified", keep location filter and compute dynamic distance
    const allProvs = getAllProviders(selectedLocation.name, approvedProviders);
    const withDist = allProvs.map((p) =>
      withCalculatedDistance(
        p,
        selectedLocation.latitude,
        selectedLocation.longitude
      )
    );
    return applyFilter(withDist, activeFilter as any);
  }, [activeFilter, selectedLocation, approvedProviders]);

  /* ---- Handle search submit ---- */
  const handleSearchSubmit = useCallback(() => {
    if (!searchText.trim()) return;
    const results = searchServices(searchText, approvedProviders);
    if (results.categories.length === 1 && results.providers.length === 0) {
      router.push(`/services/${results.categories[0].slug}` as any);
    }
  }, [searchText, approvedProviders]);

  /* ---- Categories to display ---- */
  const displayCategories = showAllCategories
    ? allCategories
    : popularCategories;

  /* ---- Provider card width ---- */
  const getProviderCardWidth = () => {
    if (isMobile) return "100%";
    if (isTablet) return "48%";
    return "23.5%";
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

  return (
    <View style={s.page}>
      {/* ---- Sticky Header ---- */}
      <View style={s.header}>
        <View style={s.headerInner}>
          <Pressable
            onPress={() => router.push("/")}
            style={({ pressed }) => [
              s.backBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
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
          <Pressable
            onPress={() => router.push("/add-business" as any)}
            style={({ pressed }) => [
              s.headerAddBtn,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add your business"
          >
            <Text style={s.headerAddBtnText}>+ Add Business</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================ */}
        {/* HERO SECTION                                                  */}
        {/* ============================================================ */}

        <View style={s.heroSection}>
          <View style={s.heroBlob1} />
          <View style={s.heroBlob2} />

          <ContentWrap style={{ zIndex: 2, paddingTop: 32, paddingBottom: 36 }}>
            {/* Title */}
            <Text style={s.heroKicker}>SERVICES</Text>
            <Text style={[s.heroTitle, { fontSize: isMobile ? 32 : 40 }]}>
              Local Services
            </Text>
            <Text style={s.heroSub}>
              Find trusted services around {selectedLocation.name}
            </Text>

            {/* Location */}
            <View style={s.locationRow}>
              <Text style={s.locationIcon}>📍</Text>
              <Text style={s.locationText}>{selectedLocation.name}</Text>
              <Pressable
                onPress={() => setLocationModalVisible(true)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel={`Change location from ${selectedLocation.name}`}
              >
                <Text style={s.changeLocation}>Change location</Text>
              </Pressable>
            </View>

            {/* Search */}
            <View style={{ marginTop: 20 }}>
              <ServiceSearchBar
                value={searchText}
                onChangeText={setSearchText}
                onSubmit={handleSearchSubmit}
                placeholder="Search services or providers..."
              />
            </View>
          </ContentWrap>
        </View>

        {/* Location Selector Modal */}
        <LocationSelectorModal
          visible={locationModalVisible}
          selectedLocation={selectedLocation}
          onSelect={(loc) => setSelectedLocation(loc)}
          onClose={() => setLocationModalVisible(false)}
        />

        {/* ============================================================ */}
        {/* SEARCH RESULTS (conditional)                                  */}
        {/* ============================================================ */}

        {isSearching && searchResults && (
          <ContentWrap style={{ paddingTop: 32, paddingBottom: 32 }}>
            <Text style={s.sectionTitle}>Search Results</Text>

            {/* Category matches */}
            {searchResults.categories.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={s.subHeading}>Categories</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
                >
                  {searchResults.categories.map((cat) => (
                    <ServiceCategoryCard
                      key={cat.id}
                      category={cat}
                      onPress={() =>
                        router.push(`/services/${cat.slug}` as any)
                      }
                      size="compact"
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Provider matches */}
            {searchResults.providers.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text style={s.subHeading}>Providers</Text>
                <View style={s.providerGrid}>
                  {searchResults.providers.map((prov) => (
                    <View
                      key={prov.id}
                      style={{ width: getProviderCardWidth() as any }}
                    >
                      <ServiceProviderCard
                        provider={prov}
                        onPress={() =>
                          router.push(
                            `/services/provider/${prov.id}` as any
                          )
                        }
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Empty search state */}
            {searchResults.categories.length === 0 &&
              searchResults.providers.length === 0 && (
                <EmptyState
                  icon="🔍"
                  title="No services found"
                  description="Try another service or provider name."
                  actionLabel="Clear Search"
                  onAction={() => setSearchText("")}
                />
              )}
          </ContentWrap>
        )}

        {/* ============================================================ */}
        {/* POPULAR SERVICES                                              */}
        {/* ============================================================ */}

        {!isSearching && (
          <>
            <ContentWrap style={{ paddingTop: 40 }}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>
                  {showAllCategories
                    ? "All Services"
                    : "Popular Services"}
                </Text>
                <Pressable
                  onPress={() => setShowAllCategories(!showAllCategories)}
                  accessibilityRole="button"
                  accessibilityLabel={showAllCategories ? "Show fewer categories" : "Show all categories"}
                >
                  <Text style={s.viewAllText}>
                    {showAllCategories
                      ? "← Show Less"
                      : "More Services →"}
                  </Text>
                </Pressable>
              </View>
            </ContentWrap>

            {/* Categories grid */}
            {showAllCategories ? (
              /* Full grid view for "More Services" */
              <ContentWrap style={{ paddingTop: 16, paddingBottom: 16 }}>
                <View
                  style={[
                    s.allCatGrid,
                    {
                      gap: isMobile ? 10 : 14,
                    },
                  ]}
                >
                  {displayCategories.map((cat) => (
                    <View
                      key={cat.id}
                      style={{
                        width: isMobile
                          ? "31%"
                          : isTablet
                          ? "18.5%"
                          : "11.5%",
                      }}
                    >
                      <ServiceCategoryCard
                        category={cat}
                        onPress={() =>
                          router.push(`/services/${cat.slug}` as any)
                        }
                        size="compact"
                      />
                    </View>
                  ))}
                </View>
              </ContentWrap>
            ) : (
              /* Horizontal scroll for popular */
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: isMobile
                    ? 20
                    : isTablet
                    ? 36
                    : Math.max((width - CONTENT_MAX_WIDTH) / 2, 20),
                  gap: 12,
                  paddingVertical: 12,
                  marginTop: 4,
                }}
              >
                {popularCategories.map((cat) => (
                  <ServiceCategoryCard
                    key={cat.id}
                    category={cat}
                    onPress={() =>
                      router.push(`/services/${cat.slug}` as any)
                    }
                  />
                ))}
              </ScrollView>
            )}

            {/* ============================================================ */}
            {/* SERVICES NEAR YOU                                             */}
            {/* ============================================================ */}

            <ContentWrap
              style={{ paddingTop: 48, paddingBottom: 80 }}
            >
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Services Near You</Text>
              </View>

              {/* Filters */}
              <View style={{ marginTop: 4, marginBottom: 20 }}>
                <ServiceFilter
                  options={filterOptions}
                  activeValue={activeFilter}
                  onSelect={setActiveFilter}
                />
              </View>

              {/* ---- API Error State ---- */}
              {apiError && !apiLoading ? (
                <ErrorState
                  icon="⚠️"
                  title="Unable to load live services"
                  description="Please try again later."
                  retryLabel="Retry"
                  onRetry={loadApprovedProviders}
                />
              ) : /* Provider grid */
              filteredProviders.length > 0 ? (
                <View style={s.providerGrid}>
                  {filteredProviders.map((prov) => (
                    <View
                      key={prov.id}
                      style={{ width: getProviderCardWidth() as any }}
                    >
                      <ServiceProviderCard
                        provider={prov}
                        onPress={() =>
                          router.push(
                            `/services/provider/${prov.id}` as any
                          )
                        }
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyState
                  icon={activeFilter === "verified" ? "✓" : "📍"}
                  title={
                    activeFilter === "verified"
                      ? "No verified providers"
                      : `No providers in ${selectedLocation.name}`
                  }
                  description={
                    activeFilter === "verified"
                      ? "No verified providers match the current filter. Try selecting 'All' to see all providers."
                      : "No service providers are listed for this location yet. Try selecting a different location."
                  }
                  actionLabel={
                    activeFilter === "verified" ? "Show All" : "Change Location"
                  }
                  onAction={() => {
                    if (activeFilter === "verified") {
                      setActiveFilter("all");
                    } else {
                      setLocationModalVisible(true);
                    }
                  }}
                />
              )}
            </ContentWrap>
          </>
        )}
      </ScrollView>
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
  headerAddBtn: {
    backgroundColor: BRAND,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  headerAddBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "800",
    ...WEB_FONT,
  },

  /* ---- hero ---- */
  heroSection: {
    backgroundColor: "#EBF4FF",
    overflow: "hidden",
  },
  heroBlob1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#BFDBFE",
    opacity: 0.3,
    top: -150,
    right: -100,
  },
  heroBlob2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#A7F3D0",
    opacity: 0.15,
    bottom: -100,
    left: -80,
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
    fontSize: 16,
    color: SLATE_500,
    marginTop: 6,
    lineHeight: 24,
    ...WEB_FONT,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "700",
    color: SLATE_900,
    ...WEB_FONT,
  },
  changeLocation: {
    fontSize: 13,
    color: BRAND,
    fontWeight: "600",
    marginLeft: 4,
    ...WEB_FONT,
  },

  /* ---- sections ---- */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.5,
    ...WEB_FONT,
  },
  subHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: SLATE_700,
    marginBottom: 12,
    ...WEB_FONT,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "800",
    color: BRAND,
    ...WEB_FONT,
  },

  /* ---- All categories grid ---- */
  allCatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  /* ---- provider grid ---- */
  providerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
});
