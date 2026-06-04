// ---------------------------------------------------------------------------
// marketplace.api.js
//
// This is the API boundary for the Marketplace microservice.
// All data fetching goes through here — nothing in components touches
// fetch/axios directly.
//
// HOW TO CONNECT THE REAL BACKEND:
//   1. Set VITE_MARKETPLACE_API_URL in your .env file
//   2. Replace each function body with the commented-out fetch block below it
//   3. Keep the function signatures exactly the same — no component changes needed
// ---------------------------------------------------------------------------

import { MOCK_PRODUCTS, MOCK_STATS } from "../constants/mockData.js";

const BASE_URL = import.meta.env?.VITE_MARKETPLACE_API_URL ?? "";

// Simulates network latency in dev so loading states are testable
const fakeDelay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

// ── PRODUCTS ──────────────────────────────────────────────────

/**
 * Fetch product listings with optional filters.
 * @param {{ category?: string, district?: string, query?: string, sort?: string, page?: number, limit?: number }} params
 * @returns {Promise<{ products: Product[], total: number, page: number }>}
 */
export async function fetchProducts(params = {}) {
  await fakeDelay();

  // ── REAL IMPLEMENTATION (uncomment when backend is ready) ──
  // const url = new URL(`${BASE_URL}/api/marketplace/products`);
  // Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
  // const res = await fetch(url);
  // if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
  // return res.json();

  // ── MOCK IMPLEMENTATION ────────────────────────────────────
  let results = [...MOCK_PRODUCTS];

  if (params.category && params.category !== "all") {
    results = results.filter((p) => p.category === params.category);
  }
  if (params.district && params.district !== "all") {
    results = results.filter((p) => p.district === params.district);
  }
  if (params.query) {
    const q = params.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.en.toLowerCase().includes(q) ||
        p.title.st.toLowerCase().includes(q) ||
        p.farmer.name.en.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
    );
  }
  if (params.sort === "price-asc")  results.sort((a, b) => a.price - b.price);
  if (params.sort === "price-desc") results.sort((a, b) => b.price - a.price);
  if (params.sort === "rating")     results.sort((a, b) => b.rating - a.rating);

  return { products: results, total: results.length, page: 1 };
}

/**
 * Fetch a single product by ID.
 * @param {string} productId
 * @returns {Promise<Product>}
 */
export async function fetchProductById(productId) {
  await fakeDelay(300);

  // ── REAL ──
  // const res = await fetch(`${BASE_URL}/api/marketplace/products/${productId}`);
  // if (!res.ok) throw new Error(`Product not found: ${productId}`);
  // return res.json();

  const product = MOCK_PRODUCTS.find((p) => p.id === productId);
  if (!product) throw new Error(`Product not found: ${productId}`);
  return product;
}

// ── STATS ─────────────────────────────────────────────────────

/**
 * Fetch marketplace summary stats shown in the stats strip.
 * @returns {Promise<{ totalFarmers: number, totalDistricts: number, totalListings: number, avgRating: number }>}
 */
export async function fetchMarketplaceStats() {
  await fakeDelay(200);

  // ── REAL ──
  // const res = await fetch(`${BASE_URL}/api/marketplace/stats`);
  // if (!res.ok) throw new Error("Stats fetch failed");
  // return res.json();

  return { ...MOCK_STATS };
}

// ── ORDERS ────────────────────────────────────────────────────

/**
 * Submit an order request.
 * This talks to the Order microservice, not Marketplace directly.
 * @param {{ productId: string, farmerId: string, quantity: number, buyerContact: string }} payload
 * @returns {Promise<{ orderId: string, status: string }>}
 */
export async function submitOrderRequest(payload) {
  await fakeDelay(800);

  // ── REAL (Order microservice endpoint, not Marketplace) ──
  // const ORDER_API = import.meta.env.VITE_ORDER_API_URL;
  // const res = await fetch(`${ORDER_API}/api/orders`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload),
  // });
  // if (!res.ok) throw new Error("Order submission failed");
  // return res.json();

  console.log("[mock] Order submitted:", payload);
  return { orderId: `order_${Date.now()}`, status: "pending" };
}