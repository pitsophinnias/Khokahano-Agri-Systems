import { useState, useEffect, useCallback } from "react";
import { THEME } from "../constants/theme.js";
import { useProducts }     from "../hooks/useProducts.js";
import { useLanguage }     from "../hooks/useLanguage.js";
import { useLocation }     from "../hooks/useLocation.js";
import { useCart }         from "../hooks/useCart.js";
import { useView }         from "../hooks/useView.js";
import { useBuyerOrders }  from "../hooks/useBuyerOrders.js";

import Navbar              from "../components/Navbar.jsx";
import Hero                from "../components/Hero.jsx";
import StatsStrip          from "../components/StatsStrip.jsx";
import FilterBar           from "../components/FilterBar.jsx";
import ProductGrid         from "../components/ProductGrid.jsx";
import ProductModal        from "../components/ProductModal.jsx";
import LocationBanner      from "../components/LocationBanner.jsx";
import CartDrawer          from "../components/CartDrawer.jsx";
import CheckoutModal       from "../components/CheckoutModal.jsx";
import BuyerOrdersPanel    from "../components/BuyerOrdersPanel.jsx";
import NotificationToast   from "../../farmer-portal/components/NotificationToast.jsx";
import Footer              from "../components/Footer.jsx";

import AboutPage           from "./AboutPage.jsx";
import SubscribePage       from "./SubscribePage.jsx";

const C = THEME.colors;

export default function MarketplacePage() {
  const { lang, setLang, t, lf }                              = useLanguage("en");
  const { products, stats, loading, error, filters,
          setFilter, retry }                                   = useProducts();
  const { district: geoDistrict, showBanner, detecting,
          requestLocation, denyLocation }                      = useLocation();
  const { items: cartItems, total: cartTotal, itemCount,
          addItem, removeItem, updateQty, clearCart }          = useCart();
  const { view, navigate }                                     = useView("marketplace");

  const [modal,         setModal]         = useState(null);
  const [cartOpen,      setCartOpen]      = useState(false);
  const [checkoutOpen,  setCheckoutOpen]  = useState(false);
  const [ordersOpen,    setOrdersOpen]    = useState(false);

  // ── Buyer order status notifications ─────────────────────
  const [toasts, setToasts] = useState([]);

  const handleStatusChange = useCallback(({ orderId, status, message, icon, declineReason }) => {
    const id = `toast_${orderId}_${status}`;
    setToasts((prev) => {
      if (prev.find((t) => t.id === id)) return prev; // deduplicate
      return [{ id, type: status === "declined" ? "escalation" : "new_order", title: `${icon} Order update`, message }, ...prev].slice(0, 4);
    });
    // Auto-dismiss after 7s
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 7000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const { orders: buyerOrders, clearCompleted } = useBuyerOrders({
    onStatusChange: handleStatusChange,
  });

  // Active order count — only non-terminal orders get a badge
  const activeOrderCount = buyerOrders.filter(
    (o) => !["completed", "declined"].includes(o.status)
  ).length;

  // ── Geolocation auto-filter ───────────────────────────────
  useEffect(() => {
    if (geoDistrict && geoDistrict !== "all") {
      setFilter({ district: geoDistrict });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoDistrict]);

  const handleSearch    = ({ query, district }) => setFilter({ query, district });
  const handleAddToCart = (product, qty) => { addItem(product, qty); setModal(null); };

  return (
    <div style={{
      fontFamily: THEME.fonts.body,
      background: C.bg,
      color: C.ink,
      minHeight: "100vh",
      WebkitFontSmoothing: "antialiased",
    }}>
      {/* ── Navbar ── */}
      <Navbar
        lang={lang}
        setLang={setLang}
        t={t}
        view={view}
        onNavigate={navigate}
        cartCount={itemCount}
        onCartOpen={() => setCartOpen(true)}
        orderCount={activeOrderCount}
        onOrdersOpen={() => setOrdersOpen(true)}
      />

      {/* ── Page views ── */}
      {view === "about" && (
        <>
          <AboutPage t={t} />
          <Footer t={t} onNavigate={navigate} />
        </>
      )}

      {view === "subscribe" && (
        <>
          <SubscribePage lang={lang} t={t} onBack={() => navigate("marketplace")} />
          <Footer t={t} onNavigate={navigate} />
        </>
      )}

      {view === "marketplace" && (
        <>
          <Hero t={t} onSearch={handleSearch} />
          <StatsStrip stats={stats} t={t} />

          <main style={{ maxWidth: 1060, margin: "0 auto", padding: "28px 16px 60px" }}>
            <div style={{ marginBottom: 22 }}>
              <p style={{
                fontSize: 11, fontWeight: 500, letterSpacing: "0.1em",
                textTransform: "uppercase", color: C.inkLight, marginBottom: 6,
              }}>
                {t("marketplace_label")}
              </p>
              <h2 style={{
                fontFamily: THEME.fonts.display,
                fontSize: "clamp(20px,3vw,28px)",
                fontWeight: 400, color: C.ink,
              }}>
                Fresh from local farms,{" "}
                <em style={{ fontStyle: "italic", color: C.greenMid }}>in your district.</em>
              </h2>
              {geoDistrict && geoDistrict !== "all" && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  marginTop: 8, fontSize: 12, color: C.green,
                  background: C.greenLight, padding: "4px 10px", borderRadius: 20,
                }}>
                  📍 {t("loc_detected")} {geoDistrict}
                </div>
              )}
            </div>

            <FilterBar filters={filters} setFilter={setFilter} total={products.length} t={t} />

            <ProductGrid
              products={products}
              loading={loading}
              error={error}
              onRetry={retry}
              onOpen={(product, tab) => setModal({ product, tab })}
              lf={lf}
              t={t}
            />
          </main>

          <Footer t={t} onNavigate={navigate} />
        </>
      )}

      {/* ── Global overlays ── */}

      {showBanner && (
        <LocationBanner onAllow={requestLocation} onDeny={denyLocation} detecting={detecting} t={t} />
      )}

      {modal && (
        <ProductModal
          product={modal.product}
          initialTab={modal.tab}
          lf={lf} t={t}
          onClose={() => setModal(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {cartOpen && (
        <CartDrawer
          items={cartItems} total={cartTotal} lang={lang} t={t}
          onRemove={removeItem} onQtyChange={updateQty}
          onClose={() => setCartOpen(false)}
          onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          items={cartItems} total={cartTotal} lang={lang} t={t}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={clearCart}
        />
      )}

      {/* My Orders panel */}
      {ordersOpen && (
        <BuyerOrdersPanel
          orders={buyerOrders}
          lang={lang}
          onClose={() => setOrdersOpen(false)}
          onClearCompleted={clearCompleted}
        />
      )}

      {/* Order status update toasts */}
      <NotificationToast notifications={toasts} onDismiss={dismissToast} />
    </div>
  );
}