import { router } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import {
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

const places = [
  {
    id: "nalgonda-fort",
    title: "Nalgonda Fort",
    location: "Nalgonda City, Telangana",
    description:
      "Iconic historic fortress perched atop the massive monolithic hill overlooking Nalgonda.",
  },
  {
    id: "nagarjuna-sagar",
    title: "Nagarjuna Sagar Dam",
    location: "Nalgonda District",
    description:
      "One of the world's largest masonry dams, built across the Krishna River with panoramic reservoir views.",
  },
  {
    id: "deverakonda-fort",
    title: "Deverakonda Fort",
    location: "Deverakonda, Nalgonda",
    description:
      "A historic hilltop fortress with panoramic views of the Deccan plateau and ancient stone bastions.",
  },
  {
    id: "chaya-someshwara",
    title: "Chaya Someshwara Temple",
    location: "Panagal, Nalgonda",
    description:
      "Ancient Kakatiya-era temple renowned for intricate stone carvings and mysterious permanent shadow.",
  },
];

export default function PlacesScreen() {
  const { width } = useWindowDimensions();

  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1050;

  const contentWidth = isMobile ? "92%" : isTablet ? "90%" : "86%";

  return (
    <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={[styles.headerInner, { width: contentWidth as any }]}>
          <Pressable onPress={() => router.push("/")}>
            <Text style={styles.logo}>
              Nalgonda<Text style={styles.logoAccent}>One</Text>
            </Text>
          </Pressable>

          <View style={styles.nav}>
            <Pressable onPress={() => router.push("/")}>
              <Text style={styles.navItem}>Home</Text>
            </Pressable>

            <Text style={styles.navActive}>Places</Text>

            <Pressable onPress={() => router.push("/events")}>
              <Text style={styles.navItem}>Events</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* HERO */}

      <View style={styles.hero}>
        <Text style={styles.kicker}>DISCOVER NALGONDA</Text>

        <Text style={styles.title}>Places to Explore</Text>

        <Text style={styles.subtitle}>
          Discover historical sites, temples, nature spots and iconic
          destinations around Nalgonda.
        </Text>
      </View>

      {/* PLACES */}

      <View style={[styles.content, { width: contentWidth as any }]}>
        <View style={styles.grid}>
          {places.map((place) => (
            <Pressable
              key={place.id}
              onPress={() => router.push(`/places/${place.id}`)}
              style={({ pressed }) => [
                styles.card,
                {
                  width: isMobile ? "100%" : isTablet ? "47.5%" : "23.5%",
                  transform: [
                    {
                      scale: pressed ? 0.98 : 1,
                    },
                  ],
                },
              ]}
            >
              <ExpoImage
                source={localImages[place.id]}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{place.title}</Text>

                <Text style={styles.location}>📍 {place.location}</Text>

                <Text style={styles.description}>{place.description}</Text>

                <Text style={styles.explore}>View Details →</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* FOOTER */}

      <View style={styles.footer}>
        <Text style={styles.footerLogo}>
          Nalgonda<Text style={styles.logoAccent}>One</Text>
        </Text>

        <Text style={styles.footerText}>
          One place for everything Nalgonda.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    height: 76,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  headerInner: {
    height: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    fontSize: 25,
    fontWeight: "900",
    color: "#0F172A",
  },

  logoAccent: {
    color: "#2563EB",
  },

  nav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
  },

  navItem: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },

  navActive: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "800",
  },

  hero: {
    backgroundColor: "#EAF3FF",
    minHeight: 340,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  kicker: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#2563EB",
  },

  title: {
    marginTop: 12,
    fontSize: 52,
    lineHeight: 58,
    fontWeight: "900",
    textAlign: "center",
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 18,
    maxWidth: 650,
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center",
    color: "#64748B",
  },

  content: {
    alignSelf: "center",
    paddingVertical: 70,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  image: {
    width: "100%",
    height: 240,
  },

  cardContent: {
    padding: 22,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0F172A",
  },

  location: {
    marginTop: 8,
    fontSize: 13,
    color: "#64748B",
  },

  description: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
  },

  explore: {
    marginTop: 20,
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "900",
  },

  footer: {
    paddingVertical: 55,
    alignItems: "center",
    backgroundColor: "#020617",
  },

  footerLogo: {
    fontSize: 25,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  footerText: {
    marginTop: 8,
    color: "#64748B",
  },
});
