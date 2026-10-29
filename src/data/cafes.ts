export interface CafeMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number | null; // null when price not verified
  priceVerified: boolean; // true = real verified price, false = unverified or demo
  isDemo?: boolean; // true for demo‑only sample items
  sourceUrl?: string; // URL of the third‑party listing where price was found
  checkedOn?: string; // ISO date when the price was verified
  sourceType?: "third_party_listing"; // constant indicating source type
  category?: string; // Category for grouping/filtering
  isVeg?: boolean; // Veg/Non-Veg indicator
}

export interface Cafe {
  id: string;
  name: string;
  address: string;
  cuisine?: string;
  menu: CafeMenuItem[];
}

/* ─── Explicit Image Mappings Tied to Stable IDs ───────────────── */
export const FOOD_ITEM_IMAGES: Record<string, any> = {
  "alameen-1": require("../../assets/images/food/badam-chai.jpg"),
  "alameen-2": require("../../assets/images/food/egg-masala.jpg"),
  "alameen-3": require("../../assets/images/food/rumali-roti.jpg"),
  "yumloop-3": require("../../assets/images/food/cafe-yum-loop.jpg"),
  "yumloop-1": require("../../assets/images/food/veg-steamed-momos.jpg"),
  "yumloop-2": require("../../assets/images/food/chicken-fried-momos.jpg"),
  "yumloop-4": require("../../assets/images/food/chicken-loaded-fries.jpg"),
  "yumloop-6": require("../../assets/images/food/veg-puff.jpg"),
  "yumloop-7": require("../../assets/images/food/brown-sugar-bubble-tea.jpg"),
  "yumloop-5": require("../../assets/images/food/demo-sandwich.jpg"),
  "vejooz-1": require("../../assets/images/food/chicken-nuggets.jpg"),
  "vejooz-2": require("../../assets/images/food/chicken-wings.jpg"),
  "vejooz-3": require("../../assets/images/food/brownie-ice-cream.jpg"),
  "vejooz-4": require("../../assets/images/food/brownie-bowl.jpg"),
  "d1-m1": require("../../assets/images/food/demo-sandwich.jpg"),
  "d1-m2": require("../../assets/images/food/demo-juice.jpg"),
};

export const CAFE_COVER_IMAGES: Record<string, any> = {
  "alameen-cafe": require("../../assets/images/food/cafe-alameen.jpg"),
  "yum-loop": require("../../assets/images/food/cafe-yum-loop.jpg"),
  "vejooz-cafe": require("../../assets/images/food/cafe-vejooz.jpg"),
};

export interface FoodPlaceholderConfig {
  icon: string;
  label: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  textColor: string;
}

export function getFoodPlaceholder(item: {
  name: string;
  category?: string;
  isVeg?: boolean;
}): FoodPlaceholderConfig {
  const nameLower = (item.name || "").toLowerCase();
  const categoryLower = (item.category || "").toLowerCase();

  // Momos / Dumplings
  if (categoryLower.includes("momo") || nameLower.includes("momo") || nameLower.includes("dumpling")) {
    const isFried = nameLower.includes("fried") || nameLower.includes("crispy");
    return {
      icon: "🥟",
      label: isFried ? "FRIED MOMOS" : "VEG MOMOS",
      bgColor: item.isVeg ? "#F0FDF4" : "#FFF7ED",
      borderColor: item.isVeg ? "#BBF7D0" : "#FFEDD5",
      badgeBg: item.isVeg ? "#DCFCE7" : "#FED7AA",
      textColor: item.isVeg ? "#15803D" : "#9A3412",
    };
  }

  // Loaded Fries / French Fries
  if (nameLower.includes("fries") || nameLower.includes("fry") || nameLower.includes("chips")) {
    return {
      icon: "🍟",
      label: "LOADED FRIES",
      bgColor: "#FEFCE8",
      borderColor: "#FEF08A",
      badgeBg: "#FDE047",
      textColor: "#854D0E",
    };
  }

  // Puff / Pastry / Bakery
  if (
    categoryLower.includes("bakery") ||
    nameLower.includes("puff") ||
    nameLower.includes("pastry") ||
    nameLower.includes("patty")
  ) {
    return {
      icon: "🥐",
      label: nameLower.includes("puff") ? "VEG PUFF" : "BAKERY",
      bgColor: "#FFFBEB",
      borderColor: "#FDE68A",
      badgeBg: "#FCD34D",
      textColor: "#92400E",
    };
  }

  // Bubble Tea / Boba / Beverages
  if (
    nameLower.includes("bubble tea") ||
    nameLower.includes("boba") ||
    nameLower.includes("tapioca")
  ) {
    return {
      icon: "🧋",
      label: "BUBBLE TEA",
      bgColor: "#FAF5FF",
      borderColor: "#F3E8FF",
      badgeBg: "#E9D5FF",
      textColor: "#6B21A8",
    };
  }

  if (
    categoryLower.includes("beverage") ||
    nameLower.includes("chai") ||
    nameLower.includes("tea") ||
    nameLower.includes("coffee")
  ) {
    const isCold =
      nameLower.includes("juice") ||
      nameLower.includes("shake") ||
      nameLower.includes("smoothie") ||
      nameLower.includes("cold");
    return {
      icon: isCold ? "🥤" : "☕",
      label: isCold ? "BEVERAGE" : "CHAI & TEA",
      bgColor: "#FFF7ED",
      borderColor: "#FFEDD5",
      badgeBg: "#FED7AA",
      textColor: "#C2410C",
    };
  }

  // Sandwiches / Burgers
  if (
    categoryLower.includes("sandwich") ||
    nameLower.includes("sandwich") ||
    nameLower.includes("toast") ||
    nameLower.includes("burger")
  ) {
    return {
      icon: "🥪",
      label: "SANDWICH",
      bgColor: "#F0FDF4",
      borderColor: "#DCFCE7",
      badgeBg: "#BBF7D0",
      textColor: "#15803D",
    };
  }

  // Bowls / Rice
  if (
    categoryLower.includes("bowl") ||
    nameLower.includes("rice") ||
    nameLower.includes("biryani")
  ) {
    return {
      icon: "🍲",
      label: "RICE BOWL",
      bgColor: "#FFF7ED",
      borderColor: "#FED7AA",
      badgeBg: "#FFEDD5",
      textColor: "#C2410C",
    };
  }

  // Snacks
  if (
    categoryLower.includes("snack") ||
    nameLower.includes("nugget") ||
    nameLower.includes("wing") ||
    nameLower.includes("lollipop")
  ) {
    return {
      icon: "🍗",
      label: "SNACK",
      bgColor: "#FFF7ED",
      borderColor: "#FFEDD5",
      badgeBg: "#FED7AA",
      textColor: "#C2410C",
    };
  }

  // Desserts
  if (
    categoryLower.includes("dessert") ||
    nameLower.includes("brownie") ||
    nameLower.includes("ice cream") ||
    nameLower.includes("cake")
  ) {
    return {
      icon: "🍨",
      label: "DESSERT",
      bgColor: "#FFF1F2",
      borderColor: "#FECDD3",
      badgeBg: "#FFE4E6",
      textColor: "#BE123C",
    };
  }

  // Breads / Roti
  if (
    categoryLower.includes("bread") ||
    nameLower.includes("roti") ||
    nameLower.includes("naan")
  ) {
    return {
      icon: "🫓",
      label: "ROTI & BREAD",
      bgColor: "#FEF3C7",
      borderColor: "#FDE68A",
      badgeBg: "#FDE047",
      textColor: "#B45309",
    };
  }

  // Main Course
  if (
    categoryLower.includes("main") ||
    nameLower.includes("curry") ||
    nameLower.includes("masala")
  ) {
    return {
      icon: "🍛",
      label: "MAIN COURSE",
      bgColor: "#FFF7ED",
      borderColor: "#FED7AA",
      badgeBg: "#FFEDD5",
      textColor: "#C2410C",
    };
  }

  // Default clean food placeholder
  return {
    icon: "🍽️",
    label: (item.category || "SPECIAL DISH").toUpperCase(),
    bgColor: "#FFF4EE",
    borderColor: "#FFE0D1",
    badgeBg: "#FFEDD5",
    textColor: "#FF5200",
  };
}

export function getMenuItemImage(itemId?: string | null): any {
  if (!itemId || typeof itemId !== "string") return null;
  try {
    return FOOD_ITEM_IMAGES[itemId] ?? null;
  } catch {
    return null;
  }
}

export function getCafeCoverImage(cafeId?: string | null): any {
  if (!cafeId || typeof cafeId !== "string") return null;
  try {
    return CAFE_COVER_IMAGES[cafeId] ?? null;
  } catch {
    return null;
  }
}

export const CAFES: Cafe[] = [
  // Alameen Cafe (Swiggy public listing)
  {
    id: "alameen-cafe",
    name: "Alameen Cafe",
    address: "Chandanapalli, Nalgonda",
    cuisine: "Tea, Snacks & Mughlai",
    menu: [
      {
        id: "alameen-1",
        name: "Badam Chai",
        description: "Rich and aromatic Indian tea brewed with milk, crushed almonds and exotic spices.",
        price: 35,
        priceVerified: true,
        sourceUrl: "https://www.swiggy.com/city/nalgonda/alameen-cafe-chandanapalli-rest1327588",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Beverages",
        isVeg: true,
      },
      {
        id: "alameen-2",
        name: "Egg Masala",
        description: "Fresh boiled eggs simmered in a spicy, flavorful onion-tomato gravy with Andhra spices.",
        price: 85,
        priceVerified: true,
        sourceUrl: "https://www.swiggy.com/city/nalgonda/alameen-cafe-chandanapalli-rest1327588",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Main Course",
        isVeg: false,
      },
      {
        id: "alameen-3",
        name: "Rumali Roti (1 Pc)",
        description: "Soft, feather-light handkerchief flatbread prepared fresh on an inverted tawa.",
        price: 19,
        priceVerified: true,
        sourceUrl: "https://www.swiggy.com/city/nalgonda/alameen-cafe-chandanapalli-rest1327588",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Breads",
        isVeg: true,
      },
    ],
  },
  // Yum Loop (Zomato & Swiggy verified public listings)
  {
    id: "yum-loop",
    name: "Yum Loop",
    address: "New VT Colony, Hyderabad Road, Near Vivekananda Statue, Nalgonda",
    cuisine: "Continental, Fast Food & Bakery",
    menu: [
      {
        id: "yumloop-1",
        name: "Veg Steamed Momos (6 Pieces)",
        description: "Fresh steamed dumplings filled with seasoned vegetables, served with house dipping sauce.",
        price: 173,
        priceVerified: true,
        sourceUrl: "https://www.zomato.com/nalgonda/yum-loop-nalgonda-locality",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Momos",
        isVeg: true,
      },
      {
        id: "yumloop-2",
        name: "Chicken Fried Momos (6 Pieces)",
        description: "Crispy fried dumplings stuffed with spiced minced chicken, served with chili dip.",
        price: 184,
        priceVerified: true,
        sourceUrl: "https://www.zomato.com/nalgonda/yum-loop-nalgonda-locality",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Momos",
        isVeg: false,
      },
      {
        id: "yumloop-3",
        name: "Peri Peri Chicken with Rice Bowl",
        description: "Grilled peri-peri chicken breast served over seasoned basmati rice with crisp garden salad.",
        price: 403,
        priceVerified: true,
        sourceUrl: "https://www.zomato.com/nalgonda/yum-loop-nalgonda-locality",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Bowls",
        isVeg: false,
      },
      {
        id: "yumloop-4",
        name: "Chicken Loaded Fries",
        description: "Crispy golden fries topped with seasoned chicken, melted cheese, and creamy sauces.",
        price: 244,
        priceVerified: true,
        sourceUrl: "https://www.zomato.com/nalgonda/yum-loop-nalgonda-locality",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Snacks",
        isVeg: false,
      },
      {
        id: "yumloop-5",
        name: "Cheese Corn Veg Sandwich",
        description: "Grilled sandwich loaded with sweet corn, melted cheese, and aromatic Italian herbs.",
        price: 173,
        priceVerified: true,
        sourceUrl: "https://www.zomato.com/nalgonda/yum-loop-nalgonda-locality",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Sandwiches",
        isVeg: true,
      },
      {
        id: "yumloop-6",
        name: "Veg Puff",
        description: "Crispy flaky puff pastry filled with spiced seasonal mixed vegetables.",
        price: 29,
        priceVerified: true,
        sourceUrl: "https://www.zomato.com/nalgonda/yum-loop-nalgonda-locality",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Bakery",
        isVeg: true,
      },
      {
        id: "yumloop-7",
        name: "Brown Sugar Bubble Tea",
        description: "Signature chilled milk tea brewed with caramelized brown sugar syrup and chewy tapioca pearls.",
        price: null,
        priceVerified: false,
        sourceUrl: "https://www.swiggy.com/city/nalgonda/yum-loop-chandanapalli-rest1394695",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Beverages",
        isVeg: true,
      },
    ],
  },
  // Vejooz Cafe (Swiggy public listing)
  {
    id: "vejooz-cafe",
    name: "Cafe Vejooz",
    address: "Chandanapalli, Nalgonda",
    cuisine: "Quick Bites & Desserts",
    menu: [
      {
        id: "vejooz-1",
        name: "Chicken Nuggets (7 Pieces)",
        description: "Golden crispy fried chicken bites served piping hot with signature dip.",
        price: 149,
        priceVerified: true,
        sourceUrl: "https://www.swiggy.com/city/nalgonda/vejooz-cafe-chandanapalli-rest1165031",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Snacks",
        isVeg: false,
      },
      {
        id: "vejooz-2",
        name: "Chicken Wings (5 Pieces)",
        description: "Tender and crispy chicken wings tossed in zesty savory glaze.",
        price: 199,
        priceVerified: true,
        sourceUrl: "https://www.swiggy.com/city/nalgonda/vejooz-cafe-chandanapalli-rest1165031",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Snacks",
        isVeg: false,
      },
      {
        id: "vejooz-3",
        name: "Brownie with Vanilla Ice Cream",
        description: "Warm fudgy chocolate brownie topped with a scoop of cold vanilla ice cream.",
        price: 149,
        priceVerified: true,
        sourceUrl: "https://www.swiggy.com/city/nalgonda/vejooz-cafe-chandanapalli-rest1165031",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Desserts",
        isVeg: true,
      },
      {
        id: "vejooz-4",
        name: "Brownie Chocolate Bowl",
        description: "Decadent dessert bowl filled with rich brownie chunks, chocolate fudge, and nuts.",
        price: 149,
        priceVerified: true,
        sourceUrl: "https://www.swiggy.com/city/nalgonda/vejooz-cafe-chandanapalli-rest1165031",
        checkedOn: "2026-10-25",
        sourceType: "third_party_listing",
        category: "Desserts",
        isVeg: true,
      },
    ],
  },
];
