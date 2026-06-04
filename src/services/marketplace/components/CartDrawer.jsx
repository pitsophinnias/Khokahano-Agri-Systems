import { THEME } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

function CartItem({ item, lang, onRemove, onQtyChange }) {
  const title  = typeof item.title  === "object" ? item.title[lang]  : item.title;
  const unit   = typeof item.unit   === "object" ? item.unit[lang]   : item.unit;
  const farmer = typeof item.farmer === "object" ? item.farmer[lang] : item.farmer;

  return (
    <div style={{
      display: "flex", gap: 12, padding: "14px 0",
      borderBottom: `1px solid ${C.line}`,
    }}>
      <img
        src={item.image}
        alt={title}
        style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 2, flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: F.display, fontSize: 14, color: C.ink, marginBottom: 2, lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontSize: 11, color: C.inkLight, marginBottom: 8 }}>{farmer}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Qty controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => onQtyChange(item.id, item.qty - 1)}
              style={{
                width: 26, height: 26, border: `1px solid ${C.line}`,
                borderRadius: 2, background: C.white, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: C.ink,
              }}
            >−</button>
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
            <button
              onClick={() => onQtyChange(item.id, item.qty + 1)}
              style={{
                width: 26, height: 26, border: `1px solid ${C.line}`,
                borderRadius: 2, background: C.white, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: C.ink,
              }}
            >+</button>
          </div>

          {/* Price + remove */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: C.green }}>
              M {(item.price * item.qty).toLocaleString()}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: C.inkLight, fontSize: 16, lineHeight: 1,
                padding: "2px 4px",
              }}
            >✕</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer({ items, total, lang, t, onRemove, onQtyChange, onClose, onCheckout }) {
  const isEmpty = items.length === 0;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .cart-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(380px, 100vw);
          background: ${C.white};
          z-index: 400;
          display: flex; flex-direction: column;
          box-shadow: -4px 0 24px rgba(0,0,0,0.12);
          animation: slideInRight 0.25s ease;
        }
        .cart-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 399;
        }
      `}</style>

      <div className="cart-overlay" onClick={onClose} />

      <div className="cart-drawer">
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: `1px solid ${C.line}`,
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: F.display, fontSize: 18, color: C.ink }}>
            {t("cart_title")}
            {!isEmpty && (
              <span style={{
                marginLeft: 8, fontSize: 12, color: C.inkLight,
                fontFamily: F.body, fontWeight: 400,
              }}>
                ({items.length} {t("cart_items")})
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, border: `1px solid ${C.line}`,
              borderRadius: 4, background: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, color: C.inkMid,
            }}
          >✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
          {isEmpty ? (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 14 }}>🛒</div>
              <div style={{ fontFamily: F.display, fontSize: 18, color: C.ink, marginBottom: 8 }}>
                {t("cart_empty")}
              </div>
              <div style={{ fontSize: 13, color: C.inkLight }}>{t("cart_empty_sub")}</div>
            </div>
          ) : (
            items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                lang={lang}
                onRemove={onRemove}
                onQtyChange={onQtyChange}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div style={{
            padding: "16px 20px",
            borderTop: `1px solid ${C.line}`,
            flexShrink: 0,
            background: C.white,
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              marginBottom: 14,
            }}>
              <span style={{ fontSize: 13, color: C.inkMid }}>{t("cart_total")}</span>
              <span style={{ fontFamily: F.display, fontSize: 22, color: C.ink }}>
                M {total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={onCheckout}
              style={{
                width: "100%", padding: "13px",
                background: C.green, color: "#fff",
                border: "none", borderRadius: 4,
                fontSize: 14, fontWeight: 500,
                cursor: "pointer", fontFamily: F.body,
              }}
            >
              {t("cart_checkout")}
            </button>
            <p style={{ fontSize: 11, color: C.inkLight, textAlign: "center", marginTop: 8 }}>
              {t("cart_hint")}
            </p>
          </div>
        )}
      </div>
    </>
  );
}