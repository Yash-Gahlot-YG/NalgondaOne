import { router } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { useMemo, useState } from "react";
import { useSafeBack } from "@/hooks/useSafeBack";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/context/CartContext";
import { CAFES, getMenuItemImage } from "@/data/cafes";
import { FoodPlaceholder } from "@/components/food/FoodPlaceholder";

/* ─── Design Tokens (White Theme) ───────────────────────────────── */
const C = {
  bg: "#F8F9FA",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  orange: "#FF5200",
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
  tagBg: "#F3F4F6",
};

const FONT =
  Platform.select({ web: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" } }) ?? {};

function CartItemThumb({ item }: { item: { name: string; isVeg: boolean; imageSource: any; category?: string } }) {
  const [thumbError, setThumbError] = useState(false);
  if (item.imageSource && !thumbError) {
    return (
      <ExpoImage
        source={item.imageSource}
        style={s.itemThumb}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        onError={() => setThumbError(true)}
        accessibilityLabel={item.name}
      />
    );
  }
  return <FoodPlaceholder item={item} size="small" />;
}

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { items, updateQuantity, removeItem } = useCart();
  const goBack = useSafeBack("/food");
  const total = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);
  const allVerified = items.every((i) => i.priceVerified && i.price !== null);

  // Map item metadata from CAFES catalog
  const enrichedItems = useMemo(() => {
    return items.map((cartItem) => {
      let foundCafe = CAFES.find((c) => c.id === cartItem.cafeId);
      let foundMenuItem = foundCafe?.menu.find((m) => m.id === cartItem.itemId);
      if (!foundMenuItem) {
        // Fallback search across all cafes if cafeId differed
        for (const c of CAFES) {
          const match = c.menu.find((m) => m.id === cartItem.itemId);
          if (match) {
            foundMenuItem = match;
            foundCafe = c;
            break;
          }
        }
      }
      return {
        ...cartItem,
        cafeName: foundCafe?.name ?? "Nalgonda Cafe",
        imageSource: getMenuItemImage(cartItem.itemId),
        isVeg: foundMenuItem?.isVeg ?? true,
        category: foundMenuItem?.category,
      };
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <View style={[s.root, { justifyContent: "center", alignItems: "center" }, FONT as object]}>
        <View style={s.emptyIconWrap}>
          <Text style={{ fontSize: 44 }}>🛒</Text>
        </View>
        <Text style={s.emptyTitle}>Your cart is empty</Text>
        <Text style={s.emptySub}>Good food is always cooking! Add items from a café menu to get started.</Text>
        <Pressable
          style={({ pressed }) => [s.browseBtn, pressed && { opacity: 0.9 }]}
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Browse Cafes"
        >
          <Text style={s.browseBtnText}>← Browse Nalgonda Cafés</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[s.root, FONT as object]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scroll,
          { paddingTop: Math.max(insets.top, 18) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Pressable
            style={s.backBtn}
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={s.backBtnText}>← Back</Text>
          </Pressable>
          <Text style={s.title}>Order Summary</Text>
          <Text style={s.subtitle}>
            {items.reduce((s, i) => s + i.quantity, 0)} items in your cart
          </Text>
        </View>

        {/* Cafe Banner */}
        <View style={s.cafeNotice}>
          <Text style={s.cafeNoticeIcon}>📍</Text>
          <Text style={s.cafeNoticeText}>
            Ordering from <Text style={{ fontWeight: "700" }}>{enrichedItems[0]?.cafeName ?? "Nalgonda Cafe"}</Text>
          </Text>
        </View>

        {/* Cart Item Cards */}
        <View style={s.itemsCard}>
          {enrichedItems.map((item, idx) => (
            <View key={item.itemId}>
              <View style={s.itemRow}>
                {/* Veg / Non-Veg badge */}
                <View style={[s.foodTypeIcon, item.isVeg ? s.foodTypeVeg : s.foodTypeNonVeg]}>
                  <View style={[s.foodTypeDot, item.isVeg ? s.foodDotVeg : s.foodDotNonVeg]} />
                </View>

                {/* Real food photo thumbnail or food-specific placeholder */}
                <CartItemThumb item={item} />

                {/* Info */}
                <View style={s.itemInfo}>
                  <Text style={s.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.priceVerified && item.price !== null ? (
                    <Text style={s.itemPriceEach}>₹{item.price} each</Text>
                  ) : (
                    <Text style={[s.itemPriceEach, { color: C.amber }]}>Price to be confirmed</Text>
                  )}
                </View>

                {/* Quantity Controls */}
                <View style={s.qtyControl}>
                  <Pressable
                    style={s.qtyBtn}
                    onPress={() => {
                      if (item.quantity <= 1) removeItem(item.itemId);
                      else updateQuantity(item.itemId, item.quantity - 1);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease quantity"
                  >
                    <Text style={s.qtyBtnText}>−</Text>
                  </Pressable>
                  <Text style={s.qtyNum}>{item.quantity}</Text>
                  <Pressable
                    style={s.qtyBtn}
                    onPress={() => updateQuantity(item.itemId, item.quantity + 1)}
                    accessibilityRole="button"
                    accessibilityLabel="Increase quantity"
                  >
                    <Text style={s.qtyBtnText}>+</Text>
                  </Pressable>
                </View>

                {/* Total */}
                <Text style={s.itemRowTotal}>
                  {item.priceVerified && item.price !== null ? `₹${item.price * item.quantity}` : "—"}
                </Text>
              </View>

              {idx < enrichedItems.length - 1 && <View style={s.itemDivider} />}
            </View>
          ))}
        </View>

        {/* Bill Details Breakdown (Zomato/Swiggy pattern) */}
        <View style={s.billCard}>
          <Text style={s.billHeader}>BILL DETAILS</Text>

          <View style={s.billRow}>
            <Text style={s.billLabel}>Item Total</Text>
            <Text style={s.billVal}>₹{total}</Text>
          </View>

          <View style={s.billRow}>
            <Text style={s.billLabel}>Delivery fee</Text>
            <Text style={[s.billVal, { color: C.green }]}>Free</Text>
          </View>

          <View style={s.billRow}>
            <Text style={s.billLabel}>Taxes and charges</Text>
            <Text style={s.billVal}>Included</Text>
          </View>

          <View style={s.billDivider} />

          <View style={s.billTotalRow}>
            <View>
              <Text style={s.totalLabel}>To Pay</Text>
              <Text style={s.totalSub}>Cash on Delivery</Text>
            </View>
            <Text style={s.totalAmt}>₹{total}</Text>
          </View>
        </View>

        {/* Price Verification Warning if needed */}
        {!allVerified && (
          <View style={s.warnBox}>
            <Text style={s.warnTitle}>⚠️ Unconfirmed Prices in Cart</Text>
            <Text style={s.warnText}>
              One or more items in your cart do not have a confirmed public listing price. Please remove them or await cafe confirmation to proceed to checkout.
            </Text>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Checkout Footer CTA */}
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={s.footerInner}>
          <View>
            <Text style={s.footerSub}>Total</Text>
            <Text style={s.footerAmt}>₹{total}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              s.checkoutBtn,
              !allVerified && s.checkoutBtnDisabled,
              pressed && allVerified && { opacity: 0.9 },
            ]}
            onPress={() => allVerified && router.push("/food/checkout")}
            disabled={!allVerified}
            accessibilityRole="button"
            accessibilityLabel="Proceed to checkout"
          >
            <Text style={s.checkoutBtnText}>
              {allVerified ? `Proceed to Checkout →` : "Cannot Checkout"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: {
    flexGrow: 1,
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  header: { marginBottom: 16 },
  backBtn: {
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  backBtnText: { fontSize: 13, fontWeight: "700", color: C.text },
  title: { fontSize: 26, fontWeight: "900", color: C.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: C.textSub, marginTop: 2 },

  cafeNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
    gap: 8,
  },
  cafeNoticeIcon: { fontSize: 14 },
  cafeNoticeText: { fontSize: 13, color: C.textSub },

  /* Items Card */
  itemsCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }
      : { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }),
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 8,
  },
  foodTypeIcon: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  foodTypeVeg: { borderColor: "#15803D" },
  foodTypeNonVeg: { borderColor: "#DC2626" },
  foodTypeDot: { width: 6, height: 6, borderRadius: 3 },
  foodDotVeg: { backgroundColor: "#15803D" },
  foodDotNonVeg: { backgroundColor: "#DC2626" },

  itemThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    flexShrink: 0,
    overflow: "hidden",
  },
  itemThumbFallback: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: C.orangeLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  itemInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 6,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
    minWidth: 0,
    lineHeight: 18,
  },
  itemPriceEach: {
    fontSize: 12,
    color: C.textSub,
    marginTop: 2,
    minWidth: 0,
  },

  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.orange,
    borderRadius: 8,
    overflow: "hidden",
    flexShrink: 0,
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: C.orange,
  },
  qtyBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  qtyNum: {
    paddingHorizontal: 6,
    fontSize: 12,
    fontWeight: "800",
    color: C.orange,
    minWidth: 18,
    textAlign: "center",
  },
  itemRowTotal: {
    fontSize: 14,
    fontWeight: "800",
    color: C.text,
    minWidth: 44,
    textAlign: "right",
    flexShrink: 0,
  },
  itemDivider: { height: 1, backgroundColor: C.borderLight, marginVertical: 4 },

  /* Bill Details */
  billCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  billHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: C.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 6,
  },
  billLabel: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
    fontSize: 13,
    color: C.textSub,
    lineHeight: 18,
  },
  billVal: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    flexShrink: 0,
    textAlign: "right",
  },
  billDivider: { height: 1, backgroundColor: C.borderLight, marginVertical: 10 },
  billTotalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 16, fontWeight: "800", color: C.text },
  totalSub: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  totalAmt: { fontSize: 20, fontWeight: "900", color: C.orange },

  /* Warning */
  warnBox: {
    backgroundColor: C.amberLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  warnTitle: { fontSize: 13, fontWeight: "800", color: "#92400E", marginBottom: 3 },
  warnText: { fontSize: 12, color: "#92400E", lineHeight: 18 },

  /* Footer */
  footer: {
    padding: 16,
    paddingBottom: 26,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  footerInner: {
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerSub: { fontSize: 11, fontWeight: "700", color: C.textMuted, textTransform: "uppercase" },
  footerAmt: { fontSize: 20, fontWeight: "900", color: C.text },
  checkoutBtn: {
    backgroundColor: C.orange,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 6px 20px rgba(255, 82, 0, 0.35)", cursor: "pointer" as any }
      : { shadowColor: C.orange, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 }),
  },
  checkoutBtnDisabled: { backgroundColor: "#E5E7EB" },
  checkoutBtnText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },

  /* Empty state */
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.orangeLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "900", color: C.text },
  emptySub: { fontSize: 14, color: C.textSub, marginTop: 6, textAlign: "center", maxWidth: 360, lineHeight: 20 },
  browseBtn: {
    backgroundColor: C.orange,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  browseBtnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});

