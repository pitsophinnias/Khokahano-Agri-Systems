// ---------------------------------------------------------------------------
// Mock orders — mirrors the shape your Order API will return.
// Replace with real API calls in farmerPortal.api.js when backend is ready.
// ---------------------------------------------------------------------------

const now = Date.now();
const mins = (m) => now - m * 60 * 1000;

export const MOCK_FARMER = {
  id:       "farmer_001",
  name:     "Nthabiseng Mokoena",
  phone:    "+26658123456",
  district: "Maseru",
  village:  "Ha Thetsane",
};

export const MOCK_ORDERS = [
  {
    id:          "order_001",
    productId:   "prod_001",
    productTitle: { en: "Day-old broiler chicks", st: "Li-pjoana tsa li-broiler" },
    productImage: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200&q=70",
    qty:          50,
    unitPrice:    35,
    unit:         { en: "per chick", st: "ka pjoana" },
    total:        1750,
    currency:     "LSL",
    status:       "pending",
    placedAt:     mins(3),           // 3 minutes ago — timer counting down
    buyer: {
      name:    "Teboho Ntšekhe",
      phone:   "+26656234567",
      district:"Maseru",
      village: "Qoaling",
    },
    delivery: {
      method:  "delivery",
      address: "Qoaling, Maseru",
      phone:   "+26656234567",
    },
    payment: {
      method: "mpesa",
      number: "+266 56 234 567",
    },
    notes: "Please ensure chicks are vaccinated before delivery.",
  },
  {
    id:          "order_002",
    productId:   "prod_001",
    productTitle: { en: "Day-old broiler chicks", st: "Li-pjoana tsa li-broiler" },
    productImage: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200&q=70",
    qty:          100,
    unitPrice:    35,
    unit:         { en: "per chick", st: "ka pjoana" },
    total:        3500,
    currency:     "LSL",
    status:       "pending",
    placedAt:     mins(12),          // 12 minutes ago — already escalated
    buyer: {
      name:    "Malefa Ramakatane",
      phone:   "+26662109876",
      district:"Maseru",
      village: "Motimposo",
    },
    delivery: {
      method:  "pickup",
      address: "",
      phone:   "+26662109876",
    },
    payment: {
      method: "ecocash",
      number: "+266 62 109 876",
    },
    notes: "",
  },
  {
    id:          "order_003",
    productId:   "prod_001",
    productTitle: { en: "Day-old broiler chicks", st: "Li-pjoana tsa li-broiler" },
    productImage: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200&q=70",
    qty:          30,
    unitPrice:    35,
    unit:         { en: "per chick", st: "ka pjoana" },
    total:        1050,
    currency:     "LSL",
    status:       "preparing",
    placedAt:     mins(45),
    acceptedAt:   mins(42),
    buyer: {
      name:    "Lerato Mohlomi",
      phone:   "+26657890123",
      district:"Maseru",
      village: "Likotsi",
    },
    delivery: {
      method:  "delivery",
      address: "Likotsi, Maseru",
      phone:   "+26657890123",
    },
    payment: {
      method: "card",
      number: "**** 4521",
    },
    notes: "",
  },
  {
    id:          "order_004",
    productId:   "prod_001",
    productTitle: { en: "Day-old broiler chicks", st: "Li-pjoana tsa li-broiler" },
    productImage: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200&q=70",
    qty:          20,
    unitPrice:    35,
    unit:         { en: "per chick", st: "ka pjoana" },
    total:        700,
    currency:     "LSL",
    status:       "completed",
    placedAt:     mins(120),
    acceptedAt:   mins(118),
    completedAt:  mins(60),
    buyer: {
      name:    "Mots'elisi Lephoto",
      phone:   "+26658765432",
      district:"Maseru",
      village: "Ha Abia",
    },
    delivery: {
      method:  "pickup",
      address: "",
      phone:   "+26658765432",
    },
    payment: {
      method: "mpesa",
      number: "+266 58 765 432",
    },
    notes: "",
  },
];