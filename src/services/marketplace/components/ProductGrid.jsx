import ProductCard from "./ProductCard.jsx";
import { THEME } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

function LoadingSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ background: C.white, display: "flex", flexDirection: "column" }}>
          <div style={{ width: "100%", aspectRatio: "4/3", background: "#ece9e3", animation: "pulse 1.4s ease-in-out infinite" }} />
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ height: 14, width: "70%", background: "#ece9e3", borderRadius: 2 }} />
            <div style={{ height: 10, width: "100%", background: "#ece9e3", borderRadius: 2 }} />
            <div style={{ height: 10, width: "80%", background: "#ece9e3", borderRadius: 2 }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </>
  );
}

function EmptyState({ t }) {
  return (
    <div style={{
      gridColumn: "1 / -1",
      padding: "60px 20px",
      textAlign: "center",
      background: C.white,
    }}>
      <div style={{ fontFamily: F.display, fontSize: 22, color: C.ink, marginBottom: 8, fontWeight: 400 }}>
        {t("no_results")}
      </div>
      <div style={{ fontSize: 14, color: C.inkLight }}>
        {t("no_results_sub")}
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry, t }) {
  return (
    <div style={{
      gridColumn: "1 / -1",
      padding: "60px 20px",
      textAlign: "center",
      background: C.white,
    }}>
      <div style={{ fontSize: 14, color: "#a32d2d", marginBottom: 12 }}>{message}</div>
      <button
        onClick={onRetry}
        style={{
          padding: "8px 20px",
          background: C.green,
          color: "#fff",
          border: "none",
          borderRadius: 4,
          fontSize: 13,
          cursor: "pointer",
          fontFamily: F.body,
        }}
      >
        {t("retry")}
      </button>
    </div>
  );
}

export default function ProductGrid({ products, loading, error, onRetry, onOpen, lf, t }) {
  return (
    <>
      <style>{`
        /* ── Grid layout ── */
        .kh-grid {
          display: grid;
          /* 2 columns on all mobile sizes */
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: ${C.line};
          outline: 1px solid ${C.line};
          width: 100%;
          min-width: 0;
        }
        /* 3+ columns on tablet and above */
        @media (min-width: 640px) {
          .kh-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          }
        }

        /* ── Card body: compact on mobile ── */
        .kh-card-body    { padding: 10px; gap: 6px; }
        .kh-card-title   { font-size: 13px !important; line-height: 1.2 !important; }
        .kh-card-price   { font-size: 14px !important; }
        .kh-card-unit    { font-size: 9px !important; }

        /* Action buttons */
        .kh-card-actions button { font-size: 11px; padding: 8px 0; }

        /* Hide desc + farmer only below 480px — use max-width media query */
        @media (max-width: 479px) {
          .kh-card-desc   { display: none; }
          .kh-card-farmer { display: none; }
        }

        /* Show + adjust at 480px+ */
        @media (min-width: 480px) {
          .kh-card-body   { padding: 14px; gap: 8px; }
          .kh-card-title  { font-size: 15px !important; }
          .kh-card-price  { font-size: 16px !important; }
          .kh-card-desc   { display: -webkit-box; }
          .kh-card-actions button { font-size: 12px; padding: 10px 0; }
        }

        /* Full size on desktop */
        @media (min-width: 640px) {
          .kh-card-body   { padding: 16px; gap: 8px; }
          .kh-card-title  { font-size: 17px !important; }
          .kh-card-price  { font-size: 18px !important; }
          .kh-card-unit   { font-size: 10px !important; }
          .kh-card-actions button { font-size: 13px; padding: 11px 0; }
        }

        /* Verified pill: hide text on tiny cards, show on wider */
        .kh-verified-text { display: none; }
        @media (min-width: 400px) {
          .kh-verified-text { display: inline; }
        }
      `}</style>

      <div className="kh-grid">
        {error   && <ErrorState message={t("error")} onRetry={onRetry} t={t} />}
        {loading && !error && <LoadingSkeleton />}
        {!loading && !error && products.length === 0 && <EmptyState t={t} />}
        {!loading && !error && products.map((p) => (
          <ProductCard key={p.id} product={p} lf={lf} t={t} onOpen={onOpen} />
        ))}
      </div>
    </>
  );
}