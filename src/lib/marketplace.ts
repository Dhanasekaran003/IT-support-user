export type MarketCategory = {
  id: string;
  name: string;
  eta?: string;
  icon: "laptop" | "wifi" | "printer" | "server" | "cctv" | "wrench" | "shield" | "lock";
};

export type MarketService = {
  id: string;
  name: string;
  categoryId: string;
  image: string;
  rating: number;
  price: number;
  mrp?: number;
  badge?: string;
  blurb?: string;
};

export const CITIES = [
  "Chennai",
  "Bengaluru",
  "Hyderabad",
  "Mumbai",
  "Delhi NCR",
  "Coimbatore",
  "Pune",
];

export const SEARCH_HINTS = ["Laptop repair", "WiFi setup", "Printer service", "CCTV install", "AMC plan"];

export const HERO_CATEGORIES: MarketCategory[] = [
  { id: "laptop-desktop", name: "Laptop & Desktop", eta: "45 mins", icon: "laptop" },
  { id: "network-wifi", name: "Network & WiFi", eta: "40 mins", icon: "wifi" },
  { id: "printers", name: "Printer & Peripherals", icon: "printer" },
  { id: "servers", name: "Server & Backup", icon: "server" },
  { id: "cctv", name: "CCTV & Access Control", eta: "34 mins", icon: "cctv" },
  { id: "onsite", name: "On-site IT Support", eta: "44 mins", icon: "wrench" },
];

export const PRODUCT_CATEGORIES: MarketCategory[] = [
  { id: "amc", name: "AMC Plans", icon: "shield" },
  { id: "hardware", name: "Smart IT Hardware", icon: "lock" },
];

export const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80",
];

export const SPOTLIGHT = [
  {
    id: "amc-pro",
    title: "AMC Pro & Plus",
    subtitle: "First-year coverage with 4-hour on-site SLA",
    cta: "Buy now",
    badge: "New launch",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
    to: "/services?category=amc",
    dark: true,
  },
  {
    id: "onsite-it",
    title: "IT help, without the hassle",
    subtitle: "Certified technicians at your office or home",
    cta: "Book now",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
    to: "/book?service=onsite-visit",
  },
  {
    id: "network-health",
    title: "Network health & cabling",
    subtitle: "Pay after 100% satisfaction",
    cta: "Book now",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80",
    to: "/book?service=wifi-setup",
  },
];

export const NOTEWORTHY: MarketService[] = [
  {
    id: "desk-cleanup",
    name: "Workstation cleanup",
    categoryId: "onsite",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80",
    rating: 4.82,
    price: 799,
  },
  {
    id: "office-setup",
    name: "New office IT setup",
    categoryId: "onsite",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=700&q=80",
    rating: 4.76,
    price: 2499,
  },
  {
    id: "meeting-room",
    name: "Meeting room AV",
    categoryId: "onsite",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=700&q=80",
    rating: 4.7,
    price: 1299,
  },
  {
    id: "amc-plus",
    name: "Native AMC Plus",
    categoryId: "amc",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80",
    rating: 4.9,
    price: 4999,
    badge: "New",
  },
  {
    id: "smart-locks",
    name: "Access control kits",
    categoryId: "hardware",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=700&q=80",
    rating: 4.68,
    price: 3499,
  },
];

export const MOST_BOOKED: MarketService[] = [
  {
    id: "laptop-repair",
    name: "Laptop diagnosis & repair",
    categoryId: "laptop-desktop",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=700&q=80",
    rating: 4.81,
    price: 499,
    mrp: 799,
    blurb: "Hardware, OS, and data checks at your site",
  },
  {
    id: "wifi-setup",
    name: "WiFi & mesh setup",
    categoryId: "network-wifi",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=80",
    rating: 4.75,
    price: 699,
    blurb: "Router install, coverage, and speed tuning",
  },
  {
    id: "printer-repair",
    name: "Printer service",
    categoryId: "printers",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=700&q=80",
    rating: 4.73,
    price: 399,
    blurb: "Jam, driver, and cartridge issues",
  },
  {
    id: "cctv-checkup",
    name: "CCTV health check",
    categoryId: "cctv",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=700&q=80",
    rating: 4.81,
    price: 299,
    mrp: 549,
    blurb: "Camera, DVR, and remote viewing review",
  },
  {
    id: "onsite-visit",
    name: "General IT visit",
    categoryId: "onsite",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=700&q=80",
    rating: 4.8,
    price: 149,
    blurb: "A technician at your door for any IT issue",
  },
];

export const ALL_SERVICES: MarketService[] = [...MOST_BOOKED, ...NOTEWORTHY];

export function findService(id?: string | null) {
  if (!id) return undefined;
  return ALL_SERVICES.find((s) => s.id === id);
}

export function filterServices(q?: string | null, categoryId?: string | null) {
  const query = (q || "").trim().toLowerCase();
  return ALL_SERVICES.filter((s) => {
    const catOk = !categoryId || s.categoryId === categoryId;
    const qOk =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.categoryId.includes(query) ||
      (s.blurb || "").toLowerCase().includes(query);
    return catOk && qOk;
  });
}

export const CITY_KEY = "fl_city";
