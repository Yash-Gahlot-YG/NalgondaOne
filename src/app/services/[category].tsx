import { router, useLocalSearchParams } from "expo-router";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  getCategoryBySlug,
  getProvidersByCategory,
  applyFilter,
  fetchApprovedProviders,
  nalgondaLocations,
  withCalculatedDistance,
  normalizeCategorySlug,
  type ServiceProvider,
} from "@/data/services";
import ServiceSearchBar from "@/components/services/ServiceSearchBar";
import ServiceProviderCard from "@/components/services/ServiceProviderCard";
import ServiceFilter from "@/components/services/ServiceFilter";
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

export default function CategoryScreen() {
  const { category: slug } = useLocalSearchParams<{ category: string }>();
  const { width } = useWindowDimensions();
  const isMobile = isMobileWidth(width);
  const isTablet = isTabletWidth(width);

  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

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

  const categoryInfo = getCategoryBySlug(slug ?? "");

  /* ---- Invalid category ---- */
  if (!categoryInfo) {
    return (
      <View style={s.page}>
        <View style={s.header}>
          <View style={s.headerInner}>
            <Pressable
              onPress={() => router.push("/services")}
              style={({ pressed }) => [
                s.backBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Back to services"
            >
              <Text style={s.backArrow}>←</Text>
            </Pressable>
            <Text style={s.headerTitle}>Category</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        <ErrorState
          icon="📂"
          title="Category not found"
          description="This service category doesn't exist or may have been removed."
          retryLabel="← Back to Services"
          onRetry={() => router.push("/services")}
        />
      </View>
    );
  }

  const categoryTitle = categoryInfo.title;

  /* ---- Get & filter providers ---- */
  const providers = useMemo(() => {
    // Get mock providers for this category
    let list = getProvidersByCategory(slug ?? "");

    // Merge approved providers that belong to this category
    const approvedForCategory = approvedProviders.filter(
      (p) => p.category === slug || normalizeCategorySlug(p.category) === slug
    );
    if (approvedForCategory.length > 0) {
      const merged = [...list, ...approvedForCategory];
      // De-duplicate by id
      list = Array.from(new Map(merged.map((p) => [p.id, p])).values());
    }

    // Apply search filter
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryTitle.toLowerCase().includes(q) ||
          p.services.some((s) => s.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Calculate distance from default origin
    const defaultOrigin = nalgondaLocations[0];
    const withDist = list.map((p) =>
      withCalculatedDistance(p, defaultOrigin.latitude, defaultOrigin.longitude)
    );

    // Apply tab filter
    return applyFilter(withDist, activeFilter as any);
  }, [slug, searchText, activeFilter, approvedProviders]);

  /* ---- Provider card width ---- */
  const getCardWidth = () => {
    if (isMobile) return "100%";
    if (isTablet) return "48%";
    return "31.5%";
  };

  /* ---- Empty state message based on filter ---- */
  const getEmptyMessage = () => {
    if (searchText.trim()) {
      return {
        icon: "🔍",
        title: "No providers found",
        description: "Try a different search term or clear filters.",
        actionLabel: "Clear Search",
        onAction: () => setSearchText(""),
      };
    }
    if (activeFilter === "verified") {
      return {
        icon: "✓",
        title: "No verified providers",
        description: `No verified ${categoryTitle.toLowerCase()} providers found. Try the 'All' filter.`,
        actionLabel: "Show All",
        onAction: () => setActiveFilter("all"),
      };
    }
    return {
      icon: "📋",
      title: "No providers yet",
      description: `No ${categoryTitle.toLowerCase()} providers are listed yet. Check back soon!`,
    };
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
            onPress={() => router.push("/services")}
            style={({ pressed }) => [
              s.backBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Back to services"
          >
            <Text style={s.backArrow}>←</Text>
          </Pressable>
          <Text style={s.headerTitle} numberOfLines={1}>
            {categoryTitle}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <ContentWrap style={{ paddingTop: 24, paddingBottom: 80 }}>
          {/* Category header */}
          <View style={s.catHeader}>
            <View
              style={[
                s.catIconWrap,
                {
                  backgroundColor: categoryInfo.bg,
                  borderColor: categoryInfo.accent + "20",
                },
              ]}
            >
              <Text style={s.catIcon}>{categoryInfo.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.catTitle} accessibilityRole="header">
                {categoryTitle}
              </Text>
              <Text style={s.catDesc}>{categoryInfo.description}</Text>
              <Text style={s.catCount}>
                {categoryInfo.providerCount} providers available
              </Text>
            </View>
          </View>

          {/* Search */}
          <View style={{ marginTop: 20 }}>
            <ServiceSearchBar
              value={searchText}
              onChangeText={setSearchText}
              onSubmit={() => {}}
              placeholder={`Search ${categoryTitle.toLowerCase()}...`}
            />
          </View>

          {/* Filters */}
          <View style={{ marginTop: 20 }}>
            <ServiceFilter
              options={filterOptions}
              activeValue={activeFilter}
              onSelect={setActiveFilter}
            />
          </View>

          {/* Results count */}
          <Text style={s.resultCount}>
            {providers.length} provider
            {providers.length !== 1 ? "s" : ""} found
          </Text>

          {/* Provider list */}
          {apiError && !apiLoading ? (
            <ErrorState
              icon="⚠️"
              title="Unable to load live services"
              description="Please try again later."
              retryLabel="Retry"
              onRetry={loadApprovedProviders}
            />
          ) : providers.length > 0 ? (
            <View style={s.providerGrid}>
              {providers.map((prov) => (
                <View
                  key={prov.id}
                  style={{ width: getCardWidth() as any }}
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
            <EmptyState {...getEmptyMessage()} />
          )}
        </ContentWrap>
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
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: SLATE_900,
    flex: 1,
    textAlign: "center",
    ...WEB_FONT,
  },

  /* ---- category header ---- */
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  catIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  catIcon: {
    fontSize: 26,
  },
  catTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.5,
    ...WEB_FONT,
  },
  catDesc: {
    fontSize: 13,
    color: SLATE_500,
    marginTop: 2,
    lineHeight: 18,
    ...WEB_FONT,
  },
  catCount: {
    fontSize: 12,
    color: BRAND,
    marginTop: 4,
    fontWeight: "700",
    ...WEB_FONT,
  },

  /* ---- results ---- */
  resultCount: {
    fontSize: 13,
    color: SLATE_500,
    marginTop: 20,
    marginBottom: 16,
    ...WEB_FONT,
  },
  providerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
});
