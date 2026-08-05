// ---------------------------------------------------------------------------
// marketplace.api.js
//
// All data fetching for the Marketplace microservice.
// Now connected to the real backend API.
// Base URL is set via VITE_MARKETPLACE_API_URL in .env.local
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// ── Auth token helpers ────────────────────────────────────────
export function getToken() {
  return localStorage.getItem("kh_token");
}

export function setToken(token) {
  localStorage.setItem("kh_token", token);
}

export function clearToken() {
  localStorage.removeItem("kh_token");
  localStorage.removeItem("kh_user");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("kh_user") ?? "null");
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem("kh_user", JSON.stringify(user));
}

// ── Base fetch wrapper ────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err  = new Error(body.error ?? `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

// ── PRODUCTS ──────────────────────────────────────────────────

/**
 * Fetch product listings with optional filters.
 * @param {{ category?, district?, query?, sort?, page?, limit? }} params
 */
export async function fetchProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== "all") query.set("category", params.category);
  if (params.district && params.district !== "all") query.set("district", params.district);
  if (params.query)  query.set("q",     params.query);
  if (params.sort)   query.set("sort",  params.sort);
  if (params.page)   query.set("page",  params.page);
  if (params.limit)  query.set("limit", params.limit);

  return apiFetch(`/api/products?${query.toString()}`);
}

/**
 * Fetch a single product by ID.
 */
export async function fetchProductById(productId) {
  return apiFetch(`/api/products/${productId}`);
}

// ── STATS ─────────────────────────────────────────────────────

/**
 * Fetch marketplace summary stats.
 */
export async function fetchMarketplaceStats() {
  try {
    return await apiFetch("/api/products/stats");
  } catch {
    return { totalFarmers: 57, totalDistricts: 10, totalListings: 240, avgRating: 4.8 };
  }
}

// ── AUTH ──────────────────────────────────────────────────────

/**
 * Register a new buyer account.
 */
export async function registerBuyer(data) {
  const result = await apiFetch("/api/auth/register/buyer", {
    method: "POST",
    body:   JSON.stringify(data),
  });
  setToken(result.token);
  setUser(result.user);
  return result;
}

/**
 * Register a new farmer account.
 */
export async function registerFarmer(data) {
  const result = await apiFetch("/api/auth/register/farmer", {
    method: "POST",
    body:   JSON.stringify(data),
  });
  setToken(result.token);
  setUser(result.user);
  return result;
}

/**
 * Login with email/phone and password.
 */
export async function login(identifier, password) {
  const result = await apiFetch("/api/auth/login", {
    method: "POST",
    body:   JSON.stringify({ identifier, password }),
  });
  setToken(result.token);
  setUser(result.user);
  return result;
}

/**
 * Logout — clears token and user from localStorage.
 */
export function logout() {
  clearToken();
}

/**
 * Get the currently authenticated user.
 */
export async function fetchMe() {
  return apiFetch("/api/auth/me");
}

// ── ORDERS ────────────────────────────────────────────────────

/**
 * Submit an order to the real backend.
 * Talks to the Order microservice endpoint.
 */
export async function submitOrderRequest(payload) {
  return apiFetch("/api/orders", {
    method: "POST",
    body:   JSON.stringify(payload),
  });
}

/**
 * Get all orders for the logged-in buyer.
 */
export async function fetchMyOrdersAsBuyer() {
  return apiFetch("/api/orders/my/buyer");
}

/**
 * Get all orders for the logged-in farmer.
 */
export async function fetchMyOrdersAsFarmer(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page)   query.set("page",   params.page);
  return apiFetch(`/api/orders/my/farmer?${query.toString()}`);
}

/**
 * Get farmer order stats.
 */
export async function fetchFarmerStats() {
  return apiFetch("/api/orders/my/stats");
}

/**
 * Update an order status (farmer action).
 */
export async function updateOrderStatus(orderId, status, extra = {}) {
  return apiFetch(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body:   JSON.stringify({ status, ...extra }),
  });
}

// ── FARMER PRODUCTS ───────────────────────────────────────────

/**
 * Get the logged-in farmer's own listings.
 */
export async function fetchMyListings() {
  return apiFetch("/api/products/my/listings");
}

/**
 * Create a new product listing (with image upload).
 */
export async function createProduct(formData) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/products`, {
    method:  "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body:    formData, // FormData — don't set Content-Type, browser does it
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create product");
  }
  return res.json();
}

/**
 * Update a product listing.
 */
export async function updateProduct(productId, data) {
  return apiFetch(`/api/products/${productId}`, {
    method: "PUT",
    body:   JSON.stringify(data),
  });
}

/**
 * Update stock quantity for a product.
 */
export async function updateStock(productId, quantity) {
  return apiFetch(`/api/products/${productId}/stock`, {
    method: "PATCH",
    body:   JSON.stringify({ quantity }),
  });
}

/**
 * Remove a product from the marketplace.
 */
export async function deleteProduct(productId) {
  return apiFetch(`/api/products/${productId}`, { method: "DELETE" });
}

// ── NOTIFICATIONS ─────────────────────────────────────────────

/**
 * Get notifications for the logged-in user.
 */
export async function fetchNotifications({ unreadOnly = false } = {}) {
  const query = unreadOnly ? "?unreadOnly=true" : "";
  return apiFetch(`/api/notifications${query}`);
}