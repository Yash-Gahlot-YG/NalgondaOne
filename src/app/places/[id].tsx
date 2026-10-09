import { router, useLocalSearchParams } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const localImages: Record<string, any> = {
  "nalgonda-fort": require("@/assets/images/nalgonda-fort.jpg"),
  "nagarjuna-sagar": require("@/assets/images/nagarjuna-sagar.jpg"),
  "deverakonda-fort": require("@/assets/images/deverakonda-fort.jpg"),
  "chaya-someshwara": require("@/assets/images/chaya-someshwara.jpg"),
};

const placeDetails: Record<string, any> = {
  "nalgonda-fort": {
    title: "Nalgonda Fort (Khilla)",
    location: "Nalgonda City, Telangana",
    rating: "4.8",
    reviews: "1,240+ reviews",
    bestTime: "October to March (Early morning or sunset)",
    timings: "6:00 AM – 6:30 PM daily",
    tag: "Heritage & Trekking",
    desc: "Perched dramatically on the monolithic granite hill rising above Nalgonda town, Nalgonda Fort (historically known as Kapuralagutta / Latif Saheb Hill Fort) is an ancient bastion of Deccan military architecture. Originally fortified during Kakatiya times and subsequently developed under regional Bahmani and Nizam rulers, the site offers sweeping 360-degree vistas across Nalgonda city and the surrounding countryside.",
    highlights: [
      "Historic stone battlements and panoramic view points",
      "Centuries-old rock-cut water reservoirs",
      "Lateef Saheb Dargah and ancient hill shrine traditions",
      "Trekking trail with over 2,000 stone steps",
    ],
  },
  "nagarjuna-sagar": {
    title: "Nagarjuna Sagar Dam",
    location: "Nalgonda District, Telangana",
    rating: "4.7",
    reviews: "5,800+ reviews",
    bestTime: "August to February (Monsoon crest gate releases)",
    timings: "9:00 AM – 6:00 PM",
    tag: "World Wonder Dam",
    desc: "Nagarjuna Sagar Dam is one of the world's largest and earliest masonry dams, constructed across the Krishna River. It boasts 26 massive crest gates and forms a majestic man-made reservoir that is among the largest in Asia. Visitors can take boat cruises to the Nagarjunakonda island museum which houses invaluable 3rd-century Buddhist relics excavated before the valley was submerged.",
    highlights: [
      "Spectacular sight when 26 crest gates open during peak monsoon",
      "Boat ride to Nagarjunakonda Island Buddhist archaeological museum",
      "Anupu Buddhist amphitheatre and reconstructed viharas nearby",
      "Scenic Krishna river valley viewpoints and boating facilities",
    ],
  },
  "deverakonda-fort": {
    title: "Deverakonda Fort",
    location: "Deverakonda, Nalgonda District",
    rating: "4.5",
    reviews: "890+ reviews",
    bestTime: "November to February",
    timings: "7:00 AM – 6:00 PM",
    tag: "Medieval Fortress",
    desc: "Deverakonda Fort was built in the 14th century by the Recherla Padma Nayaka kings who ruled this region between 1325 and 1473 AD. Spread across a cluster of seven granite hills, the fortress features ingenious defensive architecture with outer bastions, high granite walls, the iconic Lion Gate, and ancient granaries.",
    highlights: [
      "Historic 14th-century Recherla Nayaka dynasty architecture",
      "Ancient monolithic rock-cut bastions and fortified ramparts",
      "The celebrated Lion Gate and ancient Telugu stone inscriptions",
      "A thrilling trekking and photography spot surrounded by lakes",
    ],
  },
  "chaya-someshwara": {
    title: "Chaya Someshwara Temple",
    location: "Panagal, Nalgonda City",
    rating: "4.6",
    reviews: "2,150+ reviews",
    bestTime: "Year-round (Best during daytime to witness shadow)",
    timings: "6:00 AM – 12:00 PM, 4:00 PM – 8:00 PM",
    tag: "Architectural Mystery",
    desc: "Constructed during the 11th–12th centuries under the Kunduru Chodas (Kakatiya vassals), Chaya Someshwara Temple in Panagal is renowned across India for its architectural and optical wonder: a permanent, stationary shadow (Chaya) cast on the Shiva Lingam throughout the entire day, despite the sun's shifting angles and without any pillar directly blocking the light.",
    highlights: [
      "Mysterious single stationary shadow on the Garbhagriha Shiva Lingam",
      "Exquisite Trikuta (three-shrine) Kakatiya stone carving",
      "Intricate pillar carvings depicting the Ramayana and Mahabharata",
      "Centuries-old Kalyani (stepped temple tank) in serene village Panagal",
    ],
  },
};

const WEB_FONT = Platform.select({
  web: { fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" },
  default: {},
});

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1050;

  const placeKey = (id as string) || "nalgonda-fort";
  const place = placeDetails[placeKey] || placeDetails["nalgonda-fort"];
  const imageSource = localImages[placeKey] || localImages["nalgonda-fort"];

  return (
    <ScrollView style={s.page} showsVerticalScrollIndicator={false}>
      {/* Navbar */}
      <View style={s.navbar}>
        <View style={s.navbarInner}>
          <Pressable onPress={() => router.push("/")}>
            <Text style={s.logo}>
              Nalgonda<Text style={s.logoAccent}>One</Text>
            </Text>
          </Pressable>
          <View style={s.navLinks}>
            <Pressable onPress={() => router.push("/")}>
              <Text style={s.navLink}>← Back to Home</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/places")}>
              <Text style={s.navLink}>All Places</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Main Container */}
      <View style={[s.contentWrap, { paddingHorizontal: isMobile ? 16 : isTablet ? 24 : 32 }]}>
        {/* Breadcrumb */}
        <View style={s.breadcrumb}>
          <Pressable onPress={() => router.push("/")}>
            <Text style={s.crumbLink}>Home</Text>
          </Pressable>
          <Text style={s.crumbSep}>/</Text>
          <Pressable onPress={() => router.push("/places")}>
            <Text style={s.crumbLink}>Places</Text>
          </Pressable>
          <Text style={s.crumbSep}>/</Text>
          <Text style={s.crumbCurrent}>{place.title}</Text>
        </View>

        {/* Hero Image */}
        <View style={[s.heroImgWrap, { height: isMobile ? 260 : isTablet ? 380 : 460 }]}>
          <ExpoImage
            source={imageSource}
            style={s.heroImg}
            contentFit="cover"
            priority="high"
            transition={200}
          />
          <View style={s.heroImgGradient} />
          <View style={s.tagBadge}>
            <Text style={s.tagText}>{place.tag}</Text>
          </View>
          <View style={s.ratingBadge}>
            <Text style={s.ratingText}>⭐ {place.rating} ({place.reviews})</Text>
          </View>
        </View>

        {/* Place Info */}
        <View style={[s.infoRow, { flexDirection: isMobile ? "column" : "row" }]}>
          {/* Left: Main Details */}
          <View style={{ flex: 1 }}>
            <Text style={[s.placeTitle, { fontSize: isMobile ? 28 : 36 }]}>{place.title}</Text>
            <Text style={s.placeLoc}>📍 {place.location}</Text>

            <Text style={s.descHeading}>About This Landmark</Text>
            <Text style={s.descText}>{place.desc}</Text>

            <Text style={[s.descHeading, { marginTop: 32 }]}>Key Highlights</Text>
            <View style={s.highlightsList}>
              {place.highlights.map((hl: string, i: number) => (
                <View key={i} style={s.hlItem}>
                  <Text style={s.hlDot}>✓</Text>
                  <Text style={s.hlText}>{hl}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Right: Quick Facts Card */}
          <View style={[s.factsCard, { width: isMobile ? "100%" : 340, marginTop: isMobile ? 32 : 0 }]}>
            <Text style={s.factsTitle}>Visitor Guide</Text>
            <View style={s.factDivider} />

            <View style={s.factItem}>
              <Text style={s.factLabel}>🕒 Visiting Timings</Text>
              <Text style={s.factVal}>{place.timings}</Text>
            </View>

            <View style={s.factItem}>
              <Text style={s.factLabel}>📅 Best Time to Visit</Text>
              <Text style={s.factVal}>{place.bestTime}</Text>
            </View>

            <View style={s.factItem}>
              <Text style={s.factLabel}>🎟️ Entry</Text>
              <Text style={s.factVal}>Free / Open to public</Text>
            </View>

            <View style={s.factItem}>
              <Text style={s.factLabel}>🗺️ District</Text>
              <Text style={s.factVal}>Nalgonda, Telangana</Text>
            </View>

            <Pressable
              onPress={() => router.push("/places")}
              style={({ pressed }) => [s.actionBtn, { opacity: pressed ? 0.85 : 1 }]}
            >
              <Text style={s.actionBtnText}>Explore More Places →</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>© 2026 NalgondaOne. Everything Nalgonda In One Place.</Text>
      </View>
    </ScrollView>
  );
}

const BRAND = "#2563EB";
const SLATE_900 = "#0F172A";
const SLATE_700 = "#334155";
const SLATE_500 = "#64748B";

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  navbar: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    ...(Platform.OS === "web" ? { position: "sticky" as any, top: 0, zIndex: 100 } : {}),
  },
  navbarInner: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 22,
    fontWeight: "900",
    color: SLATE_900,
    ...WEB_FONT,
  },
  logoAccent: {
    color: BRAND,
  },
  navLinks: {
    flexDirection: "row",
    gap: 20,
  },
  navLink: {
    fontSize: 14,
    fontWeight: "700",
    color: BRAND,
    ...WEB_FONT,
  },
  contentWrap: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    paddingTop: 24,
    paddingBottom: 80,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  crumbLink: {
    fontSize: 13,
    color: BRAND,
    fontWeight: "600",
    ...WEB_FONT,
  },
  crumbSep: {
    fontSize: 13,
    color: "#94A3B8",
  },
  crumbCurrent: {
    fontSize: 13,
    color: SLATE_500,
    fontWeight: "600",
    ...WEB_FONT,
  },
  heroImgWrap: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#CBD5E1",
    position: "relative",
  },
  heroImg: {
    width: "100%",
    height: "100%",
  },
  heroImgGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  tagBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: BRAND,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    ...WEB_FONT,
  },
  ratingBadge: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ratingText: {
    color: SLATE_900,
    fontSize: 13,
    fontWeight: "800",
    ...WEB_FONT,
  },
  infoRow: {
    marginTop: 36,
    gap: 36,
  },
  placeTitle: {
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.8,
    ...WEB_FONT,
  },
  placeLoc: {
    fontSize: 15,
    color: SLATE_500,
    marginTop: 6,
    fontWeight: "600",
    ...WEB_FONT,
  },
  descHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: SLATE_900,
    marginTop: 28,
    marginBottom: 12,
    ...WEB_FONT,
  },
  descText: {
    fontSize: 16,
    lineHeight: 27,
    color: SLATE_700,
    ...WEB_FONT,
  },
  highlightsList: {
    gap: 12,
  },
  hlItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  hlDot: {
    fontSize: 14,
    color: BRAND,
    fontWeight: "900",
    marginTop: 2,
  },
  hlText: {
    fontSize: 15,
    color: SLATE_700,
    lineHeight: 22,
    flex: 1,
    ...WEB_FONT,
  },
  factsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignSelf: "flex-start",
    ...(Platform.OS === "web" ? { boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)" } : {}),
  },
  factsTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: SLATE_900,
    ...WEB_FONT,
  },
  factDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 18,
  },
  factItem: {
    marginBottom: 16,
  },
  factLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: SLATE_500,
    marginBottom: 4,
    ...WEB_FONT,
  },
  factVal: {
    fontSize: 14,
    fontWeight: "700",
    color: SLATE_900,
    ...WEB_FONT,
  },
  actionBtn: {
    marginTop: 12,
    backgroundColor: BRAND,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    ...WEB_FONT,
  },
  footer: {
    paddingVertical: 36,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: SLATE_500,
    ...WEB_FONT,
  },
});
