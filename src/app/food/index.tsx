import { router } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { useMemo, useState } from "react";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
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
  CAFES,
  getCafeCoverImage,
  getMenuItemImage,
  type Cafe,
  type CafeMenuItem,
} from "@/data/cafes";
import { FoodPlaceholder } from "@/components/food/FoodPlaceholder";
import { useCart } from "@/context/CartContext";

/* ─── Design tokens (Zomato / Swiggy inspired clean white theme) ── */
const C = {
  bg: "#F8F9FA",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  orange: "#FF5200", // Swiggy / Zomato signature energetic orange
  orangeLight: "#FFF4EE",
  orangeDark: "#E04800",
  text: "#1C1C27",
  textSub: "#4B5563",
  textMuted: "#9CA3AF",
  green: "#15803D",
  greenLight: "#F0FDF4",
  amber: "#B45309",
  amberLight: "#FEF3C7",
  blue: "#1D4ED8",
  blueLight: "#EFF6FF",
  tagBg: "#F3F4F6",
  tagText: "#374151",
};

const FONT =
  Platform.select({ web: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" } }) ?? {};

/* ─── Helpers ───────────────────────────────────────────────────── */
function priceLabel(item: CafeMenuItem) {
  if (item.isDemo) return "Demo price";
  if (!item.priceVerified || item.price === null) return "Price to be confirmed";
  return `₹${item.price}`;
}

function priceColor(item: CafeMenuItem) {
  if (item.isDemo) return C.amber;
  if (!item.priceVerified || item.price === null) return C.textMuted;
  return C.text;
}

/* ─── Cart Floating Action Button ──────────────────────────────── */
function CartFAB() {
  const { items } = useCart();
  const total = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);
  if (total === 0) return null;

  return (
    <Pressable
      style={({ pressed }) => [fab.btn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
      onPress={() => router.push("/food/cart")}
      accessibilityRole="button"
      accessibilityLabel="Open cart"
    >
      <View style={fab.left}>
        <View style={fab.badge}>
          <Text style={fab.badgeText}>{total}</Text>
        </View>
        <View>
          <Text style={fab.title}>{total} item{total !== 1 ? "s" : ""} added</Text>
          <Text style={fab.sub}>₹{subtotal} · Cash on Delivery</Text>
        </View>
      </View>
      <View style={fab.right}>
        <Text style={fab.actionText}>View Cart →</Text>
      </View>
    </Pressable>
  );
}

const fab = StyleSheet.create({
  btn: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    maxWidth: 720,
    alignSelf: "center",
    backgroundColor: C.orange,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 10px 30px rgba(255, 82, 0, 0.4)", cursor: "pointer" as any }
      : { shadowColor: C.orange, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 9 }),
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  badge: {
    backgroundColor: "#FFFFFF",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 14, fontWeight: "800", color: C.orange },
  title: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  sub: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 1 },
  right: { backgroundColor: "rgba(0,0,0,0.15)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  actionText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});

function HighlightThumb({ item, itemImg }: { item: CafeMenuItem; itemImg?: any }) {
  const [thumbError, setThumbError] = useState(false);
  const img = itemImg ?? getMenuItemImage(item.id);
  if (img && !thumbError) {
    return (
      <ExpoImage
        source={img}
        style={s.miniItemThumb}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        onError={() => setThumbError(true)}
        accessibilityLabel={item.name}
      />
    );
  }
  return <FoodPlaceholder item={item} size="mini" />;
}

/* ─── CafeCard Component ────────────────────────────────────────── */
/* NOTE: Uses a View container (NOT an outer Pressable button) to completely
   prevent React Native Web nested <button> HTML nesting validation errors. */
function CafeCard({ cafe }: { cafe: Cafe }) {
  const [imageError, setImageError] = useState(false);
  const highlights = cafe.menu.slice(0, 3);
  const hasVerifiedPrices = cafe.menu.some((i) => i.priceVerified && i.price !== null);
  const coverImg = getCafeCoverImage(cafe.id);

  const navigateToMenu = () => {
    router.push({ pathname: "/food/[id]", params: { id: cafe.id } });
  };

  return (
    <View style={s.card}>
      {/* Clickable Cover Image */}
      <Pressable
        style={({ pressed }) => [s.cardCoverWrap, pressed && { opacity: 0.95 }]}
        onPress={navigateToMenu}
        accessibilityRole="button"
        accessibilityLabel={`View ${cafe.name} cover and menu`}
      >
        {coverImg && !imageError ? (
          <ExpoImage
            source={coverImg}
            style={s.cardCoverImg}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            onError={() => setImageError(true)}
            accessibilityLabel={`${cafe.name} cover`}
          />
        ) : (
          <View style={s.cardFallbackWrap}>
            <Text style={s.fallbackEmoji}>🍽️</Text>
          </View>
        )}

        {/* Top Badges */}
        {hasVerifiedPrices && (
          <View style={s.badgeRowTop}>
            <View style={s.verifiedPill}>
              <Text style={s.verifiedPillText}>✓ Verified Menu</Text>
            </View>
          </View>
        )}

        {/* Bottom Image Overlay Strip */}
        <View style={s.imageBottomStrip}>
          <Text style={s.imageBottomStripText} numberOfLines={1}>
            📍 {cafe.address}
          </Text>
        </View>
      </Pressable>

      {/* Card Content Body */}
      <View style={s.cardBody}>
        {/* Title */}
        <Pressable onPress={navigateToMenu} style={s.titlePressable}>
          <Text style={s.cardName} numberOfLines={1}>
            {cafe.name}
          </Text>
        </Pressable>

        {cafe.cuisine ? (
          <Text style={s.cardCuisine} numberOfLines={1}>
            {cafe.cuisine}
          </Text>
        ) : null}

        <View style={s.divider} />

        {/* Menu Highlights with explicit item photos */}
        <View style={s.highlightsSection}>
          <Text style={s.highlightHeader}>MENU HIGHLIGHTS</Text>
          {highlights.map((item) => {
            const itemImg = getMenuItemImage(item.id);
            return (
              <View key={item.id} style={s.highlightItemRow}>
                {/* Veg / Non-veg dot */}
                <View style={[s.foodTypeIcon, item.isVeg ? s.foodTypeVeg : s.foodTypeNonVeg]}>
                  <View style={[s.foodTypeDot, item.isVeg ? s.foodDotVeg : s.foodDotNonVeg]} />
                </View>

                {/* Explicit dish thumbnail image or food-specific placeholder */}
                <HighlightThumb item={item} itemImg={itemImg} />

                <Text style={s.highlightItemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[s.highlightItemPrice, { color: priceColor(item) }]}>
                  {priceLabel(item)}
                </Text>
              </View>
            );
          })}

          {cafe.menu.length > 3 ? (
            <Text style={s.moreItemsText}>+{cafe.menu.length - 3} more items</Text>
          ) : (
            <View style={{ height: 18 }} />
          )}
        </View>

        {/* View Menu CTA Button (Pinned to card bottom with marginTop: auto) */}
        <Pressable
          style={({ pressed }) => [s.menuBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
          onPress={navigateToMenu}
          accessibilityRole="button"
          accessibilityLabel={`View full menu for ${cafe.name}`}
        >
          <Text style={s.menuBtnText}>View Full Menu</Text>
          <Text style={s.menuBtnArrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ─── Main FoodScreen Component ─────────────────────────────────── */
export default function FoodScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const mobile = width < 720;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "veg">("all");
  const goBackToHome = useSafeBack("/");

  const filteredCafes = useMemo(() => {
    return CAFES.filter((c) => {
      const matchQuery =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.cuisine?.toLowerCase().includes(query.toLowerCase()) ||
        c.address.toLowerCase().includes(query.toLowerCase());

      if (!matchQuery) return false;

      if (filter === "verified") {
        return c.menu.some((i) => i.priceVerified);
      }
      if (filter === "veg") {
        return c.menu.some((i) => i.isVeg);
      }
      return true;
    });
  }, [query, filter]);

  const numCols = mobile ? 1 : width < 1080 ? 2 : 3;
  const cardWidth = mobile ? "100%" : `${Math.floor(100 / numCols) - 1.5}%`;

  return (
    <View style={[s.root, FONT as object]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scroll,
          {
            paddingHorizontal: mobile ? 16 : 32,
            paddingTop: Math.max(insets.top, 16),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Navigation Bar ── */}
        <View style={s.navBar}>
          <Pressable
            onPress={goBackToHome}
            style={({ pressed }) => [s.navBackBtn, pressed && { opacity: 0.75 }]}
            accessibilityRole="button"
            accessibilityLabel="Go back to Home"
          >
            <Text style={s.navBackArrow}>←</Text>
            <Text style={s.navBackText}>Home</Text>
          </Pressable>

          <Pressable
            onPress={goBackToHome}
            style={s.navLogoWrap}
            accessibilityRole="link"
            accessibilityLabel="NalgondaOne Home"
          >
            <Text style={s.navLogo}>
              Nalgonda<Text style={{ color: C.orange }}>One</Text>
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/food/cart")}
            style={({ pressed }) => [s.navCartBtn, pressed && { opacity: 0.75 }]}
            accessibilityRole="button"
            accessibilityLabel="View Cart"
          >
            <Text style={s.navCartIcon}>🛒</Text>
          </Pressable>
        </View>

        {/* ── Top Header Section ── */}
        <View style={s.header}>
          <View style={s.headerBadge}>
            <Text style={s.headerBadgeDot}>●</Text>
            <Text style={s.headerBadgeText}>NALGONDA FOOD & CAFÉS</Text>
          </View>
          <Text style={s.heroTitle}>Discover Great Food in Nalgonda</Text>
          <Text style={s.heroSub}>
            Explore authentic local cafés, view verified menus, and order with Cash on Delivery
          </Text>
        </View>

        {/* ── Search Bar ── */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search by café name, dishes, or locality…"
            placeholderTextColor={C.textMuted}
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search cafes and dishes"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} style={s.searchClear}>
              <Text style={{ color: C.textMuted, fontSize: 16 }}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* ── Filter Chips ── */}
        <View style={s.filterRow}>
          <Pressable
            style={[s.filterChip, filter === "all" && s.filterChipActive]}
            onPress={() => setFilter("all")}
            accessibilityRole="button"
            accessibilityLabel="Show all cafes"
          >
            <Text style={[s.filterChipText, filter === "all" && s.filterChipTextActive]}>
              All Cafés
            </Text>
          </Pressable>

          <Pressable
            style={[s.filterChip, filter === "verified" && s.filterChipActive]}
            onPress={() => setFilter("verified")}
            accessibilityRole="button"
            accessibilityLabel="Filter by verified menus"
          >
            <Text style={[s.filterChipText, filter === "verified" && s.filterChipTextActive]}>
              ✓ Verified Menus
            </Text>
          </Pressable>

          <Pressable
            style={[s.filterChip, filter === "veg" && s.filterChipActive]}
            onPress={() => setFilter("veg")}
            accessibilityRole="button"
            accessibilityLabel="Filter by vegetarian options"
          >
            <Text style={[s.filterChipText, filter === "veg" && s.filterChipTextActive]}>
              🌱 Pure Veg Options
            </Text>
          </Pressable>
        </View>

        {/* ── Cafes Grid ── */}
        <View style={s.sectionHeaderRow}>
          <Text style={s.sectionTitle}>
            {filter === "all" ? "Featured Cafés in Nalgonda" : "Matching Cafés"}
          </Text>
          <Text style={s.sectionCount}>{filteredCafes.length} places available</Text>
        </View>

        {filteredCafes.length > 0 ? (
          <View style={[s.grid, mobile && s.gridMobile]}>
            {filteredCafes.map((c) => (
              <View key={c.id} style={[s.gridCol, { width: cardWidth as any }]}>
                <CafeCard cafe={c} />
              </View>
            ))}
          </View>
        ) : (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🍽️</Text>
            <Text style={s.emptyTitle}>No cafés found matching "{query}"</Text>
            <Text style={s.emptySub}>Try searching for "chai", "biryani", or reset the filter.</Text>
            <Pressable
              style={s.emptyResetBtn}
              onPress={() => {
                setQuery("");
                setFilter("all");
              }}
              accessibilityRole="button"
              accessibilityLabel="Reset search"
            >
              <Text style={s.emptyResetText}>Reset Search</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Cart Floating Action Button */}
      <CartFAB />
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: {
    flexGrow: 1,
    maxWidth: 1240,
    alignSelf: "center",
    width: "100%",
    paddingTop: 28,
    paddingBottom: 40,
  },

  /* Header */
  header: { marginBottom: 20 },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.orangeLight,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  headerBadgeDot: { color: C.orange, fontSize: 10 },
  headerBadgeText: { color: C.orange, fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  heroTitle: { fontSize: 30, fontWeight: "900", color: C.text, letterSpacing: -0.6 },
  heroSub: { fontSize: 15, color: C.textSub, marginTop: 6, lineHeight: 22 },

  /* Search Bar */
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    marginBottom: 14,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }
      : { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }),
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 15, color: C.text },
  searchClear: { padding: 6 },

  /* Filter Chips */
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  filterChip: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  filterChipActive: {
    backgroundColor: C.orangeLight,
    borderColor: C.orange,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textSub,
  },
  filterChipTextActive: {
    color: C.orange,
    fontWeight: "700",
  },


  /* Section Header */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: C.text, letterSpacing: -0.3 },
  sectionCount: { fontSize: 13, color: C.textMuted, fontWeight: "600" },

  /* Responsive Grid with equal height columns */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    alignItems: "stretch",
  },
  gridMobile: {
    flexDirection: "column",
  },
  gridCol: {
    display: "flex",
    flexDirection: "column",
  },

  /* Cafe Card: flex: 1 ensures equal card height in every row */
  card: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? {
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }
      : { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 3 }),
  },

  /* Card Cover */
  cardCoverWrap: {
    height: 180,
    width: "100%",
    backgroundColor: "#F3F4F6",
    position: "relative",
    overflow: "hidden",
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  cardCoverImg: {
    width: "100%",
    height: 180,
  },
  cardFallbackWrap: {
    width: "100%",
    height: 180,
    backgroundColor: C.orangeLight,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackEmoji: { fontSize: 50 },

  badgeRowTop: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  imageBottomStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  imageBottomStripText: { fontSize: 12, fontWeight: "600", color: C.textSub, flex: 1 },
  verifiedPill: {
    backgroundColor: C.greenLight,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  verifiedPillText: { fontSize: 10, fontWeight: "700", color: C.green },

  /* Card Body: flex: 1 ensures consistent stretch */
  cardBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: 18,
  },
  titlePressable: {
    marginBottom: 2,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  cardName: { fontSize: 18, fontWeight: "800", color: C.text, letterSpacing: -0.2, minWidth: 0 },
  cardCuisine: { fontSize: 13, color: C.orangeDark, fontWeight: "600", marginTop: 2, minWidth: 0 },

  divider: { height: 1, backgroundColor: C.borderLight, marginVertical: 12 },

  /* Highlights: minHeight guarantees identical spacing across cards */
  highlightsSection: {
    flex: 1,
    minHeight: 140,
    marginBottom: 16,
  },
  highlightHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: C.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  highlightItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    gap: 8,
  },
  foodTypeIcon: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  foodTypeVeg: { borderColor: "#15803D" },
  foodTypeNonVeg: { borderColor: "#DC2626" },
  foodTypeDot: { width: 6, height: 6, borderRadius: 3 },
  foodDotVeg: { backgroundColor: "#15803D" },
  foodDotNonVeg: { backgroundColor: "#DC2626" },

  miniItemThumb: { width: 30, height: 30, borderRadius: 6, backgroundColor: "#E5E7EB", overflow: "hidden" },
  miniItemThumbFallback: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: C.orangeLight,
    alignItems: "center",
    justifyContent: "center",
  },
  highlightItemName: { flex: 1, minWidth: 0, fontSize: 13, color: C.text, fontWeight: "500" },
  highlightItemPrice: { fontSize: 13, fontWeight: "700", flexShrink: 0, marginLeft: 8 },
  moreItemsText: { fontSize: 11, color: C.textMuted, marginTop: 6, textAlign: "right" },

  /* View Menu CTA Button: pinned to bottom via marginTop: auto */
  menuBtn: {
    marginTop: "auto",
    backgroundColor: C.orange,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  menuBtnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  menuBtnArrow: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },

  /* Empty State */
  emptyState: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 36,
    alignItems: "center",
    marginVertical: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: C.text, textAlign: "center" },
  emptySub: { fontSize: 13, color: C.textSub, marginTop: 6, textAlign: "center" },
  emptyResetBtn: {
    marginTop: 16,
    backgroundColor: C.orangeLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  emptyResetText: { fontSize: 13, fontWeight: "700", color: C.orange },

  /* Top Navigation Bar */
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  navBackBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  navBackArrow: {
    fontSize: 16,
    fontWeight: "700",
    color: C.text,
  },
  navBackText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
  },
  navLogoWrap: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  navLogo: {
    fontSize: 18,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
  },
  navCartBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  navCartIcon: {
    fontSize: 18,
  },
});
