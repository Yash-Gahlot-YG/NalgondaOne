import { router, useLocalSearchParams } from "expo-router";
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
  View,
} from "react-native";
import {
  CAFES,
  getCafeCoverImage,
  getMenuItemImage,
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
  orange: "#FF5200", // Swiggy / Zomato energetic accent
  orangeLight: "#FFF4EE",
  orangeDark: "#E04800",
  text: "#1C1C27",
  textSub: "#4B5563",
  textMuted: "#9CA3AF",
  green: "#15803D",
  greenLight: "#F0FDF4",
  amber: "#B45309",
  amberLight: "#FEF3C7",
  red: "#DC2626",
  redLight: "#FEF2F2",
  blue: "#1D4ED8",
  blueLight: "#EFF6FF",
  tagBg: "#F3F4F6",
  tagText: "#374151",
};

const FONT =
  Platform.select({ web: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" } }) ?? {};

/* ─── Helpers ───────────────────────────────────────────────────── */
function priceLabel(item: CafeMenuItem) {
  if (item.isDemo) return "Demo price — not confirmed";
  if (!item.priceVerified || item.price === null) return "Price to be confirmed";
  return `₹${item.price}`;
}

function priceColor(item: CafeMenuItem) {
  if (item.isDemo) return C.amber;
  if (!item.priceVerified || item.price === null) return C.textMuted;
  return C.text;
}

function canAdd(item: CafeMenuItem) {
  return item.priceVerified && item.price !== null;
}

/* ─── MenuItem Card Component ───────────────────────────────────── */
function MenuItemCard({ item, cafeId }: { item: CafeMenuItem; cafeId: string }) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [imageError, setImageError] = useState(false);
  const cartEntry = items.find((i) => i.itemId === item.id);
  const qty = cartEntry?.quantity ?? 0;
  const addable = canAdd(item);
  const dishImage = getMenuItemImage(item.id);

  function handleAdd() {
    if (!addable) return;
    addItem({
      cafeId,
      itemId: item.id,
      name: item.name,
      price: item.price,
      priceVerified: item.priceVerified,
      quantity: 1,
    });
  }

  function handleInc() {
    updateQuantity(item.id, qty + 1);
  }

  function handleDec() {
    if (qty <= 1) removeItem(item.id);
    else updateQuantity(item.id, qty - 1);
  }

  return (
    <View style={m.card}>
      {/* Left Details Column */}
      <View style={m.leftCol}>
        {/* Veg / Non-Veg Indicator & Category */}
        <View style={m.vegRow}>
          <View style={[m.foodTypeIcon, item.isVeg ? m.foodTypeVeg : m.foodTypeNonVeg]}>
            <View style={[m.foodTypeDot, item.isVeg ? m.foodDotVeg : m.foodDotNonVeg]} />
          </View>
          {item.isVeg && <Text style={m.vegLabel}>VEG</Text>}
          {item.category && <Text style={m.categoryPill}>{item.category}</Text>}
        </View>

        {/* Item Name */}
        <Text style={m.name}>{item.name}</Text>

        {/* Price row */}
        <View style={m.priceRow}>
          <Text style={[m.price, { color: priceColor(item) }]}>{priceLabel(item)}</Text>
          {item.isDemo && (
            <View style={m.demoTag}>
              <Text style={m.demoTagText}>DEMO</Text>
            </View>
          )}
          {!addable && !item.isDemo && (
            <View style={m.tbcTag}>
              <Text style={m.tbcTagText}>Price Unconfirmed</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {item.description ? (
          <Text style={m.desc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {/* Source provenance tag */}
        {item.sourceUrl ? (
          <Text style={m.sourceTag}>
            Verified via public listing · Checked {item.checkedOn ?? "recently"}
          </Text>
        ) : null}
      </View>

      {/* Right Image + ADD button container */}
      <View style={m.rightCol}>
        <View style={m.imageWrap}>
          {dishImage && !imageError ? (
            <ExpoImage
              source={dishImage}
              style={m.foodImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              onError={() => setImageError(true)}
              accessibilityLabel={item.name}
            />
          ) : (
            <FoodPlaceholder item={item} size="medium" />
          )}

          {/* ADD / Quantity controller overlapping bottom of image (Zomato/Swiggy signature) */}
          <View style={m.actionWrap}>
            {qty === 0 ? (
              <Pressable
                style={({ pressed }) => [
                  m.addBtn,
                  !addable && m.addBtnDisabled,
                  pressed && addable && m.addBtnPressed,
                ]}
                onPress={handleAdd}
                disabled={!addable}
                accessibilityRole="button"
                accessibilityLabel={addable ? `Add ${item.name}` : `${item.name} price not confirmed`}
              >
                <Text style={[m.addBtnText, !addable && m.addBtnTextDisabled]}>
                  {addable ? "ADD +" : "TBC"}
                </Text>
              </Pressable>
            ) : (
              <View style={m.qtyControl}>
                <Pressable
                  style={m.qtyBtn}
                  onPress={handleDec}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease quantity"
                >
                  <Text style={m.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={m.qtyValue}>{qty}</Text>
                <Pressable
                  style={m.qtyBtn}
                  onPress={handleInc}
                  accessibilityRole="button"
                  accessibilityLabel="Increase quantity"
                >
                  <Text style={m.qtyBtnText}>+</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const m = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: "space-between",
    alignItems: "flex-start",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }
      : { shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }),
  },
  leftCol: { flex: 1, paddingRight: 14 },
  vegRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 },
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
  vegLabel: { fontSize: 10, fontWeight: "700", color: "#15803D" },
  categoryPill: {
    fontSize: 10,
    fontWeight: "600",
    color: C.textSub,
    backgroundColor: C.tagBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  name: { fontSize: 16, fontWeight: "800", color: C.text, letterSpacing: -0.2 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 6 },
  price: { fontSize: 15, fontWeight: "800" },
  demoTag: { backgroundColor: C.amberLight, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  demoTagText: { fontSize: 9, fontWeight: "800", color: C.amber },
  tbcTag: { backgroundColor: C.tagBg, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tbcTagText: { fontSize: 9, fontWeight: "700", color: C.textMuted },

  desc: { fontSize: 13, color: C.textSub, lineHeight: 18, marginTop: 2 },
  sourceTag: { fontSize: 10, color: C.textMuted, marginTop: 8 },

  rightCol: { alignItems: "center", width: 106 },
  imageWrap: {
    width: 100,
    height: 100,
    position: "relative",
    borderRadius: 12,
  },
  foodImage: {
    width: 100,
    height: 86,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },
  fallbackImage: {
    width: 100,
    height: 86,
    borderRadius: 12,
    backgroundColor: C.orangeLight,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackIcon: { fontSize: 28 },

  actionWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: C.orange,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 3px 8px rgba(0,0,0,0.12)", cursor: "pointer" as any }
      : { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }),
  },
  addBtnPressed: { backgroundColor: C.orangeLight },
  addBtnDisabled: { borderColor: C.border, backgroundColor: "#F9FAFB" },
  addBtnText: { fontSize: 12, fontWeight: "800", color: C.orange },
  addBtnTextDisabled: { color: C.textMuted },

  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.orange,
    borderRadius: 8,
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 3px 10px rgba(255, 82, 0, 0.35)" }
      : { shadowColor: C.orange, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }),
  },
  qtyBtn: { paddingHorizontal: 9, paddingVertical: 5, backgroundColor: C.orange },
  qtyBtnText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
  qtyValue: { paddingHorizontal: 8, fontSize: 12, fontWeight: "800", color: "#FFFFFF" },
});

/* ─── CartBar Bottom Strip ──────────────────────────────────────── */
function CartBar() {
  const { items } = useCart();
  const total = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);
  if (total === 0) return null;

  return (
    <Pressable
      style={({ pressed }) => [cb.bar, pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }]}
      onPress={() => router.push("/food/cart")}
      accessibilityRole="button"
      accessibilityLabel="View Cart"
    >
      <View style={cb.left}>
        <View style={cb.badge}>
          <Text style={cb.badgeText}>{total}</Text>
        </View>
        <View>
          <Text style={cb.title}>{total} item{total !== 1 ? "s" : ""} added</Text>
          <Text style={cb.sub}>₹{subtotal} · Cash on Delivery</Text>
        </View>
      </View>
      <View style={cb.right}>
        <Text style={cb.action}>View Cart →</Text>
      </View>
    </Pressable>
  );
}

const cb = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.orange,
    marginHorizontal: 16,
    marginBottom: 20,
    maxWidth: 720,
    alignSelf: "center",
    width: "92%",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 8px 24px rgba(255, 82, 0, 0.4)", cursor: "pointer" as any }
      : { shadowColor: C.orange, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 }),
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  badge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 13, fontWeight: "900", color: C.orange },
  title: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
  sub: { fontSize: 12, color: "rgba(255,255,255,0.85)" },
  right: { backgroundColor: "rgba(0,0,0,0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  action: { fontSize: 14, fontWeight: "800", color: "#FFFFFF" },
});

/* ─── DetailScreen Main Component ───────────────────────────────── */
export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [coverError, setCoverError] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);
  const goBackToFood = useSafeBack("/food");

  const cafe = CAFES.find((c) => c.id === id);

  if (!cafe) {
    return (
      <View style={[d.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 16, color: C.textSub }}>Café not found.</Text>
        <Pressable style={d.backBtnSimple} onPress={goBackToFood}>
          <Text style={d.backBtnSimpleText}>← Back to Cafés</Text>
        </Pressable>
      </View>
    );
  }

  const coverImage = getCafeCoverImage(cafe.id);

  const menuItems = useMemo(() => {
    if (vegOnly) {
      return cafe.menu.filter((i) => i.isVeg);
    }
    return cafe.menu;
  }, [cafe.menu, vegOnly]);

  const verifiedItems = menuItems.filter((i) => i.priceVerified && i.price !== null && !i.isDemo);
  const unverifiedItems = menuItems.filter((i) => !i.priceVerified || i.price === null || i.isDemo);

  return (
    <View style={[d.root, FONT as object]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={d.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Compact Hero Section with Cover Image ── */}
        <View style={[d.heroWrap, { height: 190 + Math.max(insets.top, 0) }]}>
          {coverImage && !coverError ? (
            <ExpoImage
              source={coverImage}
              style={d.heroCoverImg}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              onError={() => setCoverError(true)}
              accessibilityLabel={`${cafe.name} cover`}
            />
          ) : (
            <View style={d.heroFallback}>
              <Text style={{ fontSize: 44 }}>🍽️</Text>
            </View>
          )}

          {/* Top Overlays */}
          <View style={[d.heroTopBar, { top: Math.max(insets.top + 6, 14) }]}>
            <Pressable
              style={({ pressed }) => [d.backBtnFloating, pressed && { opacity: 0.85 }]}
              onPress={goBackToFood}
              accessibilityRole="button"
              accessibilityLabel="Back to Cafes"
            >
              <Text style={d.backBtnFloatingText}>← Cafés</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Clean Cafe Info Card ── */}
        <View style={d.infoCard}>
          <View style={d.infoMainRow}>
            <View style={{ flex: 1 }}>
              <Text style={d.cafeTitle}>{cafe.name}</Text>
              {cafe.cuisine && <Text style={d.cafeCuisine}>{cafe.cuisine}</Text>}
              <Text style={d.cafeAddr}>📍 {cafe.address}</Text>
            </View>
          </View>

          <View style={d.infoDivider} />

          {/* Accurate Meta row (No fake ratings / fake delivery times) */}
          <View style={d.metaRow}>
            <View style={d.metaItem}>
              <Text style={d.metaIcon}>💵</Text>
              <Text style={d.metaText}>Cash on Delivery</Text>
            </View>
            <View style={d.metaDot}><Text style={d.metaDotText}>•</Text></View>
            <View style={d.metaItem}>
              <Text style={d.metaIcon}>📋</Text>
              <Text style={d.metaText}>{cafe.menu.length} menu items</Text>
            </View>
            {verifiedItems.length > 0 && (
              <>
                <View style={d.metaDot}><Text style={d.metaDotText}>•</Text></View>
                <View style={d.metaItem}>
                  <Text style={d.metaIcon}>✓</Text>
                  <Text style={[d.metaText, { color: C.green, fontWeight: "700" }]}>
                    Verified Prices
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── Main Body Section ── */}
        <View style={d.body}>
          {/* Veg Only Filter Toggle */}
          <View style={d.filterBar}>
            <Pressable
              style={[d.vegFilterBtn, vegOnly && d.vegFilterBtnActive]}
              onPress={() => setVegOnly(!vegOnly)}
              accessibilityRole="button"
              accessibilityLabel="Filter vegetarian items only"
            >
              <View style={[m.foodTypeIcon, m.foodTypeVeg, { marginRight: 6 }]}>
                <View style={[m.foodTypeDot, m.foodDotVeg]} />
              </View>
              <Text style={[d.vegFilterText, vegOnly && d.vegFilterTextActive]}>
                Veg Only
              </Text>
            </Pressable>
          </View>

          {/* Verified Items Section */}
          {verifiedItems.length > 0 && (
            <View style={d.menuGroup}>
              <View style={d.groupHeaderRow}>
                <Text style={d.groupTitle}>Verified Menu Items</Text>
                <View style={d.groupBadge}>
                  <Text style={d.groupBadgeText}>✓ Ready to order</Text>
                </View>
              </View>
              {verifiedItems.map((item) => (
                <MenuItemCard key={item.id} item={item} cafeId={cafe.id} />
              ))}
            </View>
          )}

          {/* Unverified / Demo Items Section */}
          {unverifiedItems.length > 0 && (
            <View style={d.menuGroup}>
              <View style={d.groupHeaderRow}>
                <Text style={d.groupTitle}>
                  {verifiedItems.length > 0 ? "Items (Price to be confirmed)" : "Menu Items"}
                </Text>
                <Text style={d.groupCount}>({unverifiedItems.length})</Text>
              </View>
              {unverifiedItems.map((item) => (
                <MenuItemCard key={item.id} item={item} cafeId={cafe.id} />
              ))}
            </View>
          )}

          <View style={{ height: 110 }} />
        </View>
      </ScrollView>

      {/* Persistent Bottom Cart Bar */}
      <CartBar />
    </View>
  );
}

/* ─── Detail Styles ─────────────────────────────────────────────── */
const d = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: {
    flexGrow: 1,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },

  /* Compact Hero */
  heroWrap: {
    height: 190,
    width: "100%",
    position: "relative",
    backgroundColor: "#F3F4F6",
  },
  heroCoverImg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: C.orangeLight,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTopBar: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtnFloating: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(0,0,0,0.15)", cursor: "pointer" as any }
      : { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 }),
  },
  backBtnFloatingText: { fontSize: 13, fontWeight: "700", color: C.text },

  backBtnSimple: {
    marginTop: 14,
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  backBtnSimpleText: { fontSize: 14, fontWeight: "600", color: C.text },

  /* Floating Info Card */
  infoCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    marginHorizontal: 14,
    marginTop: -24,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }
      : { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 }),
  },
  infoMainRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cafeTitle: { fontSize: 22, fontWeight: "900", color: C.text, letterSpacing: -0.4 },
  cafeCuisine: { fontSize: 13, fontWeight: "600", color: C.orangeDark, marginTop: 2 },
  cafeAddr: { fontSize: 12, color: C.textSub, marginTop: 4 },

  infoDivider: { height: 1, backgroundColor: C.borderLight, marginVertical: 12 },

  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaIcon: { fontSize: 12 },
  metaText: { fontSize: 12, color: C.textSub, fontWeight: "600" },
  metaDot: { marginHorizontal: 2 },
  metaDotText: { color: C.textMuted },

  /* Body */
  body: { paddingHorizontal: 14, paddingTop: 14 },

  filterBar: { flexDirection: "row", marginBottom: 14 },
  vegFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  vegFilterBtnActive: { borderColor: "#15803D", backgroundColor: C.greenLight },
  vegFilterText: { fontSize: 12, fontWeight: "700", color: C.textSub },
  vegFilterTextActive: { color: "#15803D" },

  menuGroup: { marginBottom: 18 },
  groupHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  groupTitle: { fontSize: 17, fontWeight: "800", color: C.text, letterSpacing: -0.2 },
  groupBadge: {
    backgroundColor: C.greenLight,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  groupBadgeText: { fontSize: 10, fontWeight: "700", color: C.green },
  groupCount: { fontSize: 13, fontWeight: "600", color: C.textMuted },
});
