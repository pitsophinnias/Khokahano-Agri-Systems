import { THEME } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

const NAV_STYLES = `
  .kh-nav {
    background: ${C.white};
    border-bottom: 1px solid ${C.line};
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    max-width: 100vw;
  }
  .kh-nav-row1 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 52px;
    overflow: hidden;
  }
  .kh-nav-row2 {
    display: flex;
    border-top: 1px solid ${C.line};
    overflow-x: auto;
    scrollbar-width: none;
  }
  .kh-nav-row2::-webkit-scrollbar { display: none; }
  .kh-nav-tab {
    flex: 1;
    padding: 9px 12px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-family: ${F.body};
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
    color: ${C.inkMid};
    font-weight: 400;
    text-align: center;
    transition: color 0.15s, border-color 0.15s;
  }
  .kh-nav-tab.active {
    color: ${C.green};
    border-bottom-color: ${C.green};
    font-weight: 500;
  }
  .kh-brand-text { display: flex; flex-direction: column; }
  .kh-list-label { display: none; }
  .kh-orders-label { display: none; }
  @media (max-width: 360px) { .kh-brand-text { display: none; } }
  @media (min-width: 480px) {
    .kh-list-label   { display: inline; }
    .kh-orders-label { display: inline; }
  }
  /* Desktop: collapse into single row */
  @media (min-width: 640px) {
    .kh-nav {
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0 20px;
      gap: 0;
    }
    .kh-nav-row1 {
      flex: 1;
      height: auto;
      padding: 0;
      overflow: visible;
    }
    .kh-nav-row2 { border-top: none; flex: none; }
    .kh-nav-tab  { padding: 6px 14px; flex: none; }
    .kh-list-label   { display: inline; }
    .kh-orders-label { display: inline; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("kh-nav-styles")) {
  const el = document.createElement("style");
  el.id = "kh-nav-styles";
  el.textContent = NAV_STYLES;
  document.head.appendChild(el);
}

export default function Navbar({
  lang,
  setLang,
  t,
  view,
  onNavigate,
  cartCount,
  onCartOpen,
  orderCount,      // number of active buyer orders
  onOrdersOpen,    // opens BuyerOrdersPanel
}) {
  const NAV_ITEMS = [
    { key: "marketplace", label: t("nav_marketplace") },
    { key: "about",       label: t("nav_about") },
  ];

  return (
    <nav className="kh-nav">
      {/* ── Row 1: brand + right controls ── */}
      <div className="kh-nav-row1">

        {/* Brand */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0, minWidth: 0 }}
          onClick={() => onNavigate("marketplace")}
        >
          <img
            src={THEME.brand.logoUrl}
            alt="Khokahano logo"
            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          {/* Fallback initial */}
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: C.green,
            display: "none", alignItems: "center", justifyContent: "center",
            fontFamily: F.display, fontSize: 15, color: "#fff", flexShrink: 0,
          }}>K</div>

          <div className="kh-brand-text">
            <span style={{ fontFamily: F.display, fontSize: 15, color: C.ink, lineHeight: 1 }}>
              {THEME.brand.name}
            </span>
            <span style={{ fontSize: 9, color: C.inkLight, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 1 }}>
              {THEME.brand.sub}
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

          {/* Language toggle hidden — English only for now.
               To restore: add the EN/ST button group back here.
               Translations are still fully wired in translations.js */}

          {/* My Orders button */}
          <button
            onClick={onOrdersOpen}
            aria-label="My orders"
            style={{
              position: "relative",
              background: "none",
              border: `1px solid ${C.line}`,
              padding: "6px 10px",
              borderRadius: 4,
              fontSize: 15,
              cursor: "pointer",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: C.inkMid,
              fontFamily: F.body,
            }}
          >
            📋
            <span className="kh-orders-label" style={{ fontSize: 11, fontWeight: 500 }}>
              My Orders
            </span>
            {/* Badge — shows count of non-completed active orders */}
            {orderCount > 0 && (
              <span style={{
                position: "absolute", top: -5, right: -5,
                background: C.green, color: "#fff",
                fontSize: 9, fontWeight: 700,
                width: 16, height: 16, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {orderCount > 9 ? "9+" : orderCount}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={onCartOpen}
            aria-label="Open cart"
            style={{
              position: "relative",
              background: "none",
              border: `1px solid ${C.line}`,
              padding: "6px 10px",
              borderRadius: 4,
              fontSize: 15,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            🛒
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: -5, right: -5,
                background: C.green, color: "#fff",
                fontSize: 9, fontWeight: 700,
                width: 16, height: 16, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* List products */}
          <button
            onClick={() => onNavigate("subscribe")}
            style={{
              background: C.green, color: "#fff", border: "none",
              padding: "7px 12px", borderRadius: 4, fontSize: 12,
              fontWeight: 500, cursor: "pointer", fontFamily: F.body,
              whiteSpace: "nowrap",
            }}
          >
            +<span className="kh-list-label"> {t("list_btn")}</span>
          </button>
        </div>
      </div>

      {/* ── Row 2: page tabs ── */}
      <div className="kh-nav-row2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`kh-nav-tab${view === item.key ? " active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}