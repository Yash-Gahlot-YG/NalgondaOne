import { router } from "expo-router";
import { useState } from "react";
import { useSafeBack } from "@/hooks/useSafeBack";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCart } from "@/context/CartContext";

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
  blue: "#1D4ED8",
  blueLight: "#EFF6FF",
  tagBg: "#F3F4F6",
};

const FONT =
  Platform.select({ web: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" } }) ?? {};

type PaymentMethod = "cod" | "online";

function generateOrderId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NGO-${ts}-${rand}`;
}

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { items, clearCart } = useCart();
  const goBackToCart = useSafeBack("/food/cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState<"delivery" | "pickup">("delivery");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [onlineMsg, setOnlineMsg] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<null | { orderId: string; total: number; deliveryMode: string }>(null);
  const [placing, setPlacing] = useState(false);

  const subtotal = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);
  const allVerified = items.every((i) => i.priceVerified && i.price !== null);

  async function placeOrder() {
    if (!allVerified) return;
    if (!name.trim() || !phone.trim()) {
      if (Platform.OS === "web") {
        alert("Please enter your name and phone number.");
      } else {
        Alert.alert("Missing details", "Please enter your name and phone number.");
      }
      return;
    }
    if (delivery === "delivery" && !address.trim()) {
      if (Platform.OS === "web") {
        alert("Please enter your delivery address.");
      } else {
        Alert.alert("Missing address", "Please enter your delivery address.");
      }
      return;
    }

    setPlacing(true);
    try {
      const orderId = generateOrderId();
      const order = {
        orderId,
        items,
        deliveryMode: delivery,
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          address: delivery === "delivery" ? address.trim() : "Self pickup at cafe",
        },
        paymentMethod: "COD",
        total: subtotal,
        timestamp: new Date().toISOString(),
        isDemo: true,
        note: "Demo order — preserved locally in AsyncStorage under @demo_orders.",
      };

      const existing = await AsyncStorage.getItem("@demo_orders");
      const all = existing ? JSON.parse(existing) : [];
      all.push(order);
      await AsyncStorage.setItem("@demo_orders", JSON.stringify(all));

      clearCart();
      setConfirmedOrder({ orderId, total: subtotal, deliveryMode: delivery });
    } catch (e) {
      if (Platform.OS === "web") {
        alert("Failed to save order. Please try again.");
      } else {
        Alert.alert("Error", "Failed to save order. Please try again.");
      }
    } finally {
      setPlacing(false);
    }
  }

  // ── Order Confirmation screen ──────────────────────────────────
  if (confirmedOrder) {
    return (
      <View style={[ok.root, FONT as object]}>
        <View style={ok.card}>
          <View style={ok.checkCircle}>
            <Text style={ok.check}>✓</Text>
          </View>
          <Text style={ok.title}>Order Placed Successfully!</Text>
          <Text style={ok.sub}>
            Thank you! Your demo food order has been recorded locally.
          </Text>

          <View style={ok.idBox}>
            <Text style={ok.idLabel}>YOUR DEMO ORDER ID</Text>
            <Text style={ok.idVal} numberOfLines={1}>{confirmedOrder.orderId}</Text>
            <Text style={ok.idSub}>
              Total ₹{confirmedOrder.total} · Cash on Delivery ({confirmedOrder.deliveryMode === "delivery" ? "Delivery" : "Takeaway"})
            </Text>
          </View>

          <View style={ok.noticeBox}>
            <Text style={ok.noticeIcon}>ℹ️</Text>
            <Text style={ok.note}>
              This demo order is recorded locally in <Text style={{ fontWeight: "700" }}>@demo_orders</Text>. No live payment was charged.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [ok.btn, pressed && { opacity: 0.9 }]}
            onPress={() => router.replace("/food")}
            accessibilityRole="button"
            accessibilityLabel="Back to Cafés"
          >
            <Text style={ok.btnText}>Return to Cafés</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Checkout form ──────────────────────────────────────────────
  return (
    <View style={[s.root, FONT as object]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            s.scroll,
            { paddingTop: Math.max(insets.top, 18) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* Header */}
        <View style={s.header}>
          <Pressable
            style={s.backBtn}
            onPress={goBackToCart}
            accessibilityRole="button"
            accessibilityLabel="Go back to cart"
          >
            <Text style={s.backBtnText}>← Cart</Text>
          </Pressable>
          <Text style={s.title}>Complete Order</Text>
          <Text style={s.subtitle}>Review your items, delivery details, and payment</Text>
        </View>

        {/* Order summary card */}
        <View style={s.card}>
          <View style={s.cardHeaderRow}>
            <Text style={s.cardTitle}>Order Summary</Text>
            <Text style={s.cardCount}>{items.length} item{items.length !== 1 ? "s" : ""}</Text>
          </View>

          {items.map((item) => (
            <View key={item.itemId} style={s.summaryRow}>
              <Text style={s.summaryName} numberOfLines={1}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={s.summaryPrice}>
                {item.priceVerified && item.price !== null ? `₹${item.price * item.quantity}` : "—"}
              </Text>
            </View>
          ))}

          <View style={s.summaryDivider} />

          <View style={s.billRow}>
            <Text style={s.billLabel}>Delivery fee</Text>
            <Text style={[s.billVal, { color: C.green }]}>Free</Text>
          </View>

          <View style={s.billRow}>
            <Text style={s.billLabel}>Taxes and charges</Text>
            <Text style={s.billVal}>Included</Text>
          </View>

          <View style={s.summaryDivider} />

          <View style={s.summaryTotal}>
            <View>
              <Text style={s.totalLabel}>Total Payable</Text>
              <Text style={s.totalSub}>Cash on Delivery (COD)</Text>
            </View>
            <Text style={s.totalAmt}>₹{subtotal}</Text>
          </View>
        </View>

        {/* Customer details card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Contact Details</Text>

          <Text style={s.inputLabel}>Full Name *</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ramesh Reddy"
            placeholderTextColor={C.textMuted}
            accessibilityLabel="Full name"
          />

          <Text style={s.inputLabel}>Mobile Phone Number *</Text>
          <TextInput
            style={s.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            placeholderTextColor={C.textMuted}
            keyboardType="phone-pad"
            accessibilityLabel="Phone number"
          />
        </View>

        {/* Delivery / Pickup selection */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Delivery Mode</Text>

          <View style={s.modeRow}>
            <Pressable
              style={[s.modeBtn, delivery === "delivery" && s.modeBtnActive]}
              onPress={() => setDelivery("delivery")}
              accessibilityRole="button"
              accessibilityLabel="Doorstep delivery"
            >
              <Text style={[s.modeBtnText, delivery === "delivery" && s.modeBtnTextActive]} numberOfLines={1}>
                🚚 Delivery
              </Text>
            </Pressable>

            <Pressable
              style={[s.modeBtn, delivery === "pickup" && s.modeBtnActive]}
              onPress={() => setDelivery("pickup")}
              accessibilityRole="button"
              accessibilityLabel="Takeaway pickup"
            >
              <Text style={[s.modeBtnText, delivery === "pickup" && s.modeBtnTextActive]} numberOfLines={1}>
                🏪 Takeaway
              </Text>
            </Pressable>
          </View>

          {delivery === "delivery" && (
            <View style={{ marginTop: 14 }}>
              <Text style={s.inputLabel}>Delivery Address in Nalgonda *</Text>
              <TextInput
                style={[s.input, { height: 76, textAlignVertical: "top", paddingTop: 10 }]}
                value={address}
                onChangeText={setAddress}
                placeholder="House / Flat no., Landmark, Street, Nalgonda"
                placeholderTextColor={C.textMuted}
                multiline
                accessibilityLabel="Delivery address"
              />
            </View>
          )}
        </View>

        {/* Payment Options */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Payment Method</Text>

          {/* COD (Enabled & selectable) */}
          <Pressable
            style={[s.payOption, payment === "cod" && s.payOptionActive]}
            onPress={() => {
              setPayment("cod");
              setOnlineMsg(false);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: payment === "cod" }}
            accessibilityLabel="Cash on Delivery (COD)"
          >
            <View style={[s.radioOuter, payment === "cod" && s.radioOuterActive]}>
              {payment === "cod" && <View style={s.radioInner} />}
            </View>
            <View style={s.payContent}>
              <View style={s.payTitleRow}>
                <Text style={s.payTitle}>Cash on Delivery (COD)</Text>
                <View style={s.activeBadge}>
                  <Text style={s.activeBadgeText}>Recommended</Text>
                </View>
              </View>
              <Text style={s.paySub}>Pay with cash directly when your order is delivered</Text>
            </View>
          </Pressable>

          {/* Online Payment (Visible, disabled/unavailable, on click displays required message) */}
          <Pressable
            style={[s.payOption, s.payOptionDisabled]}
            onPress={() => {
              setOnlineMsg(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Online payment unavailable"
          >
            <View style={s.radioOuter}>
              {payment === "online" && <View style={s.radioInner} />}
            </View>
            <View style={s.payContent}>
              <View style={s.payTitleRow}>
                <Text style={[s.payTitle, { color: C.textSub }]}>Online payment unavailable</Text>
                <View style={s.unavailableBadge}>
                  <Text style={s.unavailableBadgeText}>Unavailable</Text>
                </View>
              </View>
              <Text style={s.paySub}>UPI, Debit/Credit Card, Net Banking</Text>
            </View>
          </Pressable>

          {/* Exact required message for Online Payment */}
          {onlineMsg && (
            <View style={s.onlineNotice}>
              <Text style={s.onlineNoticeIcon}>⚠️</Text>
              <Text style={s.onlineNoticeText}>
                Currently not available. Please use Cash on Delivery (COD).
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Place Order CTA Footer */}
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={s.footerInner}>
          <View>
            <Text style={s.footerSub}>Cash on Delivery</Text>
            <Text style={s.footerAmt}>₹{subtotal}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              s.placeBtn,
              (!allVerified || placing) && s.placeBtnDisabled,
              pressed && allVerified && { opacity: 0.9 },
            ]}
            onPress={placeOrder}
            disabled={!allVerified || placing}
            accessibilityRole="button"
            accessibilityLabel="Place order with Cash on Delivery"
          >
            <Text style={s.placeBtnText}>
              {placing ? "Recording Order…" : allVerified ? `Place Order · COD` : "Prices Unconfirmed"}
            </Text>
          </Pressable>
        </View>
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ─── Confirmation Styles ───────────────────────────────────────── */
const ok = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 22,
    maxWidth: 480,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }
      : { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 }),
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#86EFAC",
  },
  check: { fontSize: 32, color: C.green, fontWeight: "900" },
  title: { fontSize: 20, fontWeight: "900", color: C.text, textAlign: "center", letterSpacing: -0.3 },
  sub: { fontSize: 13, color: C.textSub, textAlign: "center", marginTop: 6, marginBottom: 18 },

  idBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    padding: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  idLabel: { fontSize: 11, fontWeight: "800", color: "#166534", letterSpacing: 0.8 },
  idVal: { fontSize: 18, fontWeight: "900", color: C.green, marginTop: 4, letterSpacing: 0.5, textAlign: "center" },
  idSub: { fontSize: 12, color: C.textSub, marginTop: 4, textAlign: "center" },

  noticeBox: {
    flexDirection: "row",
    backgroundColor: C.blueLight,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: "#2563EB",
  },
  noticeIcon: { fontSize: 16 },
  note: { flex: 1, fontSize: 12, color: "#1E40AF", lineHeight: 18 },

  btn: {
    backgroundColor: C.orange,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  btnText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
});

/* ─── Checkout Styles ───────────────────────────────────────────── */
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

  header: { marginBottom: 18 },
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

  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }
      : { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }),
  },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: C.text, letterSpacing: -0.2 },
  cardCount: { fontSize: 12, fontWeight: "600", color: C.textMuted },

  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  summaryName: { fontSize: 13, color: C.text, flex: 1, marginRight: 8, fontWeight: "500", minWidth: 0 },
  summaryPrice: { fontSize: 13, fontWeight: "700", color: C.text, flexShrink: 0 },
  summaryDivider: { height: 1, backgroundColor: C.borderLight, marginVertical: 10 },
  summaryTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 15, fontWeight: "800", color: C.text },
  totalSub: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  totalAmt: { fontSize: 18, fontWeight: "900", color: C.orange },

  billRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  billLabel: { fontSize: 13, color: C.textSub, flex: 1, minWidth: 0 },
  billVal: { fontSize: 13, fontWeight: "600", color: C.text, flexShrink: 0 },

  inputLabel: { fontSize: 12, fontWeight: "700", color: C.textSub, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.text,
  },

  modeRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  modeBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    backgroundColor: C.surface,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  modeBtnActive: { borderColor: C.orange, backgroundColor: C.orangeLight },
  modeBtnText: { fontSize: 13, fontWeight: "600", color: C.textSub, textAlign: "center" },
  modeBtnTextActive: { color: C.orange, fontWeight: "800" },

  payOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 10,
    backgroundColor: C.surface,
    ...(Platform.OS === "web" ? { cursor: "pointer" as any } : {}),
  },
  payOptionDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: C.borderLight,
  },
  payOptionActive: { borderColor: C.orange, backgroundColor: C.orangeLight },
  payContent: {
    flex: 1,
    minWidth: 0,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  radioOuterActive: { borderColor: C.orange },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.orange },

  payTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
  },
  payTitle: { fontSize: 14, fontWeight: "800", color: C.text, flexShrink: 1, minWidth: 0 },
  paySub: { fontSize: 12, color: C.textSub, marginTop: 3, minWidth: 0 },
  activeBadge: {
    backgroundColor: C.greenLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  activeBadgeText: { fontSize: 10, fontWeight: "800", color: C.green },

  unavailableBadge: {
    backgroundColor: C.tagBg,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  unavailableBadgeText: { fontSize: 10, fontWeight: "700", color: C.textMuted },

  onlineNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.amberLight,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 4,
  },
  onlineNoticeIcon: { fontSize: 16 },
  onlineNoticeText: { flex: 1, fontSize: 12, color: "#92400E", fontWeight: "700", lineHeight: 18 },

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
  placeBtn: {
    backgroundColor: C.orange,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 6px 20px rgba(255, 82, 0, 0.35)", cursor: "pointer" as any }
      : { shadowColor: C.orange, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 }),
  },
  placeBtnDisabled: { backgroundColor: "#E5E7EB" },
  placeBtnText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
});

