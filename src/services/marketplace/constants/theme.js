export const THEME = {
  colors: {
    green:      "#1c4a1c",
    greenMid:   "#2a6b2a",
    greenLight: "#e8f0e8",
    gold:       "#b8860b",
    goldLight:  "#f5f0e8",
    ink:        "#1a1a18",
    inkMid:     "#4a4a44",
    inkLight:   "#8a8a80",
    line:       "#e2e0da",
    bg:         "#f7f6f3",
    white:      "#ffffff",
  },
  fonts: {
    display: "'Instrument Serif', Georgia, serif",
    body:    "'Geist', system-ui, sans-serif",
  },
  brand: {
    name:    "Khokahano",
    sub:     "Agri Systems",
    tagline: "Connect. Coordinate. Grow. Succeed.",
    // Place the logo file at: public/assets/logo.png
    // The file is included in your download as khokahano_logo.jpg
    // Rename it to logo.png (or logo.jpg) and put it in the public/assets/ folder
    logoUrl: "/assets/logo.png",
  },
  contact: {
    phone:   "+266 57638217",
    email:   "bokangmpholo7@gmail.com",
    website: "www.khokahanoagrisystems.ls",
  },
  social: {
    facebook:  "https://facebook.com/khokahanoagrisystems",
    instagram: "https://instagram.com/khokahanoagrisystems",
    whatsapp:  "https://wa.me/26657638217",
  },
};

export const DISTRICTS = [
  "Maseru", "Leribe", "Berea", "Butha-Buthe", "Mokhotlong",
  "Mafeteng", "Mohale's Hoek", "Qacha's Nek", "Quthing", "Thaba-Tseka",
];

export const CATEGORIES = [
  { key: "all" },
  { key: "broilers" },
  { key: "layers" },
  { key: "indigenous" },
  { key: "eggs" },
  { key: "feed" },
];

export const SUBSCRIPTION_PLANS = [
  {
    key: "basic",
    price: 50,
    features: {
      en: ["Access to training materials", "WhatsApp support", "Market information"],
      st: ["Phihlello ea lisebelisoa tsa koetliso", "Tšehetso ea WhatsApp", "Tlhahisoleseling ea mmaraka"],
    },
  },
  {
    key: "growth",
    price: 100,
    features: {
      en: ["Everything in Basic", "Market access", "Production planning tools", "Performance reports"],
      st: ["Tsohle tsa Basic", "Phihlello ea mmaraka", "Lisebelisoa tsa moralo oa tlhahiso", "Lithepa tsa ts'ebetso"],
    },
  },
  {
    key: "premium",
    price: 150,
    features: {
      en: ["Everything in Growth", "Priority market access", "Loan eligibility", "Business advisory & analytics"],
      st: ["Tsohle tsa Growth", "Phihlello ea pele ea mmaraka", "Tšoanelo ea kalimo", "Keletso ea khoebo le tlhatlhobo"],
    },
  },
];