import { router } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import { useRef, useState } from "react";
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
import { useAuth } from "@/context/AuthContext";

/* ================================================================ */
/* LOCAL IMAGE ASSETS (OPTIMIZED WEBP/JPEG)                          */
/* ================================================================ */

const localImages: Record<string, any> = {
  "nalgonda-fort": require("@/assets/images/nalgonda-fort.jpg"),
  "nagarjuna-sagar": require("@/assets/images/nagarjuna-sagar.jpg"),
  "deverakonda-fort": require("@/assets/images/deverakonda-fort.jpg"),
  "chaya-someshwara": require("@/assets/images/chaya-someshwara.jpg"),
};

/* ================================================================ */
/* DATA                                                              */
/* ================================================================ */

const navLinks = [
  { label: "Home", route: "/", active: true },
  { label: "Explore", route: "/explore", active: false },
  { label: "Categories", scrollTo: "categories", active: false },
  { label: "Events", route: "/events", active: false },
  { label: "Blogs", scrollTo: "footer", active: false },
  { label: "About", scrollTo: "footer", active: false },
  { label: "Search", scrollTo: "hero-search", active: false },
];

const categories = [
  { icon: "🏥", title: "Healthcare", route: "/healthcare", bg: "#F0F9FF", accent: "#0EA5E9" },
  { icon: "🔧", title: "Services", route: "/services", bg: "#F5F3FF", accent: "#8B5CF6" },
  { icon: "🍴", title: "Food & Cafes", route: "/food", bg: "#FFF7ED", accent: "#FB923C" },
  { icon: "🏨", title: "Hotels & Stays", route: "/hotels", bg: "#EFF6FF", accent: "#3B82F6" },
  { icon: "📍", title: "Places", route: "/places", bg: "#ECFDF5", accent: "#10B981" },
  { icon: "🛍️", title: "Shopping", route: "/shopping", bg: "#FDF2F8", accent: "#EC4899" },
  { icon: "🎉", title: "Events", route: "/events", bg: "#FEF9C3", accent: "#EAB308" },
  { icon: "✨", title: "More", route: "/explore", bg: "#F1F5F9", accent: "#64748B" },
];

const places = [
  {
    id: "nalgonda-fort",
    title: "Nalgonda Fort",
    location: "Nalgonda City, Telangana",
    description: "Iconic historic fortress perched atop the massive monolithic hill overlooking Nalgonda.",
    rating: "4.8",
  },
  {
    id: "nagarjuna-sagar",
    title: "Nagarjuna Sagar Dam",
    location: "Nalgonda District",
    description: "One of the world's largest masonry dams, built across the Krishna River.",
    rating: "4.7",
  },
  {
    id: "deverakonda-fort",
    title: "Deverakonda Fort",
    location: "Deverakonda, Nalgonda",
    description: "A historic hilltop fortress with panoramic views of the Deccan plateau.",
    rating: "4.5",
  },
  {
    id: "chaya-someshwara",
    title: "Chaya Someshwara Temple",
    location: "Panagal, Nalgonda",
    description: "Ancient Kakatiya-era temple renowned for intricate stone carvings and perpetual shadow.",
    rating: "4.6",
  },
];

const experiences = [
  { icon: "🌿", title: "Nature & Outdoors", description: "Lakes, hills, and serene landscapes" },
  { icon: "🛕", title: "Temples & Spiritual", description: "Ancient temples and sacred sites" },
  { icon: "🍛", title: "Food & Cafes", description: "Local cuisine and hidden food gems" },
  { icon: "🏕️", title: "Weekend Getaways", description: "Perfect spots for a short escape" },
  { icon: "🛒", title: "Local Markets", description: "Vibrant bazaars and fresh produce" },
  { icon: "💎", title: "Hidden Gems", description: "Off-the-beaten-path discoveries" },
];

const events = [
  {
    icon: "🎭",
    title: "Nalgonda Cultural Fest",
    date: "Oct 15–17, 2026",
    location: "City Center, Nalgonda",
    tag: "Festival",
    tagBg: "#DBEAFE",
    tagColor: "#2563EB",
  },
  {
    icon: "🏃",
    title: "Nalgonda Marathon 2026",
    date: "Nov 5, 2026",
    location: "Starting Point: Collectorate",
    tag: "Sports",
    tagBg: "#D1FAE5",
    tagColor: "#059669",
  },
  {
    icon: "🍳",
    title: "Street Food Festival",
    date: "Oct 28–30, 2026",
    location: "Gandhi Chowk, Nalgonda",
    tag: "Food",
    tagBg: "#FEF3C7",
    tagColor: "#D97706",
  },
  {
    icon: "🎵",
    title: "Telangana Music Night",
    date: "Nov 12, 2026",
    location: "Open Grounds, Nalgonda",
    tag: "Music",
    tagBg: "#F3E8FF",
    tagColor: "#7C3AED",
  },
];

const cityUpdates = [
  {
    icon: "🏗️",
    title: "New Flyover Construction Begins",
    summary: "Work begins on the Nalgonda-Hyderabad bypass flyover to ease traffic congestion.",
    time: "2 hours ago",
  },
  {
    icon: "🌳",
    title: "Green Belt Expansion Project",
    summary: "City administration plants 10,000 saplings across Nalgonda urban parks.",
    time: "1 day ago",
  },
  {
    icon: "💧",
    title: "24/7 Water Supply Initiative",
    summary: "Municipal authorities announce phased rollout of round-the-clock water supply.",
    time: "3 days ago",
  },
];

const footerLinks = {
  explore: ["Places", "Food & Cafes", "Hotels", "Shopping", "Healthcare", "Events"],
  company: ["About Us", "Blog", "Careers", "Contact", "Privacy Policy"],
  connect: ["Instagram", "Twitter", "Facebook", "YouTube"],
};

/* ================================================================ */
/* COMPONENT                                                         */
/* ================================================================ */

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const searchInputRef = useRef<TextInput>(null);
  const { user, isAuthenticated, logout } = useAuth();

  const [searchText, setSearchText] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const userFirstName = user?.name ? user.name.trim().split(" ")[0] : "User";
  const userInitials = user?.name
    ? user.name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1050;

  const contentMaxWidth = 1200;

  /* ---- scroll-to helpers ---- */
  const sectionOffsets = useRef<Record<string, number>>({});

  const scrollToSection = (key: string) => {
    if (key === "hero-search") {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      setTimeout(() => searchInputRef.current?.focus(), 250);
      return;
    }
    const y = sectionOffsets.current[key];
    if (y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(y - 20, 0), animated: true });
    }
  };

  const recordOffset = (key: string, y: number) => {
    sectionOffsets.current[key] = y;
  };

  /* ---- search handler ---- */
  const handleSearch = () => {
    const q = searchText.trim().toLowerCase();
    if (!q) { scrollToSection("places"); return; }
    if (/food|restaurant|cafe|biryani|eat/.test(q)) { router.push("/food"); return; }
    if (/hotel|stay|resort|room/.test(q)) { router.push("/hotels"); return; }
    if (/event|festival|show|program/.test(q)) { router.push("/events"); return; }
    if (/shop|market|mall|store/.test(q)) { router.push("/shopping"); return; }
    if (/health|hospital|doctor|clinic|medical/.test(q)) { router.push("/healthcare"); return; }
    if (/service|repair|plumb|electric/.test(q)) { router.push("/services"); return; }
    router.push("/places");
  };

  /* ---- nav handler ---- */
  const handleNavPress = (item: (typeof navLinks)[0]) => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    if (item.route) {
      router.push(item.route as any);
    } else if (item.scrollTo) {
      scrollToSection(item.scrollTo);
    }
  };

  /* ---- responsive helpers ---- */
  const contentPad = isMobile ? 20 : isTablet ? 36 : 0;

  const ContentWrapper = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <View
      style={[
        {
          width: "100%",
          maxWidth: contentMaxWidth,
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
    <ScrollView ref={scrollRef} style={s.page} showsVerticalScrollIndicator={false}>

      {/* ============================================================ */}
      {/* NAVBAR                                                       */}
      {/* ============================================================ */}

      <View style={s.navbar}>
        {profileDropdownOpen && (
          <Pressable
            style={s.dropdownBackdrop}
            onPress={() => setProfileDropdownOpen(false)}
            accessibilityRole="none"
            accessibilityLabel="Close profile menu"
          />
        )}

        <View style={s.navbarInner}>
          <Pressable
            onPress={() => {
              setProfileDropdownOpen(false);
              router.push("/");
            }}
          >
            <Text style={s.logo}>
              Nalgonda<Text style={s.logoAccent}>One</Text>
            </Text>
          </Pressable>

          {!isMobile ? (
            <View style={s.navLinks}>
              {navLinks.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => handleNavPress(item)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={item.active ? s.navLinkActive : s.navLink}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => {
                  setProfileDropdownOpen(false);
                  router.push("/add-business" as any);
                }}
                style={({ pressed }) => [s.navCta, { opacity: pressed ? 0.85 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Add your business to NalgondaOne"
              >
                <Text style={s.navCtaText}>+ Add Business</Text>
              </Pressable>

              {isAuthenticated ? (
                <View style={s.profileContainer}>
                  <Pressable
                    onPress={() => setProfileDropdownOpen((prev) => !prev)}
                    style={({ pressed }) => [
                      s.profileTrigger,
                      profileDropdownOpen && s.profileTriggerActive,
                      { opacity: pressed ? 0.85 : 1 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Profile menu for ${userFirstName}`}
                    accessibilityState={{ expanded: profileDropdownOpen }}
                  >
                    <View style={s.avatarCircle}>
                      <Text style={s.avatarInitials}>{userInitials}</Text>
                    </View>
                    <Text style={s.profileFirstName}>{userFirstName}</Text>
                    <Text style={s.chevronIcon}>{profileDropdownOpen ? "▴" : "▾"}</Text>
                  </Pressable>

                  {profileDropdownOpen && (
                    <View style={s.dropdownMenu}>
                      <View style={s.dropdownUserInfo}>
                        <Text style={s.dropdownUserName} numberOfLines={1}>
                          {user?.name || "User"}
                        </Text>
                        <Text style={s.dropdownUserEmail} numberOfLines={1}>
                          {user?.email || ""}
                        </Text>
                      </View>

                      <View style={s.dropdownDivider} />

                      <Pressable
                        onPress={() => {
                          setProfileDropdownOpen(false);
                          router.push("/profile" as any);
                        }}
                        style={({ pressed }) => [
                          s.dropdownItem,
                          { backgroundColor: pressed ? SLATE_100 : "transparent" },
                        ]}
                        accessibilityRole="menuitem"
                        accessibilityLabel="My Profile"
                      >
                        <Text style={s.dropdownItemIcon}>👤</Text>
                        <Text style={s.dropdownItemText}>My Profile</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          setProfileDropdownOpen(false);
                          router.push("/profile" as any);
                        }}
                        style={({ pressed }) => [
                          s.dropdownItem,
                          { backgroundColor: pressed ? SLATE_100 : "transparent" },
                        ]}
                        accessibilityRole="menuitem"
                        accessibilityLabel="My Businesses"
                      >
                        <Text style={s.dropdownItemIcon}>🏢</Text>
                        <Text style={s.dropdownItemText}>My Businesses</Text>
                      </Pressable>

                      <View style={s.dropdownDivider} />

                      <Pressable
                        onPress={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        style={({ pressed }) => [
                          s.dropdownItem,
                          { backgroundColor: pressed ? "#FEE2E2" : "transparent" },
                        ]}
                        accessibilityRole="menuitem"
                        accessibilityLabel="Sign Out"
                      >
                        <Text style={s.dropdownItemIcon}>🚪</Text>
                        <Text style={[s.dropdownItemText, s.dropdownSignOutText]}>
                          Sign Out
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    setProfileDropdownOpen(false);
                    router.push("/auth/login" as any);
                  }}
                  style={({ pressed }) => [s.navAuthBtn, { opacity: pressed ? 0.85 : 1 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in"
                >
                  <Text style={s.navAuthBtnText}>Sign In</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable
              style={s.hamburger}
              onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Text style={s.hamburgerText}>{mobileMenuOpen ? "✕" : "☰"}</Text>
            </Pressable>
          )}
        </View>

        {/* Mobile menu */}
        {isMobile && mobileMenuOpen && (
          <View style={s.mobileMenu}>
            {navLinks.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => handleNavPress(item)}
                style={({ pressed }) => [s.mobileMenuItem, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={item.active ? s.mobileMenuActive : s.mobileMenuLink}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => {
                setMobileMenuOpen(false);
                router.push("/add-business" as any);
              }}
              style={[s.navCta, { alignSelf: "stretch", marginTop: 8 }]}
              accessibilityRole="button"
              accessibilityLabel="Add your business to NalgondaOne"
            >
              <Text style={[s.navCtaText, { textAlign: "center" }]}>+ Add Business</Text>
            </Pressable>

            {isAuthenticated ? (
              <View style={s.mobileProfileSection}>
                <View style={s.mobileUserCard}>
                  <View style={s.avatarCircle}>
                    <Text style={s.avatarInitials}>{userInitials}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.mobileUserName} numberOfLines={1}>
                      {user?.name || "User"}
                    </Text>
                    <Text style={s.mobileUserEmail} numberOfLines={1}>
                      {user?.email || ""}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => {
                    setMobileMenuOpen(false);
                    router.push("/profile" as any);
                  }}
                  style={({ pressed }) => [
                    s.mobileProfileItem,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={s.dropdownItemIcon}>👤</Text>
                  <Text style={s.mobileProfileItemText}>My Profile</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setMobileMenuOpen(false);
                    router.push("/profile" as any);
                  }}
                  style={({ pressed }) => [
                    s.mobileProfileItem,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={s.dropdownItemIcon}>🏢</Text>
                  <Text style={s.mobileProfileItemText}>My Businesses</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  style={({ pressed }) => [
                    s.mobileSignOutBtn,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={s.mobileSignOutBtnText}>Sign Out</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  setMobileMenuOpen(false);
                  router.push("/auth/login" as any);
                }}
                style={[s.navAuthBtn, { alignSelf: "stretch", marginTop: 12 }]}
              >
                <Text style={[s.navAuthBtnText, { textAlign: "center" }]}>Sign In</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* ============================================================ */}
      {/* HERO                                                         */}
      {/* ============================================================ */}

      <View style={s.hero}>
        {/* Decorative blobs */}
        <View style={s.heroBlob1} />
        <View style={s.heroBlob2} />
        <View style={s.heroBlob3} />

        <ContentWrapper style={{ zIndex: 2, alignItems: "center", paddingVertical: isMobile ? 60 : 90 }}>
          {/* Badge */}
          <View style={s.heroBadge}>
            <View style={s.heroBadgeDot} />
            <Text style={s.heroBadgeText}>DISCOVER NALGONDA</Text>
          </View>

          {/* Title */}
          <Text
            style={[
              s.heroTitle,
              { fontSize: isMobile ? 38 : isTablet ? 52 : 68, lineHeight: isMobile ? 44 : isTablet ? 60 : 76 },
            ]}
          >
            Everything Nalgonda
          </Text>
          <Text
            style={[
              s.heroTitleAccent,
              { fontSize: isMobile ? 38 : isTablet ? 52 : 68, lineHeight: isMobile ? 44 : isTablet ? 60 : 76 },
            ]}
          >
            In One Place.
          </Text>

          <Text style={s.heroSub}>
            Discover amazing places, local food, hotels, events, businesses and everything happening around Nalgonda — your city, all in one platform.
          </Text>

          {/* Search */}
          <View style={[s.searchBox, { width: isMobile ? "100%" : isTablet ? "85%" : 680 }]}>
            <Text style={s.searchIcon}>⌕</Text>
            <TextInput
              ref={searchInputRef}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              placeholder="Search places, food, hotels, services..."
              placeholderTextColor="#94A3B8"
              style={s.searchInput as any}
            />
            <Pressable
              style={({ pressed }) => [s.searchBtn, { opacity: pressed ? 0.85 : 1 }]}
              onPress={handleSearch}
            >
              <Text style={s.searchBtnText}>Search</Text>
            </Pressable>
          </View>

          {/* Quick tags */}
          <View style={s.quickTags}>
            <Text style={s.quickLabel}>Popular:</Text>
            {[
              { label: "Restaurants", route: "/food" },
              { label: "Hotels", route: "/hotels" },
              { label: "Places", scrollTo: "places" },
              { label: "Events", route: "/events" },
              { label: "Shopping", route: "/shopping" },
            ].map((t) => (
              <Pressable
                key={t.label}
                onPress={() =>
                  t.route ? router.push(t.route as any) : scrollToSection(t.scrollTo!)
                }
              >
                <Text style={s.quickTag}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Stats */}
          <View style={[s.statsRow, { flexDirection: isMobile ? "column" : "row" }]}>
            {[
              { num: "500+", label: "Local Businesses" },
              { num: "50+", label: "Categories" },
              { num: "10K+", label: "Happy Users" },
            ].map((stat) => (
              <View key={stat.label} style={s.statItem}>
                <Text style={s.statNum}>{stat.num}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </ContentWrapper>
      </View>

      {/* ============================================================ */}
      {/* EXPLORE CATEGORIES                                           */}
      {/* ============================================================ */}

      <View
        onLayout={(e) => recordOffset("categories", e.nativeEvent.layout.y)}
        style={s.sectionWrap}
      >
        <ContentWrapper>
          <Text style={s.kicker}>EXPLORE</Text>
          <Text style={s.sectionTitle}>Explore Nalgonda</Text>
          <Text style={s.sectionSub}>Everything you need, right around the city.</Text>
        </ContentWrapper>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: isMobile ? 20 : isTablet ? 36 : Math.max((width - 1200) / 2, 20),
            gap: 14,
            paddingVertical: 8,
            marginTop: 28,
          }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat.title}
              onPress={() => router.push(cat.route as any)}
              style={({ pressed }) => [
                s.catCard,
                {
                  backgroundColor: cat.bg,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  borderColor: cat.accent + "22",
                },
              ]}
            >
              {/* Decorative accent dot */}
              <View style={[s.catAccentDot, { backgroundColor: cat.accent + "18" }]} />
              <View style={[s.catIconWrap, { backgroundColor: "#FFFFFF", borderColor: cat.accent + "20" }]}>
                <Text style={s.catIcon}>{cat.icon}</Text>
              </View>
              <View style={s.catBottom}>
                <Text style={s.catTitle}>{cat.title}</Text>
                <View style={[s.catArrowCircle, { backgroundColor: cat.accent + "14" }]}>
                  <Text style={[s.catArrow, { color: cat.accent }]}>→</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ============================================================ */}
      {/* POPULAR IN NALGONDA                                          */}
      {/* ============================================================ */}

      <View
        style={s.popularBg}
        onLayout={(e) => recordOffset("places", e.nativeEvent.layout.y)}
      >
        <ContentWrapper>
          <View style={s.sectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.kicker}>MUST VISIT</Text>
              <Text style={s.sectionTitle}>Popular in Nalgonda</Text>
              <Text style={s.sectionSub}>Heritage, nature, and culture — places worth discovering.</Text>
            </View>
            <Pressable onPress={() => router.push("/places")}>
              <Text style={s.viewAll}>Explore all →</Text>
            </Pressable>
          </View>

          <View style={s.placeGrid}>
            {places.map((place, idx) => (
              <Pressable
                key={place.id}
                onPress={() => router.push(`/places/${place.id}`)}
                style={({ pressed }) => [
                  s.placeCard,
                  {
                    width: isMobile ? "100%" : isTablet ? "48%" : "23.5%",
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <View style={s.placeImgWrap}>
                  <ExpoImage
                    source={localImages[place.id]}
                    style={s.placeImg}
                    contentFit="cover"
                    priority={idx < 2 ? "high" : "normal"}
                    transition={200}
                  />
                  <View style={s.placeImgOverlay} />
                  <View style={s.placeBadge}>
                    <Text style={s.placeBadgeText}>0{idx + 1}</Text>
                  </View>
                  <View style={s.placeRating}>
                    <Text style={s.placeRatingText}>⭐ {place.rating}</Text>
                  </View>
                </View>
                <View style={s.placeInfo}>
                  <Text style={s.placeTitle}>{place.title}</Text>
                  <Text style={s.placeLocation}>📍 {place.location}</Text>
                  <Text style={s.placeDesc}>{place.description}</Text>
                  <Text style={s.placeExplore}>Explore place →</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ContentWrapper>
      </View>

      {/* ============================================================ */}
      {/* EXPERIENCE NALGONDA                                          */}
      {/* ============================================================ */}

      <View style={s.sectionWrap}>
        <ContentWrapper>
          <Text style={s.kicker}>DISCOVER • EXPERIENCE • EXPLORE</Text>
          <Text style={s.sectionTitle}>Experience Nalgonda</Text>
          <Text style={s.sectionSub}>Find experiences that make the city special.</Text>

          <View style={s.expGrid}>
            {experiences.map((exp) => (
              <Pressable
                key={exp.title}
                onPress={() => router.push("/explore")}
                style={({ pressed }) => [
                  s.expCard,
                  {
                    width: isMobile ? "100%" : isTablet ? "48%" : "31%",
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Text style={s.expIcon}>{exp.icon}</Text>
                <Text style={s.expTitle}>{exp.title}</Text>
                <Text style={s.expDesc}>{exp.description}</Text>
                <Text style={s.expArrow}>Discover →</Text>
              </Pressable>
            ))}
          </View>
        </ContentWrapper>
      </View>

      {/* ============================================================ */}
      {/* EVENTS & CITY UPDATES                                        */}
      {/* ============================================================ */}

      <View
        style={s.eventsBg}
        onLayout={(e) => recordOffset("events", e.nativeEvent.layout.y)}
      >
        <ContentWrapper>
          <Text style={s.kicker}>WHAT'S HAPPENING</Text>
          <Text style={s.sectionTitle}>Events & City Updates</Text>
          <Text style={s.sectionSub}>Stay in the loop with upcoming events and local news.</Text>

          {/* Events grid */}
          <Text style={s.subHeading}>🎉 Upcoming Events</Text>
          <View style={s.eventsGrid}>
            {events.map((ev) => (
              <Pressable
                key={ev.title}
                style={({ pressed }) => [
                  s.eventCard,
                  {
                    width: isMobile ? "100%" : isTablet ? "48%" : "23.5%",
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <View style={s.eventTop}>
                  <Text style={s.eventIcon}>{ev.icon}</Text>
                  <View style={[s.eventTag, { backgroundColor: ev.tagBg }]}>
                    <Text style={[s.eventTagText, { color: ev.tagColor }]}>{ev.tag}</Text>
                  </View>
                </View>
                <Text style={s.eventTitle}>{ev.title}</Text>
                <Text style={s.eventDate}>📅 {ev.date}</Text>
                <Text style={s.eventLocation}>📍 {ev.location}</Text>
              </Pressable>
            ))}
          </View>

          {/* City Updates */}
          <Text style={[s.subHeading, { marginTop: 50 }]}>📰 City Updates</Text>
          <View style={s.updatesGrid}>
            {cityUpdates.map((upd) => (
              <Pressable
                key={upd.title}
                style={({ pressed }) => [
                  s.updateCard,
                  {
                    width: isMobile ? "100%" : isTablet ? "48%" : "31.5%",
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View style={s.updateIconWrap}>
                  <Text style={s.updateIcon}>{upd.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.updateTitle}>{upd.title}</Text>
                  <Text style={s.updateSummary}>{upd.summary}</Text>
                  <Text style={s.updateTime}>{upd.time}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ContentWrapper>
      </View>

      {/* ============================================================ */}
      {/* SUPPORT LOCAL                                                */}
      {/* ============================================================ */}

      <View style={s.sectionWrap}>
        <ContentWrapper>
          <View style={s.supportCard}>
            <View style={s.supportGlow1} />
            <View style={s.supportGlow2} />
            <View style={{ zIndex: 2, maxWidth: 620 }}>
              <Text style={s.supportKicker}>FOR LOCAL BUSINESSES</Text>
              <Text style={s.supportTitle}>
                Grow your business{"\n"}with NalgondaOne.
              </Text>
              <Text style={s.supportDesc}>
                Get discovered by thousands of people looking for local businesses, services, and experiences in Nalgonda. List your business for free and reach your community.
              </Text>

              <View style={[s.supportStats, { flexDirection: isMobile ? "column" : "row" }]}>
                {[
                  { num: "10K+", label: "Monthly Visitors" },
                  { num: "500+", label: "Listed Businesses" },
                  { num: "Free", label: "Basic Listing" },
                ].map((item) => (
                  <View key={item.label} style={s.supportStatItem}>
                    <Text style={s.supportStatNum}>{item.num}</Text>
                    <Text style={s.supportStatLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>

              <Pressable style={({ pressed }) => [s.supportBtn, { opacity: pressed ? 0.9 : 1 }]}>
                <Text style={s.supportBtnText}>Add Your Business →</Text>
              </Pressable>
            </View>
          </View>
        </ContentWrapper>
      </View>

      {/* ============================================================ */}
      {/* FOOTER                                                       */}
      {/* ============================================================ */}

      <View
        style={s.footer}
        onLayout={(e) => recordOffset("footer", e.nativeEvent.layout.y)}
      >
        <ContentWrapper>
          <View style={[s.footerGrid, { flexDirection: isMobile ? "column" : "row" }]}>
            {/* Brand column */}
            <View style={[s.footerBrand, { marginBottom: isMobile ? 30 : 0 }]}>
              <Text style={s.footerLogo}>
                Nalgonda<Text style={s.logoAccent}>One</Text>
              </Text>
              <Text style={s.footerTagline}>
                Everything Nalgonda in One Place.{"\n"}
                Discover, explore, and support local.
              </Text>

              <View style={s.socialRow}>
                {["📷", "🐦", "📘", "🎬"].map((icon, i) => (
                  <View key={i} style={s.socialIcon}>
                    <Text style={{ fontSize: 18 }}>{icon}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Link columns */}
            <View style={[s.footerLinksWrap, { flexDirection: isMobile ? "column" : "row" }]}>
              <View style={s.footerCol}>
                <Text style={s.footerColTitle}>Explore</Text>
                {footerLinks.explore.map((link) => (
                  <Text key={link} style={s.footerLink}>{link}</Text>
                ))}
              </View>
              <View style={s.footerCol}>
                <Text style={s.footerColTitle}>Company</Text>
                {footerLinks.company.map((link) => (
                  <Text key={link} style={s.footerLink}>{link}</Text>
                ))}
              </View>
              <View style={s.footerCol}>
                <Text style={s.footerColTitle}>Connect</Text>
                {footerLinks.connect.map((link) => (
                  <Text key={link} style={s.footerLink}>{link}</Text>
                ))}
              </View>
            </View>
          </View>

          <View style={s.footerDivider} />

          <View style={[s.footerBottom, { flexDirection: isMobile ? "column" : "row" }]}>
            <Text style={s.copyright}>© 2026 NalgondaOne. Made with ❤️ for Nalgonda.</Text>
            <Text style={s.copyright}>Privacy Policy • Terms of Service</Text>
          </View>
        </ContentWrapper>
      </View>
    </ScrollView>
  );
}

/* ================================================================ */
/* STYLES                                                            */
/* ================================================================ */

const BRAND = "#2563EB";
const BRAND_DARK = "#1D4ED8";
const SLATE_900 = "#0F172A";
const SLATE_700 = "#334155";
const SLATE_500 = "#64748B";
const SLATE_200 = "#E2E8F0";
const SLATE_100 = "#F1F5F9";
const SLATE_50 = "#F8FAFC";

const WEB_FONT = Platform.select({
  web: { fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" },
  default: {},
});

const s = StyleSheet.create({
  /* ---- page ---- */
  page: {
    flex: 1,
    backgroundColor: SLATE_50,
  },

  /* ---- navbar ---- */
  navbar: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderBottomWidth: 1,
    borderBottomColor: "#E8EEF5",
    ...(Platform.OS === "web" ? { position: "sticky" as any, top: 0, zIndex: 100, backdropFilter: "blur(16px)" as any, WebkitBackdropFilter: "blur(16px)" as any } : {}),
  },
  navbarInner: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -0.8,
    ...WEB_FONT,
  },
  logoAccent: {
    color: BRAND,
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 28,
  },
  navLink: {
    fontSize: 14,
    fontWeight: "600",
    color: SLATE_500,
    ...WEB_FONT,
  },
  navLinkActive: {
    fontSize: 14,
    fontWeight: "800",
    color: BRAND,
    ...WEB_FONT,
  },
  navCta: {
    backgroundColor: SLATE_900,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },
  navCtaText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    ...WEB_FONT,
  },
  profileContainer: {
    position: "relative" as any,
    zIndex: 101,
  },
  profileTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...(Platform.OS === "web" ? { cursor: "pointer", transition: "all 0.15s ease" } : {}),
  },
  profileTriggerActive: {
    borderColor: BRAND,
    backgroundColor: "#F8FAFC",
  },
  avatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: BRAND,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    ...WEB_FONT,
  },
  profileFirstName: {
    fontSize: 13,
    fontWeight: "700",
    color: SLATE_900,
    ...WEB_FONT,
  },
  chevronIcon: {
    fontSize: 10,
    color: SLATE_500,
    fontWeight: "700",
  },
  dropdownBackdrop: {
    position: (Platform.OS === "web" ? "fixed" : "absolute") as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    backgroundColor: "transparent",
  },
  dropdownMenu: {
    position: "absolute" as any,
    top: 42,
    right: 0,
    width: 210,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 6,
    zIndex: 1000,
    ...(Platform.OS === "web"
      ? {
          boxShadow:
            "0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)",
        }
      : {
          elevation: 8,
        }),
  },
  dropdownUserInfo: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownUserName: {
    fontSize: 13,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  dropdownUserEmail: {
    fontSize: 11,
    color: SLATE_500,
    marginTop: 1,
    ...WEB_FONT,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
  },
  dropdownItemIcon: {
    fontSize: 14,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: SLATE_700,
    ...WEB_FONT,
  },
  dropdownSignOutText: {
    color: "#DC2626",
    fontWeight: "700",
  },
  navAuthBtn: {
    backgroundColor: SLATE_100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  navAuthBtnText: {
    color: SLATE_900,
    fontSize: 13,
    fontWeight: "700",
    ...WEB_FONT,
  },
  hamburger: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: SLATE_100,
    justifyContent: "center",
    alignItems: "center",
  },
  hamburgerText: {
    fontSize: 22,
    color: SLATE_900,
  },
  mobileMenu: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: SLATE_200,
  },
  mobileMenuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  mobileMenuLink: {
    fontSize: 16,
    fontWeight: "600",
    color: SLATE_700,
    ...WEB_FONT,
  },
  mobileProfileSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: SLATE_100,
    paddingTop: 12,
  },
  mobileUserCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SLATE_200,
    marginBottom: 8,
  },
  mobileUserName: {
    fontSize: 13,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  mobileUserEmail: {
    fontSize: 11,
    color: SLATE_500,
    marginTop: 1,
    ...WEB_FONT,
  },
  mobileProfileItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  mobileProfileItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: SLATE_700,
    ...WEB_FONT,
  },
  mobileSignOutBtn: {
    marginTop: 10,
    backgroundColor: "#FEE2E2",
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
  },
  mobileSignOutBtnText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "800",
    ...WEB_FONT,
  },
  mobileMenuActive: {
    fontSize: 16,
    fontWeight: "800",
    color: BRAND,
    ...WEB_FONT,
  },

  /* ---- hero ---- */
  hero: {
    backgroundColor: "#EBF4FF",
    overflow: "hidden",
    alignItems: "center",
  },
  heroBlob1: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: "#BFDBFE",
    opacity: 0.35,
    top: -200,
    left: -150,
  },
  heroBlob2: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: "#DDD6FE",
    opacity: 0.25,
    bottom: -350,
    right: -200,
  },
  heroBlob3: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#A7F3D0",
    opacity: 0.2,
    top: "30%",
    right: "5%",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 30,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#D8E7FF",
  },
  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BRAND,
    marginRight: 9,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: BRAND,
    ...WEB_FONT,
  },
  heroTitle: {
    fontWeight: "900",
    textAlign: "center",
    color: SLATE_900,
    letterSpacing: -2,
    ...WEB_FONT,
  },
  heroTitleAccent: {
    fontWeight: "900",
    textAlign: "center",
    color: BRAND,
    letterSpacing: -2,
    ...WEB_FONT,
  },
  heroSub: {
    marginTop: 22,
    maxWidth: 640,
    textAlign: "center",
    fontSize: 17,
    lineHeight: 28,
    color: SLATE_500,
    ...WEB_FONT,
  },

  /* search */
  searchBox: {
    height: 62,
    marginTop: 34,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DCE6F2",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 6,
    ...(Platform.OS === "web" ? { boxShadow: "0 12px 30px rgba(37, 99, 235, 0.08)" } : {}),
  },
  searchIcon: {
    fontSize: 26,
    color: SLATE_500,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: SLATE_900,
    outlineStyle: "none" as any,
    ...WEB_FONT,
  },
  searchBtn: {
    height: 48,
    paddingHorizontal: 24,
    backgroundColor: BRAND,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    ...WEB_FONT,
  },

  /* quick tags */
  quickTags: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    alignItems: "center",
  },
  quickLabel: {
    color: SLATE_500,
    fontSize: 13,
    ...WEB_FONT,
  },
  quickTag: {
    color: BRAND,
    fontSize: 13,
    fontWeight: "700",
    ...WEB_FONT,
  },

  /* stats row */
  statsRow: {
    marginTop: 40,
    gap: 30,
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statNum: {
    fontSize: 28,
    fontWeight: "900",
    color: SLATE_900,
    ...WEB_FONT,
  },
  statLabel: {
    fontSize: 13,
    color: SLATE_500,
    marginTop: 2,
    ...WEB_FONT,
  },

  /* ---- sections shared ---- */
  sectionWrap: {
    paddingTop: 80,
    paddingBottom: 80,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: BRAND,
    marginBottom: 8,
    ...WEB_FONT,
  },
  sectionTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: SLATE_900,
    letterSpacing: -1,
    ...WEB_FONT,
  },
  sectionSub: {
    marginTop: 6,
    fontSize: 16,
    color: SLATE_500,
    lineHeight: 24,
    ...WEB_FONT,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 32,
  },
  viewAll: {
    fontSize: 14,
    color: BRAND,
    fontWeight: "800",
    ...WEB_FONT,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "800",
    color: SLATE_900,
    marginBottom: 20,
    marginTop: 10,
    ...WEB_FONT,
  },

  /* ---- categories ---- */
  catCard: {
    width: 155,
    height: 170,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "rgba(148,163,184,0.12)",
    justifyContent: "space-between",
    overflow: "hidden",
    ...(Platform.OS === "web" ? { boxShadow: "0 4px 20px rgba(0,0,0,0.04)" } : {}),
  },
  catAccentDot: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    top: -30,
    right: -30,
  },
  catIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    ...(Platform.OS === "web" ? { boxShadow: "0 2px 8px rgba(0,0,0,0.04)" } : {}),
  },
  catIcon: {
    fontSize: 26,
  },
  catBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  catTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#1E293B",
    flex: 1,
    ...WEB_FONT,
  },
  catArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  catArrow: {
    fontSize: 16,
    fontWeight: "800",
  },

  /* ---- popular places ---- */
  popularBg: {
    backgroundColor: SLATE_100,
    paddingTop: 80,
    paddingBottom: 80,
  },
  placeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 20,
  },
  placeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: SLATE_200,
    ...(Platform.OS === "web" ? { boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)" } : {}),
  },
  placeImgWrap: {
    height: 220,
    backgroundColor: "#CFE1F5",
    overflow: "hidden",
  },
  placeImg: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  placeImgOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: SLATE_900,
    opacity: 0.1,
  },
  placeBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: BRAND,
    ...WEB_FONT,
  },
  placeRating: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  placeRatingText: {
    fontSize: 12,
    fontWeight: "700",
    color: SLATE_900,
    ...WEB_FONT,
  },
  placeInfo: {
    padding: 20,
  },
  placeTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: SLATE_900,
    ...WEB_FONT,
  },
  placeLocation: {
    marginTop: 6,
    fontSize: 13,
    color: SLATE_500,
    ...WEB_FONT,
  },
  placeDesc: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: SLATE_700,
    ...WEB_FONT,
  },
  placeExplore: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "800",
    color: BRAND,
    ...WEB_FONT,
  },

  /* ---- experiences ---- */
  expGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 32,
  },
  expCard: {
    minHeight: 200,
    borderRadius: 24,
    backgroundColor: SLATE_900,
    padding: 24,
    justifyContent: "space-between",
  },
  expIcon: {
    fontSize: 38,
  },
  expTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 16,
    ...WEB_FONT,
  },
  expDesc: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 6,
    lineHeight: 20,
    ...WEB_FONT,
  },
  expArrow: {
    fontSize: 13,
    fontWeight: "700",
    color: "#93C5FD",
    marginTop: 14,
    ...WEB_FONT,
  },

  /* ---- events ---- */
  eventsBg: {
    backgroundColor: "#F8FAFF",
    paddingTop: 80,
    paddingBottom: 80,
  },
  eventsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: SLATE_200,
    ...(Platform.OS === "web" ? { boxShadow: "0 3px 8px rgba(0, 0, 0, 0.03)" } : {}),
  },
  eventTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  eventIcon: {
    fontSize: 36,
  },
  eventTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventTagText: {
    fontSize: 11,
    fontWeight: "800",
    ...WEB_FONT,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  eventDate: {
    fontSize: 13,
    color: SLATE_500,
    marginTop: 8,
    ...WEB_FONT,
  },
  eventLocation: {
    fontSize: 13,
    color: SLATE_500,
    marginTop: 4,
    ...WEB_FONT,
  },

  /* city updates */
  updatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  updateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: SLATE_200,
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  updateIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  updateIcon: {
    fontSize: 22,
  },
  updateTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: SLATE_900,
    ...WEB_FONT,
  },
  updateSummary: {
    fontSize: 13,
    color: SLATE_500,
    lineHeight: 20,
    marginTop: 4,
    ...WEB_FONT,
  },
  updateTime: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 6,
    ...WEB_FONT,
  },

  /* ---- support local ---- */
  supportCard: {
    borderRadius: 32,
    backgroundColor: SLATE_900,
    padding: 50,
    overflow: "hidden",
  },
  supportGlow1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: BRAND,
    opacity: 0.08,
    top: -150,
    right: -100,
  },
  supportGlow2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#8B5CF6",
    opacity: 0.06,
    bottom: -100,
    left: -50,
  },
  supportKicker: {
    color: "#60A5FA",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    ...WEB_FONT,
  },
  supportTitle: {
    marginTop: 14,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    ...WEB_FONT,
  },
  supportDesc: {
    maxWidth: 560,
    marginTop: 16,
    color: "#94A3B8",
    fontSize: 16,
    lineHeight: 26,
    ...WEB_FONT,
  },
  supportStats: {
    marginTop: 30,
    gap: 24,
  },
  supportStatItem: {},
  supportStatNum: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    ...WEB_FONT,
  },
  supportStatLabel: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 2,
    ...WEB_FONT,
  },
  supportBtn: {
    alignSelf: "flex-start",
    marginTop: 30,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 26,
    paddingVertical: 15,
    borderRadius: 14,
  },
  supportBtnText: {
    color: SLATE_900,
    fontSize: 14,
    fontWeight: "900",
    ...WEB_FONT,
  },

  /* ---- footer ---- */
  footer: {
    backgroundColor: "#020617",
    paddingTop: 70,
    paddingBottom: 40,
  },
  footerGrid: {
    gap: 40,
  },
  footerBrand: {
    flex: 1,
    maxWidth: 340,
  },
  footerLogo: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    ...WEB_FONT,
  },
  footerTagline: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: SLATE_500,
    ...WEB_FONT,
  },
  socialRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  footerLinksWrap: {
    flex: 2,
    gap: 24,
  },
  footerCol: {
    flex: 1,
    minWidth: 120,
  },
  footerColTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 16,
    ...WEB_FONT,
  },
  footerLink: {
    fontSize: 14,
    color: SLATE_500,
    marginBottom: 10,
    ...WEB_FONT,
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#1E293B",
    marginVertical: 30,
  },
  footerBottom: {
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  copyright: {
    fontSize: 13,
    color: "#475569",
    ...WEB_FONT,
  },
});
