// ---------------------------------------------------------------------------
// MOCK DATA — mirrors the shape your Marketplace API will return.
// When the backend is ready, marketplace.api.js fetches real JSON
// and this file becomes unused.
// ---------------------------------------------------------------------------

const IMG = {
  // Placeholder Unsplash images (replaced by real photos below)
  broilers:   "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=700&q=80",
  eggs:       "https://images.unsplash.com/photo-1518569656558-1f25e69d2fd4?w=700&q=80",
  feed:       "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=700&q=80",

  // Real product photos — place all files in: public/assets/products/
  liveBroilers:      "/assets/products/live-broilers.jpg",
  indChicken:        "/assets/products/ind-chicken.jpg",
  pointOfLay:        "/assets/products/point-of-lay.jpg",
  poultryFeeder:     "/assets/products/poultry-feeder.jpg",
  stressPack:        "/assets/products/stress-pack.jpg",
  broilerFinisher:   "/assets/products/broiler-finisher.jpg",
  eggsReal:          "/assets/products/eggs-mamatseliso.jpg",
  chickenAlotsi:     "/assets/products/chicken-alotsi.jpg",
  chickenMathapelo:  "/assets/products/chicken-mathapelo.jpg",
};

// ---------------------------------------------------------------------------
// PRODUCTS
// minOrder rules:
//   Day-old chicks → 20 (minimum viable batch for biosecurity)
//   Everything else → 1
// ---------------------------------------------------------------------------
export const MOCK_PRODUCTS = [

  // ── BROILERS ─────────────────────────────────────────────
  {
    id: "prod_001",
    category: "broilers",
    district: "Maseru",
    village: "Ha Thetsane",
    farmer: {
      id: "farmer_001",
      name: { en: "Nthabiseng Mokoena", st: "Nthabiseng Mokoena" },
      phone: "+26658123456",
      verified: true,
    },
    title: { en: "Day-old broiler chicks", st: "Li-tsuonyana tsa nama" },
    description: {
      en: "Healthy Ross 308 day-old chicks. Vaccinated against Marek's disease. Available every week from our certified hatchery.",
      st: "Li-tsuonyana tse phelang tsa Ross 308. Li entetsoe Marek. Li fumaneha beke le beke ho tsoa mothating oa rona.",
    },
    price: 35, currency: "LSL",
    unit: { en: "per chick", st: "ka tsuonyana" },
    stock: 500, minOrder: 20,
    badge: { type: "green", en: "In stock", st: "E teng" },
    rating: 4.8, reviews: 23,
    images: [IMG.broilers],
    createdAt: "2025-01-10T08:00:00Z",
  },
  {
    id: "prod_006",
    category: "broilers",
    district: "Berea",
    village: "Mapoteng",
    farmer: {
      id: "farmer_006",
      name: { en: "Lineo Ramaili", st: "Lineo Ramaili" },
      phone: "+26656789012",
      verified: false,
    },
    title: { en: "Live broilers (5\u20136 weeks)", st: "Likhoho tsa nama tse phelang (beke 5\u20136)" },
    description: {
      en: "Ready-to-slaughter broilers averaging 1.8\u20132.2 kg live weight. Raised on quality feed with strict biosecurity.",
      st: "Likhoho tsa nama tse loketsoeng ho hlajuoa. Boima ba tsona ke  kg 1.8\u20132.2. Ts\u2019ireletso e na teng.",
    },
    price: 95, currency: "LSL",
    unit: { en: "per bird", st: "ka nonyana" },
    stock: 200, minOrder: 1,
    badge: { type: "green", en: "In stock", st: "E teng" },
    rating: 4.5, reviews: 19,
    images: [IMG.liveBroilers],
    createdAt: "2025-01-16T06:00:00Z",
  },
  {
    id: "prod_009",
    category: "broilers",
    district: "Maseru",
    village: "Motimposo",
    farmer: {
      id: "farmer_009",
      name: { en: "Mathapelo Mohapinyane", st: "Mathapelo Mohapinyane" },
      phone: "+26658000003",
      verified: true,
    },
    title: { en: "Full broiler : slaughtered & wrapped", st: "Khoho ea nama e felletseng : e hlajuoeng" },
    description: {
      en: "Fresh whole broiler chickens, individually wrapped and ready for delivery or pickup in Maseru. Raised on quality feed with no hormones.",
      st: "Likhoho tsa nama tse foreshe, li phuthetsoe ka bo mong le tse loketsoeng ho rometsoang kapa ho nkeloa Maseru.",
    },
    price: 100, currency: "LSL",
    unit: { en: "per chicken", st: "ka khukhu" },
    stock: 50, minOrder: 1,
    badge: { type: "green", en: "In stock", st: "E teng" },
    rating: 4.8, reviews: 0,
    images: [IMG.chickenMathapelo],
    createdAt: "2026-06-08T07:00:00Z",
  },

  // ── LAYERS ───────────────────────────────────────────────
  {
    id: "prod_002",
    category: "layers",
    district: "Maseru",
    village: "Lithabaneng",
    farmer: {
      id: "farmer_002",
      name: { en: "Thabiso Letsie", st: "Thabiso Letsie" },
      phone: "+26662345678",
      verified: true,
    },
    title: { en: "Point-of-lay hens (16 wks)", st: "Likhukhu tse haufi le ho bua mae" },
    description: {
      en: "Lohmann Brown ready-to-lay pullets. Fully vaccinated. Excellent laying history from our parent flock.",
      st: "Li-Lohmann Brown tse loketsoeng ho bua mae. Li kolotsoa kaofela. Nalane e ntle ea ho bua mae.",
    },
    price: 180, currency: "LSL",
    unit: { en: "per bird", st: "ka nonyana" },
    stock: 120, minOrder: 1,
    badge: { type: "amber", en: "Low stock", st: "E fokola" },
    rating: 4.6, reviews: 15,
    images: [IMG.pointOfLay],
    createdAt: "2025-01-12T09:00:00Z",
  },
  {
    id: "prod_010",
    category: "layers",
    district: "Mafeteng",
    village: "Mafeteng Town",
    farmer: {
      id: "farmer_010",
      name: { en: "Pulane Mokhethi", st: "Pulane Mokhethi" },
      phone: "+26657001010",
      verified: true,
    },
    title: { en: "Point-of-lay pullets : ISA Brown", st: "Li-pullet tse haufi le ho bua mae : ISA Brown" },
    description: {
      en: "ISA Brown pullets at 17 weeks, just about to start laying. Vaccinated for Newcastle and Gumboro. Proven high-production line.",
      st: "Li-pullet tsa ISA Brown libekeng tse 17, li haufi le ho qala ho bua mae. Li kolotsitsoe Newcastle le Gumboro.",
    },
    price: 165, currency: "LSL",
    unit: { en: "per bird", st: "ka nonyana" },
    stock: 80, minOrder: 1,
    badge: { type: "green", en: "In stock", st: "E teng" },
    rating: 4.7, reviews: 6,
    images: [IMG.pointOfLay],
    createdAt: "2026-05-20T09:00:00Z",
  },

  // ── INDIGENOUS ───────────────────────────────────────────
  {
    id: "prod_004",
    category: "indigenous",
    district: "Berea",
    village: "Teyateyaneng",
    farmer: {
      id: "farmer_004",
      name: { en: "Retselisitsoe Molapo", st: "Retselisitsoe Molapo" },
      phone: "+26663457890",
      verified: true,
    },
    title: { en: "Indigenous chickens (mature, live)", st: "Likhukhu tsa naha (tse holile, tse phelang)" },
    description: {
      en: "Naturally raised Basotho indigenous chickens. No growth hormones, no antibiotics. Sold live or slaughtered on request.",
      st: "Likhukhu tsa Basotho tse holisitsoeng ka tlhaho. Ha ho makhomelo. Li ruisoa kapa li hlatsuoa ha o kopa.",
    },
    price: 120, currency: "LSL",
    unit: { en: "per bird", st: "ka nonyana" },
    stock: 45, minOrder: 1,
    badge: { type: "green", en: "In stock", st: "E teng" },
    rating: 5.0, reviews: 8,
    images: [IMG.indChicken],
    createdAt: "2025-01-08T10:00:00Z",
  },
  {
    id: "prod_008",
    category: "indigenous",
    district: "Butha-Buthe",
    village: "Butha-Buthe Town",
    farmer: {
      id: "farmer_008",
      name: { en: "Alotsi Thabelang", st: "Alotsi Thabelang" },
      phone: "+26658000002",
      verified: false,
    },
    title: { en: "Full indigenous chicken : slaughtered & packaged", st: "Khoho ea naha e felletseng : e hlajuoeng" },
    description: {
      en: "Whole indigenous chickens slaughtered fresh and individually vacuum-wrapped. Raised in Butha-Buthe on natural feed. Ready for cooking or freezing.",
      st: "Likhoho tsa naha tse hlajuoeng tse foreshe le ho phahamisoa ka ho iphapanyetsoa. Li holisitsoe Butha-Buthe ho mocha oa tlhaho.",
    },
    price: 120, currency: "LSL",
    unit: { en: "per chicken", st: "ka khukhu" },
    stock: 30, minOrder: 1,
    badge: { type: "green", en: "In stock", st: "E teng" },
    rating: 5.0, reviews: 0,
    images: [IMG.chickenAlotsi],
    createdAt: "2026-06-08T07:00:00Z",
  },
  {
    id: "prod_011",
    category: "indigenous",
    district: "Leribe",
    village: "Maputsoe",
    farmer: {
      id: "farmer_011",
      name: { en: "Nthabi Lefoka", st: "Nthabi Lefoka" },
      phone: "+26657001011",
      verified: true,
    },
    title: { en: "Free-range indigenous chickens", st: "Likhukhu tsa naha tsa ntle" },
    description: {
      en: "100% free-range Basotho chickens, raised on grass and grain with no chemicals. Available whole live or slaughtered. Flavour unlike commercial breeds.",
      st: "Likhukhu tsa Basotho tsa 100% tsa ntle, li holisitsoe joang le bojang ha ho na likhemikhale. Li fumaneha li phelang kapa li hlatsuoeng.",
    },
    price: 110, currency: "LSL",
    unit: { en: "per bird", st: "ka nonyana" },
    stock: 60, minOrder: 1,
    badge: { type: "green", en: "In stock", st: "E teng" },
    rating: 4.9, reviews: 12,
    images: [IMG.indChicken],
    createdAt: "2026-04-10T10:00:00Z",
  },

  // ── EGGS ─────────────────────────────────────────────────
  {
    id: "prod_007",
    category: "eggs",
    district: "Butha-Buthe",
    village: "Butha-Buthe Town",
    farmer: {
      id: "farmer_007",
      name: { en: "Mamatseliso Pitso", st: "Mamatseliso Pitso" },
      phone: "+26658000001",
      verified: true,
    },
    title: { en: "Fresh farm eggs : tray of 30", st: "Mae a polasi a foreshe : thepe ea 30" },
    description: {
      en: "Fresh eggs from our free-range layers in Butha-Buthe. Collected daily, healthy and naturally raised. Available every week.",
      st: "Mae a foreshe ho tsoa likhukhu tsa rona tsa ntle Butha-Buthe. A khokahanoa letsatsi le letsatsi, a phelang le ho holisoa ka tlhaho.",
    },
    price: 60, currency: "LSL",
    unit: { en: "per tray (30 eggs)", st: "ka thepe (mae a 30)" },
    stock: 150, minOrder: 1,
    badge: { type: "green", en: "In stock", st: "E teng" },
    rating: 4.9, reviews: 0,
    images: [IMG.eggsReal],
    createdAt: "2026-06-07T08:00:00Z",
  },
  {
    id: "prod_012",
    category: "eggs",
    district: "Mohale's Hoek",
    village: "Mohale's Hoek Town",
    farmer: {
      id: "farmer_012",
      name: { en: "Limakatso Nkhasi", st: "Limakatso Nkhasi" },
      phone: "+26657001012",
      verified: true,
    },
    title: { en: "Large brown eggs : commercial layers", st: "Mae a maholo a bosoeu : likhukhu tsa khoebo" },
    description: {
      en: "Large graded eggs from commercial ISA Brown layers. Consistent size and freshness. Available in trays of 30 year-round.",
      st: "Mae a maholo a hlahlojilloeng ho tsoa likhukhu tsa ISA Brown. Boholo le bofresh bo sa fetoheng. A fumaneha ka thepe ea 30 selemo kaofela.",
    },
    price: 55, currency: "LSL",
    unit: { en: "per tray (30)", st: "ka thepe (30)" },
    stock: 300, minOrder: 1,
    badge: { type: "green", en: "In stock", st: "E teng" },
    rating: 4.6, reviews: 28,
    images: [IMG.eggsReal],
    createdAt: "2026-03-01T08:00:00Z",
  },

  // ── FEED & SUPPLIES ──────────────────────────────────────
  {
    id: "prod_014",
    category: "feed",
    district: "Berea",
    village: "Teyateyaneng",
    farmer: {
      id: "farmer_014",
      name: { en: "Mapaseka Molapo", st: "Mapaseka Molapo" },
      phone: "+26657001014",
      verified: false,
    },
    title: { en: "Poultry drinker : 5 litre", st: "Seno sa likhukhu : litha tse 5" },
    description: {
      en: "5-litre gravity-fed poultry drinker with leg stands. Easy to fill and clean. Suitable for chicks and growers. Reduces water wastage on the farm.",
      st: "Seno sa likhukhu sa litha tse 5 se nang le maoto. Se bonolo ho tlatsa le ho hlatsa. Se lokela li-pjoana le likhukhu tse holang.",
    },
    price: 85, currency: "LSL",
    unit: { en: "per unit", st: "ka sona" },
    stock: 25, minOrder: 1,
    badge: { type: "green", en: "In stock", st: "E teng" },
    rating: 4.5, reviews: 9,
    images: [IMG.poultryFeeder],
    createdAt: "2026-04-15T10:00:00Z",
  },
  {
    id: "prod_015",
    category: "feed",
    district: "Maseru",
    village: "Maseru CBD",
    farmer: {
      id: "farmer_015",
      name: { en: "Agri Vet Maseru", st: "Agri Vet Maseru" },
      phone: "+26622001015",
      verified: true,
    },
    title: { en: "Phenix Stresspac : vitamin & electrolyte supplement", st: "Phenix Stresspac : setlhahiso sa livitamine le electrolyte" },
    description: {
      en: "Virbac Phenix Stresspac, soluble vitamins and electrolytes for poultry. Supports recovery from stress, disease, transport, and vaccinations. Mix in drinking water.",
      st: "Virbac Phenix Stresspac, livitamine le electrolyte tse qhibilikang bakeng sa likhukhu. E thusa ho khutlela tseleng ha ho na mefokolo, malwetse, kapa ho kolotsoa.",
    },
    price: 45, currency: "LSL",
    unit: { en: "per sachet", st: "ka sephahla" },
    stock: 120, minOrder: 1,
    badge: { type: "green", en: "In stock", st: "E teng" },
    rating: 4.9, reviews: 31,
    images: [IMG.stressPack],
    createdAt: "2026-03-10T08:00:00Z",
  },
];

export const MOCK_STATS = {
  totalFarmers:   57,
  totalDistricts: 10,
  totalListings:  240,
  avgRating:      4.8,
};