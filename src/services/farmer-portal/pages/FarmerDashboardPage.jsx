import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders }          from "../hooks/useOrders.js";
import { useNotifications }   from "../hooks/useNotifications.js";
import { MOCK_FARMER }        from "../constants/mockOrders.js";
import { STATUS }             from "../constants/orderStatuses.js";
import StatsBar               from "../components/StatsBar.jsx";
import OrderCard              from "../components/OrderCard.jsx";
import EscalationBanner       from "../components/EscalationBanner.jsx";
import NotificationToast      from "../components/NotificationToast.jsx";
import OrderHistoryPage       from "./OrderHistoryPage.jsx";
import KhokahanoAlertsPage    from "./KhokahanoAlertsPage.jsx";

const C = { green:"#1c4a1c", white:"#ffffff", line:"#e2e0da", ink:"#1a1a18", inkLight:"#8a8a80", bg:"#f7f6f3", gold:"#f5c518" };
const F = { display:"'Instrument Serif', Georgia, serif", body:"'Geist', system-ui, sans-serif" };

const TABS = [
  { key:"pending",   label:"Pending",   statuses:[STATUS.PENDING, STATUS.ESCALATED] },
  { key:"active",    label:"Active",    statuses:[STATUS.ACCEPTED, STATUS.PREPARING, STATUS.READY] },
  { key:"completed", label:"Done",      statuses:[STATUS.COMPLETED, STATUS.DECLINED] },
  { key:"all",       label:"All",       statuses:Object.values(STATUS) },
];

export default function FarmerDashboardPage({ lang = "en", onBack }) {
  const navigate = useNavigate();
  const [activeTab,  setActiveTab]  = useState("pending");
  const [subView,    setSubView]    = useState(null); // "history" | "alerts"

  const { notifications, push, dismiss } = useNotifications();

  const handleEscalation = useCallback((order) => {
    push({
      type: "escalation", title: "🚨 Order escalated to Khokahano",
      message: `Order from ${order.buyer.name} not responded to. Khokahano staff alerted.`,
      orderId: order.id,
    });
  }, [push]);

  const { orders, loading, error, stats, updateStatus, resetOrders } = useOrders({
    onEscalation:   handleEscalation,
    onNotification: push,
  });

  const handleUpdateStatus = useCallback(async (orderId, newStatus, extra = {}) => {
    await updateStatus(orderId, newStatus, extra);
    const labels = { accepted:"✅ Order accepted", declined:"Order declined", preparing:"⚙️ Preparing", ready:"📦 Marked ready", completed:"✅ Completed" };
    push({ type:"info", title: labels[newStatus] ?? "Updated", message:`Order #${orderId.slice(-5).toUpperCase()} updated.` });
  }, [updateStatus, push]);

  // Sub-views
  if (subView === "history") return <OrderHistoryPage orders={orders} lang={lang} onBack={() => setSubView(null)} />;
  if (subView === "alerts")  return <KhokahanoAlertsPage onBack={() => setSubView(null)} />;

  const statKeys = { pending: "pending", active: "active", completed: "completed", all: null };
  const visibleOrders = orders
    .filter((o) => TABS.find((t) => t.key === activeTab)?.statuses.includes(o.status))
    .sort((a,b) => {
      const p = { escalated:0, pending:1 };
      const pa = p[a.status]??2, pb = p[b.status]??2;
      return pa !== pb ? pa - pb : a.placedAt - b.placedAt;
    });

  const escalatedOrders = orders.filter((o) => o.status === STATUS.ESCALATED);

  return (
    <div style={{ fontFamily:F.body, background:C.bg, minHeight:"100vh", color:C.ink, WebkitFontSmoothing:"antialiased" }}>
      {/* Top bar */}
      <div style={{ background:C.green, padding:"0 16px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onBack ?? (() => navigate("/"))} style={{ background:"rgba(255,255,255,0.12)", border:"none", color:"#fff", width:32, height:32, borderRadius:4, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
          <div>
            <div style={{ fontFamily:F.display, fontSize:16, color:"#fff", lineHeight:1 }}>My Orders</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)", marginTop:1 }}>{MOCK_FARMER.name} · {MOCK_FARMER.village}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {stats.pending > 0 && (
            <div style={{ background:C.gold, color:C.green, fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>
              {stats.pending} pending
            </div>
          )}
          {/* Quick nav buttons */}
          <button onClick={() => setSubView("history")} style={{ background:"rgba(255,255,255,0.12)", border:"none", color:"#fff", padding:"6px 10px", borderRadius:4, fontSize:11, cursor:"pointer", fontFamily:F.body, whiteSpace:"nowrap" }}>
            📊 History
          </button>
          <button onClick={() => setSubView("alerts")} style={{ background:"rgba(255,255,255,0.12)", border:"none", color:"#fff", padding:"6px 10px", borderRadius:4, fontSize:11, cursor:"pointer", fontFamily:F.body, whiteSpace:"nowrap" }}>
            🚨 Alerts
          </button>
        </div>
      </div>

      <EscalationBanner escalatedOrders={escalatedOrders} />
      <StatsBar stats={stats} />

      {/* Tab bar */}
      <div style={{ display:"flex", background:C.white, borderBottom:`1px solid ${C.line}`, overflow:"hidden" }}>
        {TABS.map((tab) => {
          const count = orders.filter((o) => tab.statuses.includes(o.status)).length;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex:1, padding:"10px 4px", background:"none", border:"none",
              borderBottom: isActive ? `2px solid ${C.green}` : "2px solid transparent",
              color: isActive ? C.green : C.inkLight,
              fontWeight: isActive ? 600 : 400,
              fontSize:"clamp(11px,3vw,13px)", cursor:"pointer", fontFamily:F.body,
              display:"flex", flexDirection:"column", alignItems:"center", gap:2,
            }}>
              {tab.label}
              {count > 0 && (
                <span style={{ fontSize:10, fontWeight:700, background: isActive ? C.green : C.line, color: isActive ? "#fff" : C.inkLight, padding:"1px 6px", borderRadius:10 }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders */}
      <div style={{ maxWidth:720, margin:"0 auto", padding:16 }}>
        {loading && <div style={{ padding:"60px 20px", textAlign:"center", color:C.inkLight }}>Loading orders…</div>}
        {error   && <div style={{ padding:"40px 20px", textAlign:"center", color:"#a32d2d" }}>{error}</div>}
        {!loading && !error && visibleOrders.length === 0 && (
          <div style={{ padding:"60px 20px", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:14 }}>📭</div>
            <div style={{ fontFamily:F.display, fontSize:20, color:C.ink, marginBottom:8 }}>No orders here</div>
            <div style={{ fontSize:13, color:C.inkLight }}>Orders will appear as they come in.</div>
          </div>
        )}
        {!loading && !error && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {visibleOrders.map((order) => (
              <OrderCard key={order.id} order={order} lang={lang} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        )}

        {/* Dev reset button */}
        <div style={{ textAlign:"center", marginTop:32 }}>
          <button onClick={resetOrders} style={{ background:"none", border:`1px solid ${C.line}`, padding:"6px 14px", borderRadius:4, fontSize:11, color:C.inkLight, cursor:"pointer", fontFamily:F.body }}>
            ↺ Reset mock data
          </button>
        </div>
      </div>

      <NotificationToast notifications={notifications} onDismiss={dismiss} />
    </div>
  );
}