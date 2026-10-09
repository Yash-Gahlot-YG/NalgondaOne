/* ================================================================ */
/* SERVICES MODULE — DATA LAYER                                       */
/* ================================================================ */
/* Mock providers for development + live approved businesses from API  */
/* ================================================================ */

import { API_BASE_URL } from "@/config/api";
import type { BusinessDocument } from "@/services/businessApi";

/* ---------------------------------------------------------------- */
/* TYPES                                                              */
/* ---------------------------------------------------------------- */

export interface ServiceCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  bg: string;
  accent: string;
  providerCount: number;
}

export interface ServiceProvider {
  id: string;
  name: string;
  slug: string;
  category: string;          // matches ServiceCategory.slug
  categoryTitle: string;
  description: string;
  phone: string;             // MOCK — do not call
  whatsapp: string;          // MOCK — do not message
  address: string;
  locality?: string;
  city: string;              // matches LocationOption.name for filtering
  latitude: number;
  longitude: number;
  rating: number;            // MOCK rating
  reviewCount: number;       // MOCK review count
  distanceKm?: number;       // numeric distance in km (used for sorting)
  verified: boolean;         // MOCK verified status
  services: string[];
  openingHours: string;
  images: string[];           // image keys — resolved by image map
  photos: string[];           // additional gallery photo keys
  faqs: { question: string; answer: string }[];
  isMockData: boolean;       // always true for dev data
}

export interface LocationOption {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  isPopular?: boolean;
}

/* ---------------------------------------------------------------- */
/* LOCATIONS                                                          */
/* ---------------------------------------------------------------- */

export const nalgondaLocations: LocationOption[] = [
  { id: "loc-1", name: "Nalgonda Town",  area: "Center / Clock Tower",  latitude: 17.0583, longitude: 79.2671, isPopular: true },
  { id: "loc-2", name: "Miryalaguda",    area: "Nalgonda Dist.",        latitude: 16.8710, longitude: 79.5630, isPopular: true },
  { id: "loc-3", name: "Devarakonda",    area: "Nalgonda Dist.",        latitude: 16.6933, longitude: 78.9281, isPopular: true },
  { id: "loc-4", name: "Nakrekal",       area: "Nalgonda Dist.",        latitude: 17.1710, longitude: 79.4350, isPopular: true },
  { id: "loc-5", name: "Chityal",        area: "NH 65 Junction",        latitude: 17.2250, longitude: 79.2800, isPopular: false },
  { id: "loc-6", name: "Haliya",         area: "Nalgonda Dist.",        latitude: 17.0610, longitude: 79.2120, isPopular: false },
  { id: "loc-7", name: "Suryapet Road",  area: "Nalgonda Outer",        latitude: 17.1440, longitude: 79.6400, isPopular: false },
  { id: "loc-8", name: "Kodad Road",     area: "Nalgonda Dist.",        latitude: 16.9930, longitude: 79.9720, isPopular: false },
  { id: "loc-9", name: "Bhongir / Yadadri", area: "Nalgonda Region",   latitude: 17.5093, longitude: 78.8830, isPopular: false },
  { id: "loc-10", name: "Choutuppal",    area: "Highway Junction",      latitude: 17.2490, longitude: 78.8930, isPopular: false },
];

/* ---------------------------------------------------------------- */
/* POPULAR CATEGORIES (shown on Services Home)                        */
/* ---------------------------------------------------------------- */

export const popularCategories: ServiceCategory[] = [
  { id: "cat-1",  slug: "electricians",    title: "Electricians",        description: "Wiring, repairs, installations & electrical maintenance", icon: "⚡", bg: "#FEF9C3", accent: "#EAB308", providerCount: 24 },
  { id: "cat-2",  slug: "plumbers",        title: "Plumbers",            description: "Pipe repair, fittings, leak detection & drainage", icon: "🔧", bg: "#DBEAFE", accent: "#3B82F6", providerCount: 18 },
  { id: "cat-3",  slug: "carpenters",      title: "Carpenters",          description: "Custom furniture, repairs, woodwork & polishing", icon: "🪚", bg: "#FEF3C7", accent: "#F59E0B", providerCount: 12 },
  { id: "cat-4",  slug: "ac-repair",       title: "AC Repair",           description: "Installation, repair, gas refilling & AMC", icon: "❄️", bg: "#E0F2FE", accent: "#0EA5E9", providerCount: 15 },
  { id: "cat-5",  slug: "mechanics",       title: "Mechanics",           description: "Two-wheeler & four-wheeler repair, servicing", icon: "🔩", bg: "#F1F5F9", accent: "#64748B", providerCount: 20 },
  { id: "cat-6",  slug: "lawyers",         title: "Lawyers",             description: "Legal consultation, documentation & court services", icon: "⚖️", bg: "#EDE9FE", accent: "#8B5CF6", providerCount: 8 },
  { id: "cat-7",  slug: "photographers",   title: "Photographers",       description: "Wedding, portrait, event & candid photography", icon: "📷", bg: "#FCE7F3", accent: "#EC4899", providerCount: 14 },
  { id: "cat-8",  slug: "mobile-repair",   title: "Mobile & Computer",   description: "Screen repair, laptop service, data recovery", icon: "📱", bg: "#ECFDF5", accent: "#10B981", providerCount: 16 },
  { id: "cat-9",  slug: "home-cleaning",   title: "Cleaning",            description: "Deep cleaning, sanitization & chimney cleaning", icon: "🧹", bg: "#EFF6FF", accent: "#2563EB", providerCount: 11 },
  { id: "cat-10", slug: "painting",        title: "Painters",            description: "Interior, exterior, waterproofing & textures", icon: "🎨", bg: "#FEF3C7", accent: "#D97706", providerCount: 9 },
  { id: "cat-11", slug: "appliance-repair",title: "Appliance Repair",    description: "TV, fridge, washing machine & geyser repair", icon: "🔌", bg: "#FFF7ED", accent: "#FB923C", providerCount: 10 },
  { id: "cat-12", slug: "pest-control",    title: "Pest Control",        description: "Termite, cockroach, mosquito & rodent control", icon: "🐛", bg: "#ECFDF5", accent: "#059669", providerCount: 6 },
  { id: "cat-13", slug: "packers-movers",  title: "Movers & Packers",    description: "House shifting, packing, loading & transport", icon: "📦", bg: "#FEF3C7", accent: "#92400E", providerCount: 7 },
  { id: "cat-14", slug: "salon-barber",    title: "Beauty & Salon",      description: "Haircuts, styling, facial & beauty services", icon: "✂️", bg: "#FFF7ED", accent: "#EA580C", providerCount: 15 },
  { id: "cat-15", slug: "home-tutor",      title: "Tutors",              description: "Home tuition for school, college & competitive exams", icon: "📚", bg: "#DBEAFE", accent: "#1E40AF", providerCount: 14 },
  { id: "cat-16", slug: "driving-schools", title: "Driving Schools",     description: "Car & two-wheeler driving lessons & licence help", icon: "🚗", bg: "#F1F5F9", accent: "#475569", providerCount: 6 },
  { id: "cat-17", slug: "tailor",          title: "Tailors",             description: "Stitching, alterations, blouse work & uniforms", icon: "🧵", bg: "#EFF6FF", accent: "#1E40AF", providerCount: 10 },
  { id: "cat-18", slug: "ro-water-purifier", title: "Home Appliance Services", description: "RO service, water purifier & geyser AMC", icon: "💧", bg: "#E0F2FE", accent: "#0284C7", providerCount: 7 },
];

/* ---------------------------------------------------------------- */
/* ALL CATEGORIES (includes popular + additional)                     */
/* ---------------------------------------------------------------- */

export const allCategories: ServiceCategory[] = [
  ...popularCategories,
  { id: "cat-19", slug: "car-service",        title: "Car Service",             description: "Full car service, oil change & detailing", icon: "🚗", bg: "#F1F5F9", accent: "#475569", providerCount: 13 },
  { id: "cat-20", slug: "bike-service",       title: "Bike Service",            description: "Bike servicing, engine tuning & oil change", icon: "🏍️", bg: "#FEF9C3", accent: "#CA8A04", providerCount: 10 },
  { id: "cat-21", slug: "tyre-puncture",      title: "Tyre & Puncture",         description: "Tyre replacement, puncture repair & alignment", icon: "🛞", bg: "#F5F3FF", accent: "#7C3AED", providerCount: 8 },
  { id: "cat-22", slug: "battery-services",   title: "Battery Services",        description: "Car & inverter battery supply & replacement", icon: "🔋", bg: "#FEF2F2", accent: "#EF4444", providerCount: 5 },
  { id: "cat-23", slug: "towing",             title: "Towing",                  description: "Vehicle towing & roadside recovery", icon: "🚛", bg: "#FFF1F2", accent: "#E11D48", providerCount: 4 },
  { id: "cat-24", slug: "cctv-installation",  title: "CCTV Installation",       description: "CCTV setup, DVR config & remote monitoring", icon: "📹", bg: "#F8FAFC", accent: "#334155", providerCount: 7 },
  { id: "cat-25", slug: "internet-wifi",      title: "Internet/Wi-Fi",          description: "Broadband setup, router config & Wi-Fi extend", icon: "📡", bg: "#DBEAFE", accent: "#1D4ED8", providerCount: 6 },
  { id: "cat-26", slug: "printing",           title: "Printing",                description: "Digital printing, photocopying & binding", icon: "🖨️", bg: "#F1F5F9", accent: "#64748B", providerCount: 8 },
  { id: "cat-27", slug: "ca",                 title: "CA & Tax",                description: "Income tax filing, GST, audit & accounting", icon: "📊", bg: "#EDE9FE", accent: "#7C3AED", providerCount: 5 },
  { id: "cat-28", slug: "real-estate-agent",  title: "Real Estate Agent",       description: "Property buying, selling & rental services", icon: "🏠", bg: "#ECFDF5", accent: "#047857", providerCount: 8 },
  { id: "cat-29", slug: "makeup-artist",      title: "Makeup Artist",           description: "Bridal, party & fashion makeup", icon: "💄", bg: "#FDF2F8", accent: "#BE185D", providerCount: 7 },
  { id: "cat-30", slug: "mehndi-artist",      title: "Mehndi Artist",           description: "Bridal & occasion mehndi designs", icon: "🌿", bg: "#F0FDF4", accent: "#15803D", providerCount: 5 },
  { id: "cat-31", slug: "laundry-dry-cleaning", title: "Laundry & Dry Cleaning", description: "Wash, iron, dry clean & stain removal", icon: "👔", bg: "#F0F9FF", accent: "#0369A1", providerCount: 6 },
  { id: "cat-32", slug: "event-planner",      title: "Event Planner",           description: "Wedding, birthday & corporate event planning", icon: "🎉", bg: "#FEF9C3", accent: "#A16207", providerCount: 8 },
  { id: "cat-33", slug: "caterer",            title: "Caterer",                 description: "Catering for weddings, functions & parties", icon: "🍽️", bg: "#FFF7ED", accent: "#C2410C", providerCount: 11 },
  { id: "cat-34", slug: "decorator",          title: "Decorator",               description: "Stage, mandap, flower & balloon decoration", icon: "🎀", bg: "#FDF2F8", accent: "#DB2777", providerCount: 6 },
  { id: "cat-35", slug: "dj-sound",           title: "DJ & Sound",              description: "DJ, sound system, lighting & music", icon: "🎵", bg: "#EDE9FE", accent: "#7C3AED", providerCount: 5 },
  { id: "cat-36", slug: "local-delivery",     title: "Local Delivery",          description: "Parcel, document & goods delivery in town", icon: "🚚", bg: "#ECFDF5", accent: "#065F46", providerCount: 9 },
  { id: "cat-37", slug: "coaching",           title: "Coaching",                description: "Competitive exam coaching & test prep", icon: "🎓", bg: "#F5F3FF", accent: "#5B21B6", providerCount: 10 },
  { id: "cat-38", slug: "computer-training",  title: "Computer Training",       description: "MS Office, Tally, DTP & programming courses", icon: "🖥️", bg: "#F0FDF4", accent: "#166534", providerCount: 6 },
];

/* ---------------------------------------------------------------- */
/* MOCK PROVIDERS                                                     */
/* ---------------------------------------------------------------- */
/* ⚠️ ALL DATA BELOW IS MOCK / DEVELOPMENT ONLY                      */
/* Phone numbers are placeholders. Do not call or message.            */
/* Ratings and reviews are fictional.                                 */
/* Verified status is simulated for UI testing.                       */
/* ---------------------------------------------------------------- */

const MOCK_PHONE = "+91 00000 00000"; // Safe demo placeholder — not a real number

export const mockProviders: ServiceProvider[] = [
  {
    id: "prov-1",
    name: "Raj Electrical Works",
    slug: "raj-electrical-works",
    category: "electricians",
    categoryTitle: "Electrician",
    description:
      "Trusted electrical services in Nalgonda with over 15 years of experience. Specializing in residential and commercial electrical installations, repairs, and maintenance. Known for punctual service and fair pricing.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "Near Bus Stand, Main Road, Nalgonda",
    city: "Nalgonda Town",
    latitude: 17.0583,
    longitude: 79.2671,
    rating: 4.8,
    reviewCount: 124,
    distanceKm: 1.2,
    images: ["electrician-hero"],
    photos: ["electrician-hero", "electrician-work"],
    verified: false,
    services: [
      "Electrical Installation",
      "Home Wiring",
      "Fan Repair",
      "Switch & Socket Repair",
      "Electrical Maintenance",
      "MCB/Fuse Box Repair",
      "Inverter Installation",
    ],
    openingHours: "Mon–Sat: 8:00 AM – 8:00 PM",
    faqs: [
      {
        question: "Do you provide emergency services?",
        answer:
          "Yes, we provide 24/7 emergency electrical services within Nalgonda city limits.",
      },
      {
        question: "What are your charges?",
        answer:
          "Our visiting charge starts at ₹200. Final pricing depends on the type and complexity of the work.",
      },
      {
        question: "Do you offer warranty on work?",
        answer:
          "Yes, we provide a 30-day warranty on all repair work and 1-year warranty on new installations.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-2",
    name: "Sri Sai Plumbing Services",
    slug: "sri-sai-plumbing-services",
    category: "plumbers",
    categoryTitle: "Plumber",
    description:
      "Professional plumbing solutions for homes and businesses in Nalgonda. Expert in pipeline repair, bathroom fittings, water tank installation, and leak detection. Quick response and reliable service.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "Gandhi Chowk, Nalgonda",
    city: "Nalgonda Town",
    latitude: 17.0550,
    longitude: 79.2690,
    rating: 4.7,
    reviewCount: 89,
    distanceKm: 2.1,
    images: ["plumber-hero"],
    photos: ["plumber-hero", "plumber-work"],
    verified: false,
    services: [
      "Pipe Repair & Replacement",
      "Bathroom Fittings",
      "Water Tank Installation",
      "Leak Detection & Fix",
      "Drainage Cleaning",
      "Motor Pump Service",
      "Tap & Valve Repair",
    ],
    openingHours: "Mon–Sat: 7:00 AM – 7:00 PM",
    faqs: [
      {
        question: "Do you handle commercial plumbing?",
        answer:
          "Yes, we handle both residential and commercial plumbing projects across Nalgonda.",
      },
      {
        question: "How quickly can you respond?",
        answer:
          "For urgent issues, we try to reach within 1–2 hours during working hours.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-3",
    name: "Nalgonda Home Repairs",
    slug: "nalgonda-home-repairs",
    category: "carpenters",
    categoryTitle: "Carpenter",
    description:
      "Quality carpentry and woodwork services in Nalgonda. From custom furniture to door/window repairs, our skilled carpenters deliver precise craftsmanship. Using premium wood and modern tools for lasting results.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "Beside Govt Hospital, Nalgonda",
    city: "Nalgonda Town",
    latitude: 17.0520,
    longitude: 79.2650,
    rating: 4.6,
    reviewCount: 67,
    distanceKm: 2.8,
    images: ["carpenter-hero"],
    photos: ["carpenter-hero", "carpenter-work"],
    verified: false,
    services: [
      "Custom Furniture",
      "Door & Window Repair",
      "Kitchen Cabinet Work",
      "Wardrobe Design",
      "Wood Polishing",
      "Bed & Sofa Repair",
      "Partition Work",
    ],
    openingHours: "Mon–Sat: 9:00 AM – 6:00 PM",
    faqs: [
      {
        question: "Do you make custom furniture?",
        answer:
          "Yes, we design and build custom furniture tailored to your space and requirements.",
      },
      {
        question: "What types of wood do you use?",
        answer:
          "We work with Teak, Sheesham, Plywood, MDF, and other materials based on your budget and preference.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-4",
    name: "Cool Care AC Services",
    slug: "cool-care-ac-services",
    category: "ac-repair",
    categoryTitle: "AC Repair",
    description:
      "Expert air conditioning repair, installation, and maintenance services in Nalgonda. Servicing all major brands including Samsung, LG, Voltas, Daikin, and more. AMC plans available for hassle-free cooling.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "Collectorate Road, Nalgonda",
    city: "Nalgonda Town",
    latitude: 17.0600,
    longitude: 79.2700,
    rating: 4.8,
    reviewCount: 103,
    distanceKm: 3.4,
    images: ["ac-repair-hero"],
    photos: ["ac-repair-hero", "ac-repair-work"],
    verified: false,
    services: [
      "AC Installation",
      "AC Repair & Service",
      "Gas Refilling",
      "Compressor Repair",
      "AC Deep Cleaning",
      "AMC Plans",
      "Duct AC Service",
    ],
    openingHours: "Mon–Sun: 8:00 AM – 9:00 PM",
    faqs: [
      {
        question: "Which AC brands do you service?",
        answer:
          "We service all major brands including Samsung, LG, Voltas, Daikin, Carrier, Hitachi, and more.",
      },
      {
        question: "Do you offer Annual Maintenance Contracts?",
        answer:
          "Yes, our AMC plans start at ₹2,500/year and include 2 services, priority support, and discounted repairs.",
      },
      {
        question: "How much does AC servicing cost?",
        answer:
          "Regular AC service starts at ₹499. Deep cleaning and gas refilling are priced separately.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-5",
    name: "Bhavani Auto & Bike Mechanics",
    slug: "bhavani-auto-mechanics",
    category: "mechanics",
    categoryTitle: "Mechanic",
    description:
      "Complete two-wheeler and four-wheeler mechanical repairs, engine diagnostics, oil service, and brake tune-ups with genuine spare parts.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "Hyderabad Road, Miryalaguda",
    city: "Miryalaguda",
    latitude: 16.8710,
    longitude: 79.5630,
    rating: 4.9,
    reviewCount: 142,
    distanceKm: 4.5,
    images: ["mechanic-hero"],
    photos: ["mechanic-hero"],
    verified: false,
    services: [
      "General Bike Service",
      "Engine Overhaul",
      "Brake & Clutch Repair",
      "Car Oil & Filter Change",
      "Suspension Tuning",
      "Breakdown Assistance",
    ],
    openingHours: "Mon–Sat: 8:30 AM – 8:30 PM",
    faqs: [
      {
        question: "Do you offer roadside breakdown service?",
        answer: "Yes, we offer roadside assistance within 15 km of our workshop.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-6",
    name: "Sri Lakshmi Advocates & Legal Advisors",
    slug: "sri-lakshmi-advocates",
    category: "lawyers",
    categoryTitle: "Lawyer",
    description:
      "Experienced legal counsel covering civil litigation, property registration, document verification, and legal consultation in Nalgonda District Court.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "District Court Complex, Nalgonda",
    city: "Nalgonda Town",
    latitude: 17.0510,
    longitude: 79.2610,
    rating: 4.9,
    reviewCount: 58,
    distanceKm: 1.8,
    images: ["lawyer-hero"],
    photos: ["lawyer-hero"],
    verified: false,
    services: [
      "Property Title Verification",
      "Legal Consultation",
      "Civil & Criminal Case Filing",
      "Affidavit & Notary Drafting",
      "Registration Guidance",
    ],
    openingHours: "Mon–Sat: 9:30 AM – 7:00 PM",
    faqs: [
      {
        question: "Do you provide initial consultations?",
        answer: "Yes, consultation is available by prior appointment.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-7",
    name: "Studio Vennela Photography",
    slug: "studio-vennela-photography",
    category: "photographers",
    categoryTitle: "Photographer",
    description:
      "Capturing your best memories with cinematic wedding photography, candid portraits, pre-wedding shoots, and baby milestone albums in Nalgonda.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "VT Colony, Nalgonda",
    city: "Nalgonda Town",
    latitude: 17.0620,
    longitude: 79.2730,
    rating: 4.9,
    reviewCount: 115,
    distanceKm: 2.3,
    images: ["photographer-hero"],
    photos: ["photographer-hero"],
    verified: false,
    services: [
      "Wedding Photography & 4K Drone",
      "Pre-Wedding Shoots",
      "Traditional & Candid Photos",
      "Baby & Birthday Shoots",
      "Photo Album Printing",
    ],
    openingHours: "Mon–Sun: 9:00 AM – 9:00 PM",
    faqs: [
      {
        question: "Do you travel outside Nalgonda for shoots?",
        answer: "Yes, we cover destination events across Telangana and Andhra Pradesh.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-8",
    name: "Smart Tech Mobile & Laptop Hub",
    slug: "smart-tech-mobile-repair",
    category: "mobile-repair",
    categoryTitle: "Mobile & Computer Repair",
    description:
      "Fast chip-level mobile screen replacement, battery upgrades, laptop SSD upgrades, motherboard fixes, and software formatting with warranty.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "Near RTC Complex, Clock Tower, Nalgonda",
    city: "Nalgonda Town",
    latitude: 17.0570,
    longitude: 79.2660,
    rating: 4.7,
    reviewCount: 94,
    distanceKm: 0.8,
    images: ["mobile-repair-hero"],
    photos: ["mobile-repair-hero"],
    verified: false,
    services: [
      "Screen & Glass Replacement",
      "Battery Replacement",
      "Laptop SSD & RAM Upgrade",
      "Water Damage Repair",
      "Data Recovery",
      "OS Formatting",
    ],
    openingHours: "Mon–Sat: 10:00 AM – 9:00 PM",
    faqs: [
      {
        question: "How long does screen replacement take?",
        answer: "Most screen replacements are done within 45 to 90 minutes on the same day.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-9",
    name: "Telangana Express Home Cleaning",
    slug: "telangana-express-home-cleaning",
    category: "home-cleaning",
    categoryTitle: "Home Cleaning",
    description:
      "Deep home cleaning, sofa sanitization, kitchen chimney degreasing, bathroom descaling, and pre-festival sanitization across Nalgonda district.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "Subhash Nagar, Nalgonda",
    city: "Nalgonda Town",
    latitude: 17.0595,
    longitude: 79.2685,
    rating: 4.6,
    reviewCount: 78,
    distanceKm: 1.9,
    images: ["cleaning-hero"],
    photos: ["cleaning-hero"],
    verified: false,
    services: [
      "Full House Deep Cleaning",
      "Bathroom & Toilet Scrubbing",
      "Kitchen & Chimney Cleaning",
      "Sofa & Mattress Shampooing",
      "Water Tank Scrubbing",
    ],
    openingHours: "Mon–Sun: 7:30 AM – 7:30 PM",
    faqs: [
      {
        question: "Do you bring your own cleaning machines and chemicals?",
        answer: "Yes, our team brings professional vacuum cleaners, steam machines, and eco-friendly chemicals.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-10",
    name: "Classic Colors Painting & Decor",
    slug: "classic-colors-painting",
    category: "painting",
    categoryTitle: "Painter",
    description:
      "Interior & exterior house painting, waterproof wall putty, texture designs, stencil artwork, and wood polish by seasoned painters.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "Near Ramagiri Temple, Nalgonda",
    city: "Nalgonda Town",
    latitude: 17.0640,
    longitude: 79.2620,
    rating: 4.8,
    reviewCount: 82,
    distanceKm: 3.1,
    images: ["painting-hero"],
    photos: ["painting-hero"],
    verified: false,
    services: [
      "Interior Wall Painting",
      "Exterior Weatherproof Coating",
      "Waterproofing & Damp Proofing",
      "Texture Art & Wallpaper",
      "Door & Window Enamel Polish",
    ],
    openingHours: "Mon–Sat: 8:00 AM – 6:30 PM",
    faqs: [
      {
        question: "Do you provide free estimation and site visits?",
        answer: "Yes, we provide free site inspection and instant quotation in Nalgonda.",
      },
    ],
    isMockData: true,
  },
  /* ---- Providers in OTHER locations for location filtering test ---- */
  {
    id: "prov-11",
    name: "Devarakonda Electrical Solutions",
    slug: "devarakonda-electrical-solutions",
    category: "electricians",
    categoryTitle: "Electrician",
    description:
      "Reliable electrical installations and repairs serving the Devarakonda area. House wiring, motor pump connections, and inverter setup.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "Main Bazaar, Devarakonda",
    city: "Devarakonda",
    latitude: 16.6933,
    longitude: 78.9281,
    rating: 4.5,
    reviewCount: 38,
    distanceKm: 6.2,
    images: ["electrician-hero"],
    photos: ["electrician-hero"],
    verified: false,
    services: [
      "House Wiring",
      "Motor Pump Connection",
      "Inverter Setup",
      "General Electrical Repairs",
    ],
    openingHours: "Mon–Sat: 8:00 AM – 7:00 PM",
    faqs: [
      {
        question: "Do you serve surrounding villages?",
        answer: "Yes, we cover Devarakonda and nearby areas within 10 km.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-12",
    name: "Nakrekal Plumbing Center",
    slug: "nakrekal-plumbing-center",
    category: "plumbers",
    categoryTitle: "Plumber",
    description:
      "Professional plumbing for residential and agricultural setups. Motor pump repair, bore well connections, and bathroom installations.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "Near Bus Stand, Nakrekal",
    city: "Nakrekal",
    latitude: 17.1710,
    longitude: 79.4350,
    rating: 4.4,
    reviewCount: 28,
    distanceKm: 8.5,
    images: ["plumber-hero"],
    photos: ["plumber-hero"],
    verified: false,
    services: [
      "Motor Pump Repair",
      "Bore Well Connection",
      "Bathroom Installation",
      "Pipeline Repair",
    ],
    openingHours: "Mon–Sat: 7:30 AM – 6:30 PM",
    faqs: [
      {
        question: "Do you handle agricultural pump motors?",
        answer: "Yes, we repair and install submersible and centrifugal pump motors.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-13",
    name: "Chityal AC & Refrigeration",
    slug: "chityal-ac-refrigeration",
    category: "ac-repair",
    categoryTitle: "AC Repair",
    description:
      "AC installation, servicing, and refrigerator repair in Chityal and surrounding areas. Quick doorstep service available.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "NH 65, Chityal Junction",
    city: "Chityal",
    latitude: 17.2250,
    longitude: 79.2800,
    rating: 4.3,
    reviewCount: 22,
    distanceKm: 12.0,
    images: ["ac-repair-hero"],
    photos: ["ac-repair-hero"],
    verified: false,
    services: [
      "AC Installation & Repair",
      "Gas Refilling",
      "Refrigerator Service",
      "Cooler Repair",
    ],
    openingHours: "Mon–Sat: 9:00 AM – 7:00 PM",
    faqs: [
      {
        question: "Do you service refrigerators too?",
        answer: "Yes, we repair all brands of refrigerators and deep freezers.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-14",
    name: "Haliya Carpentry Works",
    slug: "haliya-carpentry-works",
    category: "carpenters",
    categoryTitle: "Carpenter",
    description:
      "Traditional and modern carpentry services in Haliya. Specializing in agricultural tool repairs, custom furniture, and door work.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "Near Market Yard, Haliya",
    city: "Haliya",
    latitude: 17.0610,
    longitude: 79.2120,
    rating: 4.2,
    reviewCount: 18,
    distanceKm: 9.8,
    images: ["carpenter-hero"],
    photos: ["carpenter-hero"],
    verified: false,
    services: [
      "Custom Furniture",
      "Door & Window Work",
      "Agricultural Tool Repair",
      "Wood Polishing",
    ],
    openingHours: "Mon–Sat: 8:30 AM – 6:00 PM",
    faqs: [
      {
        question: "Do you make wooden agricultural tools?",
        answer: "Yes, we craft and repair wooden ploughs, carts, and farm equipment.",
      },
    ],
    isMockData: true,
  },
  {
    id: "prov-15",
    name: "Miryalaguda Photo Studio",
    slug: "miryalaguda-photo-studio",
    category: "photographers",
    categoryTitle: "Photographer",
    description:
      "Comprehensive photography services in Miryalaguda. Wedding, engagement, birthday, and passport photos with studio and outdoor options.",
    phone: MOCK_PHONE,
    whatsapp: MOCK_PHONE,
    address: "Station Road, Miryalaguda",
    city: "Miryalaguda",
    latitude: 16.8730,
    longitude: 79.5650,
    rating: 4.6,
    reviewCount: 65,
    distanceKm: 5.0,
    images: ["photographer-hero"],
    photos: ["photographer-hero"],
    verified: false,
    services: [
      "Wedding Photography",
      "Studio Portraits",
      "Birthday & Events",
      "Passport & ID Photos",
    ],
    openingHours: "Mon–Sun: 9:00 AM – 8:00 PM",
    faqs: [
      {
        question: "Do you offer photo printing on the same day?",
        answer: "Yes, passport and ID photos are printed within 30 minutes.",
      },
    ],
    isMockData: true,
  },
];

/* ---------------------------------------------------------------- */
/* IMAGE MAP                                                          */
/* ---------------------------------------------------------------- */
/* Centralized image mapping. Components import this to resolve       */
/* image keys to actual require() assets.                             */
/* ---------------------------------------------------------------- */

export const SERVICE_IMAGES: Record<string, any> = {
  // Electrician
  "electrician-hero": require("@/assets/images/services/electrician.jpg"),
  "electrician-work": require("@/assets/images/services/electrician.jpg"),
  // Plumber
  "plumber-hero": require("@/assets/images/services/plumber.jpg"),
  "plumber-work": require("@/assets/images/services/plumber.jpg"),
  // Carpenter
  "carpenter-hero": require("@/assets/images/services/carpenter.jpg"),
  "carpenter-work": require("@/assets/images/services/carpenter.jpg"),
  // AC Repair
  "ac-repair-hero": require("@/assets/images/services/ac-repair.jpg"),
  "ac-repair-work": require("@/assets/images/services/ac-repair.jpg"),
  // Mechanic
  "mechanic-hero": require("@/assets/images/services/mechanic.jpg"),
  // Lawyer
  "lawyer-hero": require("@/assets/images/services/lawyer.jpg"),
  // Photographer
  "photographer-hero": require("@/assets/images/services/photographer.jpg"),
  // Mobile Repair
  "mobile-repair-hero": require("@/assets/images/services/mobile-repair.jpg"),
  // Cleaning
  "cleaning-hero": require("@/assets/images/services/cleaning.jpg"),
  // Painting
  "painting-hero": require("@/assets/images/services/painting.jpg"),
};

/**
 * Resolve an image key to a source object for ExpoImage.
 *
 * - Mock image keys (e.g. "electrician-hero") → require() asset from SERVICE_IMAGES map
 * - Remote HTTPS URLs (e.g. Cloudinary/S3 URLs) → { uri: url }
 * - Everything else → null (triggers placeholder in components)
 */
export function resolveImage(key: string): any | null {
  if (!key) return null;

  // Remote cloud-hosted image URL — return as { uri } for ExpoImage
  if (key.startsWith("https://") || key.startsWith("http://")) {
    return { uri: key };
  }

  // Mock image key lookup
  return SERVICE_IMAGES[key] ?? null;
}

/* ---------------------------------------------------------------- */
/* APPROVED BUSINESSES FROM API                                       */
/* ---------------------------------------------------------------- */

/**
 * Maps a BusinessDocument from the backend API to a ServiceProvider
 * compatible with the existing UI components.
 */
function mapBusinessToProvider(biz: BusinessDocument): ServiceProvider {
  const cat = getCategoryBySlug(biz.category);

  // Build the images array: prefer coverPhoto, then logo, then businessPhotos.
  // These are HTTPS Cloudinary URLs — resolveImage() already handles them.
  const images: string[] = [];
  if (biz.coverPhoto) images.push(biz.coverPhoto);
  else if (biz.logo) images.push(biz.logo);
  else if (biz.businessPhotos?.length > 0) images.push(biz.businessPhotos[0]);

  const photos: string[] = [];
  if (biz.coverPhoto) photos.push(biz.coverPhoto);
  if (biz.logo && biz.logo !== biz.coverPhoto) photos.push(biz.logo);
  biz.businessPhotos?.forEach((p) => {
    if (!photos.includes(p)) photos.push(p);
  });

  // Build opening hours string
  let openingHours = "Contact for hours";
  if (biz.is24Hours) {
    openingHours = "Open 24/7";
  } else if (biz.openingTime && biz.closingTime) {
    const closedStr = biz.closedDays?.length
      ? ` (Closed: ${biz.closedDays.join(", ")})`
      : "";
    openingHours = `${biz.openingTime} – ${biz.closingTime}${closedStr}`;
  }

  // Map city: backend stores "Nalgonda" but frontend uses "Nalgonda Town"
  let city = biz.city || "Nalgonda";
  if (city === "Nalgonda") city = "Nalgonda Town";

  return {
    id: `api-${biz._id}`,
    name: biz.businessName,
    slug: biz.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    category: biz.category,
    categoryTitle: cat?.title || biz.category,
    description: biz.description || "",
    phone: biz.phone,
    whatsapp: biz.whatsapp || biz.phone,
    address: biz.address,
    locality: biz.locality || "",
    city,
    latitude:
      typeof biz.location?.coordinates?.[1] === "number" &&
      biz.location?.coordinates?.[1] !== 0
        ? biz.location.coordinates[1]
        : 0,
    longitude:
      typeof biz.location?.coordinates?.[0] === "number" &&
      biz.location?.coordinates?.[0] !== 0
        ? biz.location.coordinates[0]
        : 0,
    rating: 0,
    reviewCount: 0,
    distanceKm: undefined,
    verified: biz.verified === true,
    services: biz.services || [],
    openingHours,
    images,
    photos,
    faqs: [],
    isMockData: false,
  };
}

/** Result type for fetchApprovedProviders — distinguishes success from failure */
export interface FetchApprovedResult {
  /** true when the API responded successfully (even if zero businesses) */
  success: boolean;
  /** Approved business providers mapped for the UI (empty on failure) */
  data: ServiceProvider[];
  /** Human-readable error message when success is false */
  error?: string;
}

/**
 * Fetch approved + verified businesses from the backend API.
 * Returns a result object so callers can distinguish a successful-but-empty
 * response from an API failure — critical for production error handling.
 */
export async function fetchApprovedProviders(): Promise<FetchApprovedResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/businesses/approved`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return {
        success: false,
        data: [],
        error: `Server responded with status ${res.status}`,
      };
    }
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      return {
        success: false,
        data: [],
        error: "Unexpected response format from server",
      };
    }
    return {
      success: true,
      data: json.data.map((biz: BusinessDocument) => mapBusinessToProvider(biz)),
    };
  } catch (err) {
    // Network error — server unreachable, no internet, etc.
    console.warn("[services] Failed to fetch approved businesses from API", err);
    return {
      success: false,
      data: [],
      error: "Unable to connect to the server",
    };
  }
}

/* ---------------------------------------------------------------- */
/* SERVICE / DATA ACCESS FUNCTIONS                                    */
/* ---------------------------------------------------------------- */
/* These functions abstract data access so components never directly  */
/* import mockProviders. When the backend is ready, replace the       */
/* internals with API calls.                                          */
/* ---------------------------------------------------------------- */

/** Get category info by slug */
export function getCategoryBySlug(slug: string): ServiceCategory | undefined {
  return allCategories.find((c) => c.slug === slug);
}

/** Generate template providers for a category if none exist in mockProviders */
function getTemplateProviders(slug: string, city?: string): ServiceProvider[] {
  const cat = getCategoryBySlug(slug);
  if (!cat) return [];

  const targetCity = city || "Nalgonda Town";

  return [
    {
      id: `prov-${slug}-1`,
      name: `Sri ${cat.title} Services`,
      slug: `sri-${slug}-services`,
      category: slug,
      categoryTitle: cat.title,
      description: `Professional and trusted ${cat.title.toLowerCase()} in ${targetCity}. Delivering quality service with experienced experts, fair pricing, and customer satisfaction guarantee.`,
      phone: MOCK_PHONE,
      whatsapp: MOCK_PHONE,
      address: `Main Market Road, ${targetCity}`,
      city: targetCity,
      latitude: 17.0560,
      longitude: 79.2670,
      rating: 4.8,
      reviewCount: 52,
      distanceKm: 1.5,
      images: [],
      photos: [],
      verified: false,
      services: [
        `Standard ${cat.title} Service`,
        `Doorstep & On-Site Assistance`,
        `Emergency Support`,
        `Consultation & Quotation`,
      ],
      openingHours: "Mon–Sat: 8:30 AM – 8:00 PM",
      faqs: [
        {
          question: `How do I book ${cat.title.toLowerCase()} service?`,
          answer: "You can directly call or message us on WhatsApp for quick confirmation.",
        },
        {
          question: `Do you provide doorstep service in ${targetCity}?`,
          answer: `Yes, our team provides doorstep services across ${targetCity}.`,
        },
      ],
      isMockData: true,
    },
    {
      id: `prov-${slug}-2`,
      name: `${targetCity} ${cat.title} Hub`,
      slug: `${targetCity.toLowerCase().replace(/\s+/g, "-")}-${slug}-hub`,
      category: slug,
      categoryTitle: cat.title,
      description: `Your reliable local ${cat.title.toLowerCase()} specialists. Quick response time, verified background, and top-rated customer care.`,
      phone: MOCK_PHONE,
      whatsapp: MOCK_PHONE,
      address: `Near Clock Tower, ${targetCity}`,
      city: targetCity,
      latitude: 17.0580,
      longitude: 79.2680,
      rating: 4.6,
      reviewCount: 34,
      distanceKm: 2.4,
      images: [],
      photos: [],
      verified: false,
      services: [
        `Full ${cat.title} Solution`,
        `Inspection & Estimation`,
        `Regular Maintenance`,
      ],
      openingHours: "Mon–Sun: 9:00 AM – 7:30 PM",
      faqs: [
        {
          question: "What are your working hours?",
          answer: "We are open Monday to Sunday, 9:00 AM to 7:30 PM.",
        },
      ],
      isMockData: true,
    },
  ];
}

/** Get all providers for a given category slug, optionally filtered by location */
export function getProvidersByCategory(
  slug: string,
  locationName?: string,
): ServiceProvider[] {
  let direct = mockProviders.filter((p) => p.category === slug);

  // Filter by location if specified and not the default "Nalgonda Town"
  if (locationName && locationName !== "Nalgonda Town") {
    const locFiltered = direct.filter(
      (p) => p.city.toLowerCase() === locationName.toLowerCase()
    );
    if (locFiltered.length > 0) {
      direct = locFiltered;
    } else {
      // No providers in this location for this category — generate templates
      return getTemplateProviders(slug, locationName);
    }
  }

  if (direct.length > 0) return direct;
  return getTemplateProviders(slug, locationName);
}

/** Get a single provider by ID */
export function getProviderById(id: string): ServiceProvider | undefined {
  const direct = mockProviders.find((p) => p.id === id);
  if (direct) return direct;

  // Check if it is a template provider ID like "prov-{slug}-{num}"
  if (id.startsWith("prov-")) {
    const parts = id.replace("prov-", "").split("-");
    if (parts.length >= 2) {
      const num = parts[parts.length - 1];
      const slug = parts.slice(0, -1).join("-");
      if (/^\d+$/.test(num)) {
        const templates = getTemplateProviders(slug);
        return templates.find((p) => p.id === id);
      }
    }
  }
  return undefined;
}

/**
 * Get all providers, optionally filtered by location.
 * Pass `approvedProviders` (fetched via fetchApprovedProviders) to merge
 * real approved businesses with mock data.
 */
/** Default search radius in kilometers for Nearby tab */
export const DEFAULT_NEARBY_RADIUS_KM = 30;

/**
 * Calculate the great-circle distance between two GPS points in kilometers
 * using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Recalculate a provider's distanceKm given an origin location.
 */
export function withCalculatedDistance(
  provider: ServiceProvider,
  originLat: number,
  originLng: number,
): ServiceProvider {
  const hasCoords =
    typeof provider.latitude === "number" &&
    typeof provider.longitude === "number" &&
    (provider.latitude !== 0 || provider.longitude !== 0) &&
    !isNaN(provider.latitude) &&
    !isNaN(provider.longitude);

  if (!hasCoords) {
    return {
      ...provider,
      distanceKm: undefined,
    };
  }

  const dist = calculateDistanceKm(
    originLat,
    originLng,
    provider.latitude,
    provider.longitude,
  );

  return {
    ...provider,
    distanceKm: Math.round(dist * 10) / 10,
  };
}

/**
 * Get all providers for the "All" tab.
 * Includes all approved Nalgonda businesses and demo listings.
 * Does NOT strictly filter out businesses when a locality is selected,
 * ensuring real approved businesses across Nalgonda always remain visible.
 * Real approved businesses are prioritized before demo listings.
 */
export function getAllProviders(
  locationName?: string,
  approvedProviders: ServiceProvider[] = [],
): ServiceProvider[] {
  // Real approved businesses first, then mock/demo providers, de-duplicate by id
  const merged = [...approvedProviders, ...mockProviders];
  const unique = Array.from(new Map(merged.map((p) => [p.id, p])).values());

  return unique;
}

/**
 * Get providers within a distance radius of the search origin,
 * with actual calculated distances, sorted ascending by distance.
 * Real approved businesses are evaluated by their real coordinates.
 * Providers without valid coordinates are never assumed to be nearby.
 */
export function getNearbyProviders(
  origin: { latitude: number; longitude: number; name?: string },
  approvedProviders: ServiceProvider[] = [],
  radiusKm: number = DEFAULT_NEARBY_RADIUS_KM,
): ServiceProvider[] {
  // Real approved businesses first, then mock/demo providers, de-duplicate by id
  const merged = [...approvedProviders, ...mockProviders];
  const unique = Array.from(new Map(merged.map((p) => [p.id, p])).values());

  const withDistances = unique
    .map((p) => {
      const hasCoords =
        typeof p.latitude === "number" &&
        typeof p.longitude === "number" &&
        (p.latitude !== 0 || p.longitude !== 0) &&
        !isNaN(p.latitude) &&
        !isNaN(p.longitude);

      if (!hasCoords) {
        return {
          ...p,
          distanceKm: undefined,
        };
      }

      const dist = calculateDistanceKm(
        origin.latitude,
        origin.longitude,
        p.latitude,
        p.longitude,
      );

      return {
        ...p,
        distanceKm: Math.round(dist * 10) / 10,
      };
    })
    // Only show providers whose calculated distance is within DEFAULT_NEARBY_RADIUS_KM
    .filter(
      (p) => typeof p.distanceKm === "number" && p.distanceKm <= radiusKm
    );

  // Sort ascending by actual distance (closest first). Real approved businesses take priority on ties.
  withDistances.sort((a, b) => {
    const distA = a.distanceKm ?? 9999;
    const distB = b.distanceKm ?? 9999;
    if (Math.abs(distA - distB) > 0.05) {
      return distA - distB;
    }
    if (!a.isMockData && b.isMockData) return -1;
    if (a.isMockData && !b.isMockData) return 1;
    return b.rating - a.rating;
  });

  return withDistances;
}

/** Apply filter to a provider list */
export function applyFilter(
  providers: ServiceProvider[],
  filter: "all" | "nearby" | "rating" | "verified",
): ServiceProvider[] {
  switch (filter) {
    case "verified":
      // Verified status only applies to authenticated real backend providers
      return providers.filter((p) => !p.isMockData && p.verified);
    case "rating":
      return [...providers].sort((a, b) => b.rating - a.rating);
    case "nearby":
      return [...providers]
        .filter(
          (p) =>
            typeof p.distanceKm === "number" &&
            p.distanceKm <= DEFAULT_NEARBY_RADIUS_KM
        )
        .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    case "all":
    default:
      return providers;
  }
}

/**
 * Search providers and categories by query string.
 * Case-insensitive. Searches name, category, category title, and service names.
 */
export function searchServices(
  query: string,
  approvedProviders: ServiceProvider[] = [],
): {
  providers: ServiceProvider[];
  categories: ServiceCategory[];
} {
  const q = query.toLowerCase().trim();
  if (!q) {
    return { providers: [], categories: [] };
  }

  // Find matching categories
  const matchingCategories = allCategories.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
  );

  // Search in mock + approved providers
  const allProvs = [...mockProviders, ...approvedProviders];
  let matchingProviders = allProvs.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.categoryTitle.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.services.some((s) => s.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q)
  );

  // If a category matched and has no direct providers, include its template providers
  matchingCategories.forEach((cat) => {
    if (!allProvs.some((p) => p.category === cat.slug)) {
      const templates = getTemplateProviders(cat.slug);
      matchingProviders = [...matchingProviders, ...templates];
    }
  });

  // Remove duplicates by id
  const uniqueProviders = Array.from(
    new Map(matchingProviders.map((p) => [p.id, p])).values()
  );

  return { providers: uniqueProviders, categories: matchingCategories };
}

/**
 * Format distance for display.
 * Returns human-readable string like "1.2 km" or "800 m".
 * If distance is undefined, negative, or invalid, returns empty string without inventing a distance.
 */
export function formatDistance(km?: number | null): string {
  if (km === undefined || km === null || isNaN(km) || km < 0) {
    return "";
  }
  if (km === 0 || km < 0.05) {
    return "Nearby (< 100 m)";
  }
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Check if a provider has mock/placeholder contact data.
 * Used to disable real call/whatsapp actions in development.
 */
export function isMockContact(provider: ServiceProvider): boolean {
  return (
    provider.isMockData ||
    !provider.phone ||
    provider.phone === MOCK_PHONE ||
    provider.phone.includes("00000")
  );
}
