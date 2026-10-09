import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================================================================ */
/* BUSINESS DATA LAYER — TYPES, CATEGORIES & LOCAL STORAGE           */
/* ================================================================ */
/* Frontend-only storage designed for clean replacement with:        */
/*   Expo App → Node.js + Express API → MongoDB                      */
/* ================================================================ */

export interface BusinessCategoryOption {
  slug: string;
  title: string;
  icon: string;
}

export const BUSINESS_CATEGORIES: BusinessCategoryOption[] = [
  { slug: "electricians", title: "Electrician", icon: "⚡" },
  { slug: "plumbers", title: "Plumber", icon: "🔧" },
  { slug: "carpenters", title: "Carpenter", icon: "🪚" },
  { slug: "ac-repair", title: "AC Repair", icon: "❄️" },
  { slug: "mechanics", title: "Mechanic", icon: "🔩" },
  { slug: "lawyers", title: "Lawyer", icon: "⚖️" },
  { slug: "photographers", title: "Photographer", icon: "📷" },
  { slug: "mobile-repair", title: "Mobile & Computer", icon: "📱" },
  { slug: "appliance-repair", title: "Appliance Repair", icon: "🔌" },
  { slug: "ro-water-purifier", title: "RO / Water Purifier", icon: "💧" },
  { slug: "painting", title: "Painting", icon: "🎨" },
  { slug: "pest-control", title: "Pest Control", icon: "🐛" },
  { slug: "home-cleaning", title: "Home Cleaning", icon: "🧹" },
  { slug: "car-service", title: "Car Service", icon: "🚗" },
  { slug: "bike-service", title: "Bike Service", icon: "🏍️" },
  { slug: "cctv-installation", title: "CCTV Installation", icon: "📹" },
  { slug: "internet-wifi", title: "Internet / Wi-Fi", icon: "📡" },
  { slug: "printing", title: "Printing", icon: "🖨️" },
  { slug: "ca", title: "CA / Tax Consultant", icon: "📊" },
  { slug: "real-estate-agent", title: "Real Estate", icon: "🏠" },
  { slug: "salon-barber", title: "Salon & Barber", icon: "✂️" },
  { slug: "tailor", title: "Tailor", icon: "🧵" },
  { slug: "event-planner", title: "Event Services", icon: "🎉" },
  { slug: "packers-movers", title: "Packers & Movers", icon: "📦" },
  { slug: "other", title: "Other", icon: "🏢" },
];

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const NALGONDA_AREAS = [
  "Clock Tower / Center",
  "Bus Stand Area",
  "Gandhi Chowk",
  "VT Colony",
  "Subhash Nagar",
  "Ramagiri",
  "Hyderabad Road",
  "Collectorate Road",
  "Miryalaguda Road",
  "Devarakonda Road",
  "Nakrekal Road",
  "Other Locality",
];

export interface BusinessFormData {
  businessName: string;
  category: string;
  categoryTitle: string;
  description: string;
  services: string[];
  logo: string | null;
  coverPhoto: string | null;
  businessPhotos: string[];
  address: string;
  locality: string;
  city: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  openingTime: string;
  closingTime: string;
  is24Hours: boolean;
  closedDays: string[];
}

export interface BusinessSubmission extends BusinessFormData {
  id: string;
  status: "pending" | "approved" | "rejected";
  verified: boolean; // Always false for newly submitted business
  createdAt: string;
}

export const INITIAL_FORM_DATA: BusinessFormData = {
  businessName: "",
  category: "",
  categoryTitle: "",
  description: "",
  services: [],
  logo: null,
  coverPhoto: null,
  businessPhotos: [],
  address: "",
  locality: "",
  city: "Nalgonda",
  pincode: "",
  latitude: 17.0583,
  longitude: 79.2671,
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  openingTime: "09:00 AM",
  closingTime: "08:00 PM",
  is24Hours: false,
  closedDays: [],
};

const STORAGE_KEY_SUBMISSIONS = "@nalgondaone_business_submissions";
const STORAGE_KEY_DRAFT = "@nalgondaone_business_form_draft";

/** Save submitted business to local storage */
export async function saveBusinessSubmission(
  data: BusinessFormData
): Promise<BusinessSubmission> {
  const submission: BusinessSubmission = {
    ...data,
    id: `biz-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: "pending",
    verified: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = await getBusinessSubmissions();
    const updated = [submission, ...existing];
    await AsyncStorage.setItem(
      STORAGE_KEY_SUBMISSIONS,
      JSON.stringify(updated)
    );
    await clearBusinessDraft();
  } catch (error) {
    console.error("Failed to save business submission to storage:", error);
  }

  return submission;
}

/** Get all locally stored business submissions */
export async function getBusinessSubmissions(): Promise<BusinessSubmission[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to get business submissions from storage:", error);
    return [];
  }
}

/** Save in-progress draft */
export async function saveBusinessDraft(data: BusinessFormData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save draft:", error);
  }
}

/** Load in-progress draft */
export async function getBusinessDraft(): Promise<BusinessFormData | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_DRAFT);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to get draft:", error);
    return null;
  }
}

/** Clear draft */
export async function clearBusinessDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY_DRAFT);
  } catch (error) {
    console.error("Failed to clear draft:", error);
  }
}
