import { useState } from "react";
import { registerBuyerOrder } from "../hooks/useBuyerOrders.js";
import { THEME } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

const STEPS = ["delivery", "payment", "confirm"];

const PAYMENT_METHODS = [
  { key: "mpesa",   label: "M-Pesa",   icon: "📱", color: "#4CAF50", hint: "Enter your M-Pesa number" },
  { key: "ecocash", label: "EcoCash",  icon: "💳", color: "#FF6B00", hint: "Enter your EcoCash number" },
  { key: "card",    label: "Card",     icon: "🏦", color: "#1a4fa0", hint: "Enter your card details" },
];

function StepIndicator({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 24 }}>
      {STEPS.map((s, i) => {
        const done    = STEPS.indexOf(step) > i;
        const current = step === s;
        return (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: done ? C.green : current ? C.green : C.bg,
              border: `2px solid ${done || current ? C.green : C.line}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600,
              color: done || current ? "#fff" : C.inkLight,
            }}>
              {done ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 40, height: 2,
                background: done ? C.green : C.line,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DeliveryStep({ t, onNext }) {
  const [method, setMethod]   = useState("pickup");
  const [address, setAddress] = useState("");
  const [phone, setPhone]     = useState("");

  const valid = method === "pickup" || (address.trim().length > 3 && phone.trim().length > 5);

  return (
    <div>
      <h3 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 400, marginBottom: 20 }}>
        {t("delivery_heading")}
      </h3>

      {/* Method toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
        {[
          { key: "pickup",   label: t("delivery_pickup"),   icon: "🏪" },
          { key: "delivery", label: t("delivery_deliver"),  icon: "🚚" },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setMethod(opt.key)}
            style={{
              padding: "16px 12px",
              border: `2px solid ${method === opt.key ? C.green : C.line}`,
              borderRadius: 4, background: method === opt.key ? C.greenLight : C.white,
              cursor: "pointer", fontFamily: F.body,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}
          >
            <span style={{ fontSize: 24 }}>{opt.icon}</span>
            <span style={{ fontSize: 13, fontWeight: method === opt.key ? 600 : 400, color: C.ink }}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {method === "pickup" && (
        <div style={{
          background: C.greenLight, borderLeft: `3px solid ${C.green}`,
          padding: "12px 14px", fontSize: 13, color: "#1c4a1c", lineHeight: 1.6,
        }}>
          {t("delivery_pickup_note")}
        </div>
      )}

      {method === "delivery" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: C.ink, display: "block", marginBottom: 6 }}>
              {t("delivery_address")}
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("delivery_address_ph")}
              style={{
                width: "100%", padding: "10px 12px",
                border: `1px solid ${C.line}`, borderRadius: 4,
                fontSize: 14, fontFamily: F.body, color: C.ink,
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: C.ink, display: "block", marginBottom: 6 }}>
              {t("delivery_phone")}
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+266 5X XXX XXX"
              style={{
                width: "100%", padding: "10px 12px",
                border: `1px solid ${C.line}`, borderRadius: 4,
                fontSize: 14, fontFamily: F.body, color: C.ink,
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: C.inkLight }}>
            {t("delivery_fee_note")}
          </div>
        </div>
      )}

      <button
        disabled={!valid}
        onClick={() => onNext({ method, address, phone })}
        style={{
          width: "100%", padding: 13, marginTop: 20,
          background: valid ? C.green : C.line,
          color: valid ? "#fff" : C.inkLight,
          border: "none", borderRadius: 4,
          fontSize: 14, fontWeight: 500,
          cursor: valid ? "pointer" : "default",
          fontFamily: F.body,
        }}
      >
        {t("next_btn")}
      </button>
    </div>
  );
}

function PaymentStep({ total, t, onNext, onBack }) {
  const [method, setMethod] = useState(null);
  const [number, setNumber] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv,    setCvv]    = useState("");

  const pm = PAYMENT_METHODS.find((p) => p.key === method);

  const valid =
    method === "mpesa"   ? number.trim().length > 7 :
    method === "ecocash" ? number.trim().length > 7 :
    method === "card"    ? cardNo.length > 14 && expiry.length === 5 && cvv.length === 3 :
    false;

  return (
    <div>
      <h3 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 400, marginBottom: 20 }}>
        {t("payment_heading")}
      </h3>

      {/* Method cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {PAYMENT_METHODS.map((pm) => (
          <button
            key={pm.key}
            onClick={() => setMethod(pm.key)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px",
              border: `2px solid ${method === pm.key ? pm.color : C.line}`,
              borderRadius: 4, background: C.white,
              cursor: "pointer", fontFamily: F.body, textAlign: "left",
            }}
          >
            <span style={{ fontSize: 22 }}>{pm.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{pm.label}</div>
              <div style={{ fontSize: 11, color: C.inkLight }}>{pm.hint}</div>
            </div>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              border: `2px solid ${method === pm.key ? pm.color : C.line}`,
              background: method === pm.key ? pm.color : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {method === pm.key && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
            </div>
          </button>
        ))}
      </div>

      {/* Input fields */}
      {(method === "mpesa" || method === "ecocash") && (
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: C.ink, display: "block", marginBottom: 6 }}>
            {method === "mpesa" ? "M-Pesa" : "EcoCash"} {t("payment_number")}
          </label>
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="+266 5X XXX XXX"
            style={{
              width: "100%", padding: "10px 12px",
              border: `1px solid ${C.line}`, borderRadius: 4,
              fontSize: 14, fontFamily: F.body, color: C.ink,
            }}
          />
          <p style={{ fontSize: 11, color: C.inkLight, marginTop: 8 }}>
            {t("payment_push_note")}
          </p>
        </div>
      )}

      {method === "card" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: C.ink, display: "block", marginBottom: 6 }}>
              {t("card_number")}
            </label>
            <input
              value={cardNo}
              maxLength={19}
              onChange={(e) => setCardNo(e.target.value.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim())}
              placeholder="1234 5678 9012 3456"
              style={{
                width: "100%", padding: "10px 12px",
                border: `1px solid ${C.line}`, borderRadius: 4,
                fontSize: 14, fontFamily: F.body, letterSpacing: "0.1em",
              }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.ink, display: "block", marginBottom: 6 }}>
                {t("card_expiry")}
              </label>
              <input
                value={expiry}
                maxLength={5}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g,"");
                  if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2);
                  setExpiry(v);
                }}
                placeholder="MM/YY"
                style={{
                  width: "100%", padding: "10px 12px",
                  border: `1px solid ${C.line}`, borderRadius: 4,
                  fontSize: 14, fontFamily: F.body,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.ink, display: "block", marginBottom: 6 }}>
                CVV
              </label>
              <input
                value={cvv}
                maxLength={3}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g,""))}
                placeholder="123"
                style={{
                  width: "100%", padding: "10px 12px",
                  border: `1px solid ${C.line}`, borderRadius: 4,
                  fontSize: 14, fontFamily: F.body,
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <button
          onClick={onBack}
          style={{
            flex: 1, padding: 13, border: `1px solid ${C.line}`,
            borderRadius: 4, background: "none",
            fontSize: 13, cursor: "pointer", fontFamily: F.body, color: C.inkMid,
          }}
        >
          {t("back_btn")}
        </button>
        <button
          disabled={!valid}
          onClick={() => onNext({ method, number, cardNo, expiry, cvv })}
          style={{
            flex: 2, padding: 13,
            background: valid ? C.green : C.line,
            color: valid ? "#fff" : C.inkLight,
            border: "none", borderRadius: 4,
            fontSize: 14, fontWeight: 500,
            cursor: valid ? "pointer" : "default",
            fontFamily: F.body,
          }}
        >
          {t("next_btn")}
        </button>
      </div>
    </div>
  );
}

function ConfirmStep({ items, total, delivery, payment, lang, t, onBack, onConfirm, confirming, confirmed }) {
  if (confirmed) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <div style={{ fontFamily: F.display, fontSize: 22, color: C.ink, marginBottom: 8 }}>
          {t("order_placed")}
        </div>
        <div style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
          {t("order_placed_desc")}
        </div>
      </div>
    );
  }

  const pm = PAYMENT_METHODS.find((p) => p.key === payment.method);

  return (
    <div>
      <h3 style={{ fontFamily: F.display, fontSize: 18, fontWeight: 400, marginBottom: 20 }}>
        {t("confirm_heading")}
      </h3>

      {/* Order summary */}
      <div style={{ background: C.bg, borderRadius: 4, padding: 14, marginBottom: 14 }}>
        {items.map((item) => {
          const title = typeof item.title === "object" ? item.title[lang] : item.title;
          return (
            <div key={item.id} style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 13, marginBottom: 6, color: C.ink,
            }}>
              <span>{title} ×{item.qty}</span>
              <span style={{ fontWeight: 500 }}>M {(item.price * item.qty).toLocaleString()}</span>
            </div>
          );
        })}
        <div style={{
          borderTop: `1px solid ${C.line}`, paddingTop: 10, marginTop: 6,
          display: "flex", justifyContent: "space-between",
          fontFamily: F.display, fontSize: 18, color: C.ink,
        }}>
          <span>{t("cart_total")}</span>
          <span>M {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Delivery */}
      <div style={{ fontSize: 13, color: C.inkMid, marginBottom: 8 }}>
        <span style={{ fontWeight: 500, color: C.ink }}>{t("delivery_heading")}: </span>
        {delivery.method === "pickup" ? t("delivery_pickup") : `${t("delivery_deliver")} — ${delivery.address}`}
      </div>

      {/* Payment */}
      <div style={{ fontSize: 13, color: C.inkMid, marginBottom: 20 }}>
        <span style={{ fontWeight: 500, color: C.ink }}>{t("payment_heading")}: </span>
        {pm?.icon} {pm?.label}
        {payment.number ? ` (${payment.number})` : ""}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onBack}
          style={{
            flex: 1, padding: 13, border: `1px solid ${C.line}`,
            borderRadius: 4, background: "none",
            fontSize: 13, cursor: "pointer", fontFamily: F.body, color: C.inkMid,
          }}
        >
          {t("back_btn")}
        </button>
        <button
          onClick={onConfirm}
          disabled={confirming}
          style={{
            flex: 2, padding: 13,
            background: confirming ? C.inkLight : C.green,
            color: "#fff", border: "none", borderRadius: 4,
            fontSize: 14, fontWeight: 500,
            cursor: confirming ? "default" : "pointer",
            fontFamily: F.body,
          }}
        >
          {confirming ? t("placing_order") : t("place_order_btn")}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutModal({ items, total, lang, t, onClose, onSuccess }) {
  const [step, setStep]         = useState("delivery");
  const [delivery, setDelivery] = useState(null);
  const [payment, setPayment]   = useState(null);
  const [confirming, setConf]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    setConf(true);

    // ── REAL: POST to /api/orders ──
    await new Promise((r) => setTimeout(r, 1500));

    // Register each cart item as a buyer order so the
    // buyer can track status in the My Orders panel.
    items.forEach((item) => {
      const orderId = `order_${Date.now()}_${item.id}`;
      registerBuyerOrder({
        id:           orderId,
        productId:    item.id,
        productTitle: item.title,
        productImage: item.image,
        qty:          item.qty,
        unitPrice:    item.price,
        unit:         item.unit,
        total:        item.price * item.qty,
        currency:     "LSL",
        status:       "pending",
        placedAt:     Date.now(),
        farmer:       item.farmer,
        district:     item.district,
        delivery:     delivery ?? { method: "pickup" },
        payment:      payment  ?? { method: "unknown" },
        notes:        "",
      });
    });

    setConf(false);
    setConfirmed(true);
    setTimeout(() => {
      onSuccess(); // clears cart
      onClose();
    }, 3000);
  };

  return (
    <>
      <style>{`
        .co-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 500;
          display: flex; align-items: flex-end; justify-content: center;
        }
        @media (min-width: 600px) {
          .co-overlay { align-items: center; }
        }
        .co-box {
          background: ${C.white};
          width: 100%; max-width: 480px;
          border-radius: 8px 8px 0 0;
          max-height: 90vh;
          overflow-y: auto;
        }
        @media (min-width: 600px) {
          .co-box { border-radius: 6px; max-height: 85vh; }
        }
      `}</style>

      <div className="co-overlay" onClick={onClose}>
        <div className="co-box" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 20px", borderBottom: `1px solid ${C.line}`,
            position: "sticky", top: 0, background: C.white, zIndex: 1,
          }}>
            <div style={{ fontFamily: F.display, fontSize: 18, color: C.ink }}>
              {t("checkout_title")}
            </div>
            <button onClick={onClose} style={{
              width: 30, height: 30, border: `1px solid ${C.line}`,
              borderRadius: 4, background: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: C.inkMid,
            }}>✕</button>
          </div>

          <div style={{ padding: 20 }}>
            <StepIndicator step={step} />

            {step === "delivery" && (
              <DeliveryStep
                t={t}
                onNext={(data) => { setDelivery(data); setStep("payment"); }}
              />
            )}
            {step === "payment" && (
              <PaymentStep
                total={total} t={t}
                onNext={(data) => { setPayment(data); setStep("confirm"); }}
                onBack={() => setStep("delivery")}
              />
            )}
            {step === "confirm" && (
              <ConfirmStep
                items={items} total={total} delivery={delivery} payment={payment}
                lang={lang} t={t}
                onBack={() => setStep("payment")}
                onConfirm={handleConfirm}
                confirming={confirming}
                confirmed={confirmed}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}