import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View, Platform } from "react-native";
import { useState } from "react";

const allCategories = [
  { icon: "🍴", title: "Food & Cafes", desc: "Restaurants, street food, cafes & bakeries", route: "/food", bg: "#FFF7ED", accent: "#FB923C" },
  { icon: "🏨", title: "Hotels & Stays", desc: "Hotels, resorts, lodges & guest houses", route: "/hotels", bg: "#EFF6FF", accent: "#3B82F6" },
  { icon: "📍", title: "Places", desc: "Tourist spots, forts, temples & landmarks", route: "/places", bg: "#ECFDF5", accent: "#10B981" },
  { icon: "🛍️", title: "Shopping", desc: "Malls, markets, local shops & boutiques", route: "/shopping", bg: "#FDF2F8", accent: "#EC4899" },
  { icon: "🏥", title: "Healthcare", desc: "Hospitals, clinics, pharmacies & labs", route: "/healthcare", bg: "#F0F9FF", accent: "#0EA5E9" },
  { icon: "🔧", title: "Services", desc: "Plumbing, electricians, repairs & more", route: "/services", bg: "#F5F3FF", accent: "#8B5CF6" },
  { icon: "🎉", title: "Events", desc: "Festivals, cultural programs & meetups", route: "/events", bg: "#FEF9C3", accent: "#EAB308" },
  { icon: "🎓", title: "Education", desc: "Schools, colleges, coaching & tuitions", route: "/places", bg: "#F0FDF4", accent: "#22C55E" },
  { icon: "🏋️", title: "Fitness & Gym", desc: "Gyms, yoga studios & sports centers", route: "/places", bg: "#FFF1F2", accent: "#F43F5E" },
  { icon: "🚗", title: "Transport", desc: "Auto, cab, bus services & rentals", route: "/places", bg: "#ECFEFF", accent: "#06B6D4" },
  { icon: "💼", title: "Jobs & Work", desc: "Local job listings & opportunities", route: "/places", bg: "#FEF3C7", accent: "#F59E0B" },
  { icon: "🏠", title: "Real Estate", desc: "Houses, plots, rentals & PG rooms", route: "/places", bg: "#EDE9FE", accent: "#7C3AED" },
];

const popularSearches = [
  "Biryani near me", "Best hotels", "Nagarjuna Sagar", "Hospitals",
  "Weekend getaways", "Local markets", "Temples", "Shopping malls",
];

const WEB_FONT = Platform.select({
  web: { fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" },
  default: {},
});

export default function ExploreScreen() {
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState("");

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1050;

  const filtered = search.trim()
    ? allCategories.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.desc.toLowerCase().includes(search.toLowerCase())
      )
    : allCategories;

  return (
    <ScrollView style={s.page} showsVerticalScrollIndicator={false}>
      {/* Navbar */}
      <View style={s.navbar}>
        <View style={s.navInner}>
          <Pressable onPress={() => router.push("/")}>
            <Text style={s.logo}>Nalgonda<Text style={s.logoAccent}>One</Text></Text>
          </Pressable>
          {!isMobile && (
            <View style={s.navLinks}>
              <Pressable onPress={() => router.push("/")}><Text style={s.navLink}>Home</Text></Pressable>
              <Text style={s.navActive}>Explore</Text>
              <Pressable onPress={() => router.push("/events")}><Text style={s.navLink}>Events</Text></Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroBlob1} />
        <View style={s.heroBlob2} />
        <View style={{ zIndex: 2, alignItems: "center", width: "100%", maxWidth: 800, paddingHorizontal: 20 }}>
          <Text style={s.kicker}>BROWSE ALL</Text>
          <Text style={[s.heroTitle, { fontSize: isMobile ? 36 : 52 }]}>Explore Nalgonda</Text>
          <Text style={s.heroSub}>Browse every category and discover what Nalgonda has to offer.</Text>

          {/* Search */}
          <View style={[s.searchBox, { width: isMobile ? "100%" : "80%" }]}>
            <Text style={s.searchIcon}>⌕</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Filter categories..."
              placeholderTextColor="#94A3B8"
              style={s.searchInput as any}
            />
          </View>
        </View>
      </View>

      {/* Popular Searches */}
      <View style={s.section}>
        <View style={{ maxWidth: 1200, width: "100%", alignSelf: "center", paddingHorizontal: isMobile ? 20 : isTablet ? 36 : 0 }}>
          <Text style={s.sectionLabel}>Popular Searches</Text>
          <View style={s.tagsRow}>
            {popularSearches.map((tag) => (
              <Pressable key={tag} style={({ pressed }) => [s.tag, { opacity: pressed ? 0.7 : 1 }]}>
                <Text style={s.tagText}>{tag}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Categories Grid */}
      <View style={s.section}>
        <View style={{ maxWidth: 1200, width: "100%", alignSelf: "center", paddingHorizontal: isMobile ? 20 : isTablet ? 36 : 0 }}>
          <Text style={s.sectionLabel}>All Categories</Text>
          <View style={s.grid}>
            {filtered.map((cat) => (
              <Pressable
                key={cat.title}
                onPress={() => router.push(cat.route as any)}
                style={({ pressed }) => [
                  s.card,
                  {
                    backgroundColor: cat.bg,
                    width: isMobile ? "100%" : isTablet ? "48%" : "23.5%",
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <View style={[s.iconWrap, { backgroundColor: "rgba(255,255,255,0.8)" }]}>
                  <Text style={s.icon}>{cat.icon}</Text>
                </View>
                <Text style={s.cardTitle}>{cat.title}</Text>
                <Text style={s.cardDesc}>{cat.desc}</Text>
                <Text style={[s.cardArrow, { color: cat.accent }]}>Explore →</Text>
              </Pressable>
            ))}
          </View>

          {filtered.length === 0 && (
            <View style={s.empty}>
              <Text style={{ fontSize: 48 }}>🔍</Text>
              <Text style={s.emptyText}>No categories match "{search}"</Text>
            </View>
          )}
        </View>
      </View>

      {/* Back to Home CTA */}
      <View style={s.ctaWrap}>
        <Pressable style={({ pressed }) => [s.ctaBtn, { opacity: pressed ? 0.85 : 1 }]} onPress={() => router.push("/")}>
          <Text style={s.ctaBtnText}>← Back to Home</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerLogo}>Nalgonda<Text style={s.logoAccent}>One</Text></Text>
        <Text style={s.footerText}>Everything Nalgonda in One Place.</Text>
      </View>
    </ScrollView>
  );
}

const BRAND = "#2563EB";
const SLATE_900 = "#0F172A";
const SLATE_500 = "#64748B";

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F8FAFC" },

  /* navbar */
  navbar: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderBottomWidth: 1,
    borderBottomColor: "#E8EEF5",
    ...(Platform.OS === "web" ? { position: "sticky" as any, top: 0, zIndex: 100, backdropFilter: "blur(16px)" as any } : {}),
  },
  navInner: {
    maxWidth: 1200, width: "100%", alignSelf: "center", height: 72,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20,
  },
  logo: { fontSize: 24, fontWeight: "900", color: SLATE_900, letterSpacing: -0.8, ...WEB_FONT },
  logoAccent: { color: BRAND },
  navLinks: { flexDirection: "row", alignItems: "center", gap: 28 },
  navLink: { fontSize: 14, fontWeight: "600", color: SLATE_500, ...WEB_FONT },
  navActive: { fontSize: 14, fontWeight: "800", color: BRAND, ...WEB_FONT },

  /* hero */
  hero: {
    backgroundColor: "#EBF4FF", overflow: "hidden", alignItems: "center",
    paddingVertical: 70,
  },
  heroBlob1: {
    position: "absolute", width: 400, height: 400, borderRadius: 200,
    backgroundColor: "#BFDBFE", opacity: 0.3, top: -150, left: -100,
  },
  heroBlob2: {
    position: "absolute", width: 350, height: 350, borderRadius: 175,
    backgroundColor: "#DDD6FE", opacity: 0.25, bottom: -200, right: -100,
  },
  kicker: { fontSize: 11, fontWeight: "900", letterSpacing: 2, color: BRAND, marginBottom: 8, ...WEB_FONT },
  heroTitle: { fontWeight: "900", textAlign: "center", color: SLATE_900, letterSpacing: -2, ...WEB_FONT },
  heroSub: { marginTop: 14, fontSize: 16, lineHeight: 26, textAlign: "center", color: SLATE_500, maxWidth: 550, ...WEB_FONT },

  searchBox: {
    height: 56, marginTop: 28, backgroundColor: "#FFFFFF", borderRadius: 16,
    borderWidth: 1, borderColor: "#DCE6F2", flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, maxWidth: 680,
    ...(Platform.OS === "web" ? { boxSizing: "border-box" as any } : {}),
  },
  searchIcon: { fontSize: 24, color: SLATE_500, marginRight: 8, flexShrink: 0 },
  searchInput: { flex: 1, minWidth: 0, flexShrink: 1, height: "100%", fontSize: 15, color: SLATE_900, outlineStyle: "none" as any, ...WEB_FONT },

  /* sections */
  section: { paddingTop: 40, paddingBottom: 20 },
  sectionLabel: { fontSize: 18, fontWeight: "800", color: SLATE_900, marginBottom: 16, ...WEB_FONT },

  /* popular searches */
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: {
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0",
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 30,
  },
  tagText: { fontSize: 13, fontWeight: "600", color: SLATE_500, ...WEB_FONT },

  /* grid */
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  card: {
    minHeight: 180, borderRadius: 22, padding: 22,
    borderWidth: 1, borderColor: "rgba(148,163,184,0.15)", justifyContent: "space-between",
  },
  iconWrap: { width: 50, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  icon: { fontSize: 26 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B", marginTop: 14, ...WEB_FONT },
  cardDesc: { fontSize: 13, color: SLATE_500, marginTop: 4, lineHeight: 20, ...WEB_FONT },
  cardArrow: { fontSize: 13, fontWeight: "700", marginTop: 12, ...WEB_FONT },

  /* empty */
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: SLATE_500, marginTop: 12, ...WEB_FONT },

  /* cta */
  ctaWrap: { alignItems: "center", paddingVertical: 40 },
  ctaBtn: { backgroundColor: BRAND, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  ctaBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", ...WEB_FONT },

  /* footer */
  footer: { backgroundColor: "#020617", paddingVertical: 50, alignItems: "center" },
  footerLogo: { fontSize: 24, fontWeight: "900", color: "#FFFFFF", ...WEB_FONT },
  footerText: { marginTop: 8, fontSize: 14, color: SLATE_500, ...WEB_FONT },
});
