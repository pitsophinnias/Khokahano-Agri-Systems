// ---------------------------------------------------------------------------
// AdminDashboardPage.jsx
// Route: /admin  (AdminRoute protected)
// Module: src/services/admin/pages/AdminDashboardPage.jsx
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../auth/AuthContext.jsx";
import { THEME } from "../../marketplace/constants/theme.js";
import {
  fetchAdminStats,
  fetchAdminEscalations,
  resolveEscalation,
  fetchAdminFarmers,
  verifyFarmer,
  fetchAdminOrders,
  fetchRevenueByDistrict,
  fetchAdminSurveys,
  fetchAdminSurveyGroups,
} from "../../marketplace/api/marketplace.api.js";

const C = THEME.colors;
const F = THEME.fonts;

const BAR_COLORS = ["#1c4a1c","#2a6b2a","#3d8b3d","#52a852","#6bc06b","#85d685","#a3e6a3"];

const TABS = [
  { key: "overview",    label: "Overview"    },
  { key: "escalations", label: "Alerts"      },
  { key: "farmers",     label: "Farmers"     },
  { key: "orders",      label: "Orders"      },
  { key: "surveys",     label: "Surveys"     },
];

const DISTRICTS = [
  "All districts","Maseru","Leribe","Berea","Mafeteng",
  "Mohale's Hoek","Quthing","Qacha's Nek","Mokhotlong","Thaba-Tseka","Butha-Buthe",
];

const GROUP_META = {
  GROUP_A: { label: "Group A", colour: "#1c4a1c", desc: "Following recommended standards" },
  GROUP_B: { label: "Group B", colour: "#b8860b", desc: "Needs feeding improvement"        },
  GROUP_C: { label: "Group C", colour: "#a05c00", desc: "Needs vaccination improvement"    },
  GROUP_D: { label: "Group D", colour: "#a32d2d", desc: "Needs housing improvement"        },
};

const STATUS_COLOURS = {
  PENDING: "#b8860b", ACCEPTED: "#1c4a1c", PREPARING: "#2a6b2a",
  READY: "#3d8b3d", COMPLETED: "#1c4a1c", DECLINED: "#a32d2d", ESCALATED: "#c0392b",
};

const ORDER_STATUSES = ["All","PENDING","ACCEPTED","PREPARING","READY","COMPLETED","DECLINED","ESCALATED"];

// ── Shared primitives ─────────────────────────────────────────

function TopBar({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <div style={{
      background: C.green, padding: "0 16px", height: 52,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/assets/logo.png" alt="Khokahano" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
        <div style={{ fontFamily: F.display, fontSize: 18, color: "#fff" }}>Khokahano Admin</div>
        <div style={{
          padding: "2px 8px", borderRadius: 10,
          background: "rgba(255,255,255,0.15)",
          fontSize: 10, color: "#fff", fontFamily: F.body, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>Admin</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: F.body }}>
          {user?.firstName} {user?.lastName}
        </div>
        <button onClick={onLogout} style={{
          background: "rgba(255,255,255,0.12)", border: "none",
          color: "#fff", padding: "6px 10px", borderRadius: 4,
          fontSize: 11, cursor: "pointer", fontFamily: F.body,
        }}>Sign out</button>
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: C.white,
      borderTop: `1px solid ${C.line}`, borderRight: `1px solid ${C.line}`,
      borderBottom: `1px solid ${C.line}`, borderLeft: `1px solid ${C.line}`,
      borderRadius: 6, ...style,
    }}>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div style={{
      background: accent ? C.green : C.white,
      borderTop: `1px solid ${C.line}`, borderRight: `1px solid ${C.line}`,
      borderBottom: `1px solid ${C.line}`, borderLeft: `1px solid ${C.line}`,
      borderRadius: 6, padding: "16px 20px",
    }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: F.display, fontSize: 26, color: accent ? "#fff" : C.ink, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.75)" : C.inkLight, marginTop: 4 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: accent ? "rgba(255,255,255,0.6)" : C.inkLight, marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div style={{ padding: "48px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, color: C.inkLight, fontFamily: F.body }}>{message}</div>
    </div>
  );
}

function LoadingRow() {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center", color: C.inkLight, fontFamily: F.body, fontSize: 13 }}>
      Loading…
    </div>
  );
}

function GroupBadge({ group }) {
  if (!group) return <span style={{ fontSize: 12, color: C.inkLight }}>No survey</span>;
  const meta = GROUP_META[group];
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 10,
      background: meta?.colour ?? C.line,
      color: "#fff", fontSize: 11, fontWeight: 600, fontFamily: F.body,
    }}>
      {meta?.label ?? group}
    </span>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{
      padding: "8px 12px",
      borderTop: `1px solid ${C.line}`, borderRight: `1px solid ${C.line}`,
      borderBottom: `1px solid ${C.line}`, borderLeft: `1px solid ${C.line}`,
      borderRadius: 4, fontFamily: F.body, fontSize: 13, color: C.ink, background: C.white,
    }}>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function BarChart({ data, labelKey, valueKey, colorFn }) {
  const maxVal = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map((item, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.inkMid, marginBottom: 3, fontFamily: F.body }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>
              {item[labelKey]}
            </span>
            <span style={{ fontWeight: 600, color: C.ink }}>
              {item[valueKey] > 100 ? `M ${item[valueKey].toLocaleString()}` : item[valueKey]}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: C.line, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3, background: colorFn(i),
              width: `${(item[valueKey] / maxVal) * 100}%`,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab: Overview ─────────────────────────────────────────────

function OverviewTab({ stats, revenueByDistrict, loadingStats, loadingRevenue }) {
  if (loadingStats) return <LoadingRow />;
  const orderStatuses = stats?.ordersByStatus ?? {};

  return (
    <div>
      <style>{`
        .admin-stats-grid {
          display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; margin-bottom: 20px;
        }
        @media(min-width:640px){ .admin-stats-grid{ grid-template-columns:repeat(3,1fr); } }
        @media(min-width:900px){ .admin-stats-grid{ grid-template-columns:repeat(6,1fr); } }
        .admin-charts-grid {
          display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 20px;
        }
        @media(min-width:700px){ .admin-charts-grid{ grid-template-columns:1fr 1fr; } }
      `}</style>

      <div className="admin-stats-grid">
        <StatCard icon="💰" label="Total revenue"    value={`M ${(stats?.totalRevenue ?? 0).toLocaleString()}`} accent />
        <StatCard icon="🧑‍🌾" label="Farmers"          value={stats?.farmers ?? "—"} />
        <StatCard icon="🛒" label="Buyers"           value={stats?.buyers ?? "—"} />
        <StatCard icon="📦" label="Active products"  value={stats?.products ?? "—"} />
        <StatCard icon="📋" label="Total orders"     value={stats?.orders ?? "—"} />
        <StatCard icon="🚨" label="Open escalations" value={stats?.openEscalations ?? "—"}
          sub={stats?.openEscalations > 0 ? "Needs attention" : "All clear"} />
      </div>

      <div className="admin-charts-grid">
        <Card style={{ padding: 20 }}>
          <div style={{ fontFamily: F.display, fontSize: 15, color: C.ink, marginBottom: 16 }}>Orders by status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { key:"PENDING",   label:"Pending",   colour:"#b8860b" },
              { key:"ACCEPTED",  label:"Accepted",  colour:"#1c4a1c" },
              { key:"PREPARING", label:"Preparing", colour:"#2a6b2a" },
              { key:"READY",     label:"Ready",     colour:"#3d8b3d" },
              { key:"COMPLETED", label:"Completed", colour:"#1c4a1c" },
              { key:"DECLINED",  label:"Declined",  colour:"#a32d2d" },
              { key:"ESCALATED", label:"Escalated", colour:"#c0392b" },
            ].map(({ key, label, colour }) => {
              const count = orderStatuses[key] ?? 0;
              const total = Math.max(stats?.orders ?? 1, 1);
              return (
                <div key={key}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:3, fontFamily:F.body }}>
                    <span style={{ color:C.inkMid }}>{label}</span>
                    <span style={{ fontWeight:600, color:C.ink }}>{count}</span>
                  </div>
                  <div style={{ height:5, borderRadius:3, background:C.line }}>
                    <div style={{ height:"100%", borderRadius:3, width:`${Math.round((count/total)*100)}%`, background:colour }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontFamily: F.display, fontSize: 15, color: C.ink, marginBottom: 16 }}>Revenue by district</div>
          {loadingRevenue
            ? <LoadingRow />
            : revenueByDistrict?.length > 0
            ? <BarChart data={revenueByDistrict} labelKey="district" valueKey="revenue" colorFn={(i) => BAR_COLORS[i % BAR_COLORS.length]} />
            : <EmptyState icon="📊" message="No completed orders yet" />
          }
        </Card>
      </div>
    </div>
  );
}

// ── Tab: Escalations ──────────────────────────────────────────

function EscalationsTab() {
  const [escalations, setEscalations] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("open");
  const [notes,       setNotes]       = useState({});
  const [resolving,   setResolving]   = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminEscalations(filter === "resolved");
      setEscalations(data);
    } catch { setEscalations([]); }
    finally  { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleResolve = async (id) => {
    setResolving((p) => ({ ...p, [id]: true }));
    try { await resolveEscalation(id, notes[id] ?? ""); await load(); }
    finally { setResolving((p) => ({ ...p, [id]: false })); }
  };

  return (
    <div>
      <div style={{ display:"flex", gap:0, marginBottom:16, background:C.white, borderRadius:6, overflow:"hidden", borderTop:`1px solid ${C.line}`, borderRight:`1px solid ${C.line}`, borderBottom:`1px solid ${C.line}`, borderLeft:`1px solid ${C.line}` }}>
        {[{key:"open",label:"Open"},{key:"resolved",label:"Resolved"}].map(({key,label}) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            flex:1, padding:"10px 0", background:"none", border:"none",
            borderBottom: filter===key ? `2px solid ${C.green}` : "2px solid transparent",
            color: filter===key ? C.green : C.inkLight,
            fontWeight: filter===key ? 600 : 400,
            fontSize:13, cursor:"pointer", fontFamily:F.body,
          }}>{label}</button>
        ))}
      </div>

      {loading ? <LoadingRow />
        : escalations.length === 0
        ? <EmptyState icon={filter==="open" ? "✅" : "📭"} message={filter==="open" ? "No open escalations" : "No resolved escalations"} />
        : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {escalations.map((esc) => {
              const farmer = esc.order?.farmer?.user;
              const buyer  = esc.order?.buyer?.user;
              const items  = esc.order?.items ?? [];
              const age    = Math.round((Date.now() - new Date(esc.escalatedAt).getTime()) / 60000);
              return (
                <Card key={esc.id} style={{ overflow:"hidden" }}>
                  <div style={{ padding:"10px 16px", background: esc.isResolved ? C.bg : "rgba(163,45,45,0.05)", borderBottom:`1px solid ${C.line}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:14 }}>{esc.isResolved ? "✅" : "🚨"}</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:C.ink, fontFamily:F.body }}>Order #{esc.orderId.slice(-6).toUpperCase()}</div>
                        <div style={{ fontSize:11, color:C.inkLight, fontFamily:F.body }}>
                          {esc.isResolved
                            ? `Resolved ${new Date(esc.resolvedAt).toLocaleDateString("en-GB")}`
                            : `Escalated ${age < 60 ? `${age}m ago` : `${Math.round(age/60)}h ago`}`}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:F.body }}>
                      M {(esc.order?.totalAmount ?? 0).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ padding:16 }}>
                    {items.length > 0 && (
                      <div style={{ fontSize:13, color:C.inkMid, marginBottom:12, fontFamily:F.body }}>
                        {items.map((it) => `${it.product?.title ?? "Product"} ×${it.quantity}`).join(", ")}
                      </div>
                    )}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                      {[{role:"Farmer",person:farmer},{role:"Buyer",person:buyer}].map(({role,person}) => (
                        <div key={role} style={{ padding:12, background:C.bg, borderRadius:4, borderTop:`1px solid ${C.line}`, borderRight:`1px solid ${C.line}`, borderBottom:`1px solid ${C.line}`, borderLeft:`1px solid ${C.line}` }}>
                          <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", color:C.inkLight, marginBottom:4, fontFamily:F.body }}>{role}</div>
                          <div style={{ fontSize:13, fontWeight:500, color:C.ink, fontFamily:F.body }}>{person ? `${person.firstName} ${person.lastName}` : "—"}</div>
                          {person?.phone && (
                            <div style={{ display:"flex", gap:6, marginTop:8 }}>
                              <a href={`tel:${person.phone}`} style={{ fontSize:12, padding:"4px 10px", background:C.green, color:"#fff", borderRadius:4, textDecoration:"none", fontFamily:F.body }}>📞 Call</a>
                              <a href={`https://wa.me/${person.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, padding:"4px 10px", background:"#128C7E", color:"#fff", borderRadius:4, textDecoration:"none", fontFamily:F.body }}>💬 WA</a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {esc.followUpNote && (
                      <div style={{ padding:"8px 12px", marginBottom:12, background:"#fffde7", borderRadius:4, borderTop:`1px solid #f9e400`, borderRight:`1px solid #f9e400`, borderBottom:`1px solid #f9e400`, borderLeft:`3px solid #f9e400`, fontSize:13, color:C.inkMid, fontFamily:F.body }}>
                        📝 {esc.followUpNote}
                      </div>
                    )}
                    {!esc.isResolved && (
                      <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                        <textarea rows={2} placeholder="Follow-up note (optional)…" value={notes[esc.id] ?? ""} onChange={(e) => setNotes((p) => ({...p,[esc.id]:e.target.value}))}
                          style={{ flex:1, padding:"8px 10px", borderTop:`1px solid ${C.line}`, borderRight:`1px solid ${C.line}`, borderBottom:`1px solid ${C.line}`, borderLeft:`1px solid ${C.line}`, borderRadius:4, fontFamily:F.body, fontSize:13, color:C.ink, resize:"none" }}
                        />
                        <button onClick={() => handleResolve(esc.id)} disabled={resolving[esc.id]} style={{ padding:"8px 14px", background:C.green, color:"#fff", border:"none", borderRadius:4, fontSize:13, fontWeight:500, cursor: resolving[esc.id] ? "default" : "pointer", fontFamily:F.body, whiteSpace:"nowrap" }}>
                          {resolving[esc.id] ? "…" : "Mark resolved"}
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )
      }
    </div>
  );
}

// ── Tab: Farmers ──────────────────────────────────────────────

function FarmersTab() {
  const [farmers,   setFarmers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [district,  setDistrict]  = useState("All districts");
  const [verifying, setVerifying] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminFarmers(district === "All districts" ? undefined : district);
      setFarmers(data);
    } catch { setFarmers([]); }
    finally  { setLoading(false); }
  }, [district]);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (id) => {
    setVerifying((p) => ({ ...p, [id]: true }));
    try {
      await verifyFarmer(id);
      setFarmers((prev) => prev.map((f) => f.id === id ? { ...f, isVerified: true } : f));
    } finally { setVerifying((p) => ({ ...p, [id]: false })); }
  };

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <FilterSelect value={district} onChange={setDistrict} options={DISTRICTS} />
      </div>
      {loading ? <LoadingRow />
        : farmers.length === 0 ? <EmptyState icon="🧑‍🌾" message="No farmers found" />
        : (
          <Card>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:F.body, fontSize:13 }}>
                <thead>
                  <tr style={{ background:C.bg }}>
                    {["Farmer","District","Products","Orders","Survey group","Verified",""].map((h) => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`1px solid ${C.line}`, color:C.inkLight, fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((farmer) => {
                    const u = farmer.user;
                    return (
                      <tr key={farmer.id} style={{ borderBottom:`1px solid ${C.line}` }}>
                        <td style={{ padding:"12px 14px" }}>
                          <div style={{ fontWeight:500, color:C.ink }}>{u.firstName} {u.lastName}</div>
                          <div style={{ fontSize:11, color:C.inkLight }}>{u.phone}</div>
                          {farmer.farmName && <div style={{ fontSize:11, color:C.inkLight }}>{farmer.farmName}</div>}
                        </td>
                        <td style={{ padding:"12px 14px", color:C.inkMid }}>{u.district}{u.village ? `, ${u.village}` : ""}</td>
                        <td style={{ padding:"12px 14px", color:C.ink, textAlign:"center" }}>{farmer._count?.products ?? 0}</td>
                        <td style={{ padding:"12px 14px", color:C.ink, textAlign:"center" }}>{farmer._count?.orders ?? 0}</td>
                        <td style={{ padding:"12px 14px" }}><GroupBadge group={farmer.survey?.groupCategory} /></td>
                        <td style={{ padding:"12px 14px" }}>
                          {farmer.isVerified
                            ? <span style={{ fontSize:12, color:C.green, fontWeight:500 }}>✓ Verified</span>
                            : <span style={{ fontSize:12, color:C.inkLight }}>Unverified</span>}
                        </td>
                        <td style={{ padding:"12px 14px" }}>
                          {!farmer.isVerified && (
                            <button onClick={() => handleVerify(farmer.id)} disabled={verifying[farmer.id]} style={{ padding:"5px 12px", background:C.green, color:"#fff", border:"none", borderRadius:4, fontSize:12, cursor: verifying[farmer.id] ? "default" : "pointer", fontFamily:F.body, whiteSpace:"nowrap" }}>
                              {verifying[farmer.id] ? "…" : "Verify"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )
      }
    </div>
  );
}

// ── Tab: Orders ───────────────────────────────────────────────

function OrdersTab() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [status,   setStatus]   = useState("All");
  const [district, setDistrict] = useState("All districts");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminOrders({
        status:   status   === "All"           ? undefined : status,
        district: district === "All districts" ? undefined : district,
        page,
      });
      setOrders(res.orders);
      setTotal(res.total);
      setPages(res.pages);
    } catch { setOrders([]); }
    finally  { setLoading(false); }
  }, [status, district, page]);

  useEffect(() => { setPage(1); }, [status, district]);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <FilterSelect value={status}   onChange={setStatus}   options={ORDER_STATUSES} />
        <FilterSelect value={district} onChange={setDistrict} options={DISTRICTS} />
        <div style={{ fontSize:13, color:C.inkLight, fontFamily:F.body }}>{total} order{total !== 1 ? "s" : ""}</div>
      </div>
      {loading ? <LoadingRow />
        : orders.length === 0 ? <EmptyState icon="📋" message="No orders found" />
        : (
          <>
            <Card>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:F.body, fontSize:13 }}>
                  <thead>
                    <tr style={{ background:C.bg }}>
                      {["Order","Farmer","Buyer","Products","Total","Status","Date"].map((h) => (
                        <th key={h} style={{ padding:"10px 14px", textAlign:"left", borderBottom:`1px solid ${C.line}`, color:C.inkLight, fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const farmer = order.farmer?.user;
                      const buyer  = order.buyer?.user;
                      return (
                        <tr key={order.id} style={{ borderBottom:`1px solid ${C.line}` }}>
                          <td style={{ padding:"11px 14px", color:C.inkLight, fontWeight:600, fontSize:11 }}>#{order.id.slice(-6).toUpperCase()}</td>
                          <td style={{ padding:"11px 14px" }}>
                            <div style={{ color:C.ink }}>{farmer ? `${farmer.firstName} ${farmer.lastName}` : "—"}</div>
                            {farmer?.phone && <div style={{ fontSize:11, color:C.inkLight }}>{farmer.phone}</div>}
                          </td>
                          <td style={{ padding:"11px 14px" }}>
                            <div style={{ color:C.ink }}>{buyer ? `${buyer.firstName} ${buyer.lastName}` : "—"}</div>
                            {buyer?.district && <div style={{ fontSize:11, color:C.inkLight }}>{buyer.district}</div>}
                          </td>
                          <td style={{ padding:"11px 14px", color:C.inkMid, maxWidth:180 }}>
                            {order.items?.map((it) => it.product?.title ?? "—").join(", ")}
                          </td>
                          <td style={{ padding:"11px 14px", fontWeight:600, color:C.ink, whiteSpace:"nowrap" }}>M {order.totalAmount.toLocaleString()}</td>
                          <td style={{ padding:"11px 14px" }}>
                            <span style={{ padding:"2px 8px", borderRadius:10, background: STATUS_COLOURS[order.status] ?? C.line, color:"#fff", fontSize:11, fontWeight:600 }}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ padding:"11px 14px", color:C.inkLight, whiteSpace:"nowrap" }}>
                            {new Date(order.placedAt).toLocaleDateString("en-GB", { day:"numeric", month:"short" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            {pages > 1 && (
              <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:16 }}>
                <button onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1} style={{ padding:"6px 14px", borderTop:`1px solid ${C.line}`, borderRight:`1px solid ${C.line}`, borderBottom:`1px solid ${C.line}`, borderLeft:`1px solid ${C.line}`, borderRadius:4, background: page===1 ? C.bg : C.white, color: page===1 ? C.inkLight : C.ink, cursor: page===1 ? "default" : "pointer", fontFamily:F.body, fontSize:13 }}>← Prev</button>
                <span style={{ padding:"6px 12px", fontSize:13, color:C.inkMid, fontFamily:F.body, alignSelf:"center" }}>{page} / {pages}</span>
                <button onClick={() => setPage((p) => Math.min(pages,p+1))} disabled={page===pages} style={{ padding:"6px 14px", borderTop:`1px solid ${C.line}`, borderRight:`1px solid ${C.line}`, borderBottom:`1px solid ${C.line}`, borderLeft:`1px solid ${C.line}`, borderRadius:4, background: page===pages ? C.bg : C.white, color: page===pages ? C.inkLight : C.ink, cursor: page===pages ? "default" : "pointer", fontFamily:F.body, fontSize:13 }}>Next →</button>
              </div>
            )}
          </>
        )
      }
    </div>
  );
}

// ── Tab: Surveys ──────────────────────────────────────────────

const PACKAGING_LABELS = { live:"Live birds", dressed:"Dressed", tray_packed:"Tray packed", vacuum:"Vacuum packed" };
const HOUSING_LABELS   = { deep_litter:"Deep litter", cage:"Cage", free_range:"Free range", open_yard:"Open yard" };
const FEEDING_LABELS   = { commercial:"Commercial", homemix:"Home-mixed", both:"Both", scavenging:"Scavenging" };

function SurveysTab({ onImport }) {
  const [surveys,    setSurveys]    = useState([]);
  const [groups,     setGroups]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [district,   setDistrict]   = useState("All districts");
  const [groupFilter,setGroupFilter] = useState("All groups");
  const [expanded,   setExpanded]   = useState(null);

  const GROUP_OPTIONS = ["All groups","GROUP_A","GROUP_B","GROUP_C","GROUP_D"];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [surveyData, groupData] = await Promise.all([
        fetchAdminSurveys({
          district: district   === "All districts" ? undefined : district,
          group:    groupFilter === "All groups"   ? undefined : groupFilter,
        }),
        fetchAdminSurveyGroups(),
      ]);
      setSurveys(surveyData);
      setGroups(groupData);
    } catch { setSurveys([]); }
    finally  { setLoading(false); }
  }, [district, groupFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      {/* Group summary cards */}
      {groups.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:10, marginBottom:20 }}>
          {groups.map(({ group, count }) => {
            const meta = GROUP_META[group];
            return (
              <div key={group} style={{
                padding:"14px 16px", borderRadius:6,
                borderTop:`1px solid ${C.line}`, borderRight:`1px solid ${C.line}`,
                borderBottom:`1px solid ${C.line}`, borderLeft:`3px solid ${meta?.colour ?? C.line}`,
                background:C.white,
              }}>
                <div style={{ fontFamily:F.display, fontSize:22, color: meta?.colour ?? C.ink }}>{count}</div>
                <div style={{ fontSize:12, fontWeight:600, color: meta?.colour ?? C.ink, marginTop:2 }}>{meta?.label ?? group}</div>
                <div style={{ fontSize:11, color:C.inkLight, marginTop:2, lineHeight:1.4 }}>{meta?.desc}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Controls */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <FilterSelect value={district}    onChange={setDistrict}    options={DISTRICTS} />
          <FilterSelect value={groupFilter} onChange={setGroupFilter} options={GROUP_OPTIONS} />
          <div style={{ fontSize:13, color:C.inkLight, fontFamily:F.body, alignSelf:"center" }}>
            {surveys.length} response{surveys.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button onClick={onImport} style={{
          padding:"8px 16px", background:C.green, color:"#fff",
          border:"none", borderRadius:4,
          fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:F.body,
          display:"flex", alignItems:"center", gap:6,
        }}>
          📥 Import surveys
        </button>
      </div>

      {loading ? <LoadingRow />
        : surveys.length === 0
        ? <EmptyState icon="📋" message="No survey responses yet" />
        : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {surveys.map((survey) => {
              const farmer   = survey.farmer?.user;
              const isOpen   = expanded === survey.id;
              const group    = survey.groupCategory;
              const meta     = GROUP_META[group];
              const updated  = survey.updatedAt
                ? new Date(survey.updatedAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })
                : null;

              return (
                <Card key={survey.id} style={{ overflow:"hidden" }}>
                  {/* Row header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : survey.id)}
                    style={{
                      width:"100%", padding:"12px 16px", background:"none", border:"none",
                      cursor:"pointer", fontFamily:F.body,
                      display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
                      borderBottom: isOpen ? `1px solid ${C.line}` : "none",
                    }}
                  >
                    <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontSize:14, fontWeight:500, color:C.ink }}>
                          {farmer ? `${farmer.firstName} ${farmer.lastName}` : "Unknown farmer"}
                        </div>
                        <div style={{ fontSize:11, color:C.inkLight }}>
                          {farmer?.district}{farmer?.village ? `, ${farmer.village}` : ""}
                          {farmer?.phone ? ` · ${farmer.phone}` : ""}
                        </div>
                      </div>
                      {group && (
                        <span style={{ padding:"2px 8px", borderRadius:10, background: meta?.colour ?? C.line, color:"#fff", fontSize:11, fontWeight:600 }}>
                          {meta?.label ?? group}
                        </span>
                      )}
                      {updated && (
                        <span style={{ fontSize:11, color:C.inkLight }}>Updated {updated}</span>
                      )}
                    </div>
                    <span style={{ fontSize:14, color:C.inkLight, flexShrink:0 }}>{isOpen ? "▲" : "▼"}</span>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ padding:16 }}>
                      <style>{`.survey-detail-grid { display:grid; grid-template-columns:1fr; gap:8px; } @media(min-width:600px){ .survey-detail-grid{ grid-template-columns:1fr 1fr; } } @media(min-width:900px){ .survey-detail-grid{ grid-template-columns:repeat(3,1fr); } }`}</style>
                      <div className="survey-detail-grid">

                        {/* Flock */}
                        <DetailSection title="Flock">
                          <DetailRow label="Poultry types" value={(survey.poultryTypes ?? []).map((t) => t.charAt(0)+t.slice(1).toLowerCase()).join(", ") || "—"} />
                          <DetailRow label="Total birds"   value={survey.totalBirds ?? "—"} />
                          {survey.broilerCount   > 0 && <DetailRow label="Broilers"   value={survey.broilerCount} />}
                          {survey.layerCount     > 0 && <DetailRow label="Layers"     value={survey.layerCount} />}
                          {survey.indigenousCount> 0 && <DetailRow label="Indigenous" value={survey.indigenousCount} />}
                        </DetailSection>

                        {/* Practices */}
                        <DetailSection title="Practices">
                          <DetailRow label="Housing"     value={HOUSING_LABELS[survey.housingSystem]  ?? survey.housingSystem  ?? "—"} />
                          <DetailRow label="Feeding"     value={FEEDING_LABELS[survey.feedingMethod]  ?? survey.feedingMethod  ?? "—"} />
                          {survey.feedBrand && <DetailRow label="Feed brand" value={survey.feedBrand} />}
                          <DetailRow label="Vaccination" value={survey.vaccinationPractice ?? "—"} />
                          {survey.vaccinesUsed?.length > 0 && <DetailRow label="Vaccines" value={survey.vaccinesUsed.join(", ")} />}
                        </DetailSection>

                        {/* Health & market */}
                        <DetailSection title="Health & market">
                          <DetailRow label="Mortality"   value={survey.mortalityRatePercent != null ? `${survey.mortalityRatePercent}%` : "—"} />
                          {survey.diseaseChallenges?.length > 0 && <DetailRow label="Diseases" value={survey.diseaseChallenges.join(", ")} />}
                          {survey.marketAccessChallenges && <DetailRow label="Market challenge" value={survey.marketAccessChallenges} />}
                          <DetailRow label="Packaging" value={
                            survey.packagingMethod
                              ? (Array.isArray(survey.packagingMethod)
                                  ? survey.packagingMethod
                                  : survey.packagingMethod.split(","))
                                .map((p) => PACKAGING_LABELS[p.trim()] ?? p)
                                .join(", ")
                              : "—"
                          } />
                        </DetailSection>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )
      }
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div style={{ background:C.bg, borderRadius:4, padding:12, borderTop:`1px solid ${C.line}`, borderRight:`1px solid ${C.line}`, borderBottom:`1px solid ${C.line}`, borderLeft:`1px solid ${C.line}` }}>
      <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", color:C.inkLight, marginBottom:8, fontFamily:F.body }}>{title}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display:"flex", justifyContent:"space-between", gap:8, fontSize:12, fontFamily:F.body }}>
      <span style={{ color:C.inkLight, flexShrink:0 }}>{label}</span>
      <span style={{ color:C.ink, textAlign:"right" }}>{value}</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const navigate             = useNavigate();
  const { user, logout }     = useAuthContext();
  const [activeTab, setActiveTab] = useState("overview");

  const [stats,             setStats]             = useState(null);
  const [revenueByDistrict, setRevenueByDistrict] = useState([]);
  const [loadingStats,      setLoadingStats]      = useState(true);
  const [loadingRevenue,    setLoadingRevenue]    = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats).catch(() => {}).finally(() => setLoadingStats(false));
    fetchRevenueByDistrict()
      .then(setRevenueByDistrict).catch(() => {}).finally(() => setLoadingRevenue(false));
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={{ fontFamily:F.body, background:C.bg, minHeight:"100vh", color:C.ink, WebkitFontSmoothing:"antialiased" }}>
      <TopBar user={user} onLogout={handleLogout} />

      {/* Tab bar */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.line}`, display:"flex", overflowX:"auto" }}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding:"12px 20px", background:"none", border:"none",
            borderBottom: activeTab===tab.key ? `2px solid ${C.green}` : "2px solid transparent",
            color: activeTab===tab.key ? C.green : C.inkLight,
            fontWeight: activeTab===tab.key ? 600 : 400,
            fontSize:13, cursor:"pointer", fontFamily:F.body, whiteSpace:"nowrap",
          }}>
            {tab.label}
            {tab.key==="escalations" && stats?.openEscalations > 0 && (
              <span style={{ marginLeft:6, padding:"1px 6px", borderRadius:10, background:"#a32d2d", color:"#fff", fontSize:10, fontWeight:700 }}>
                {stats.openEscalations}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 16px 60px" }}>
        {activeTab === "overview"    && <OverviewTab stats={stats} revenueByDistrict={revenueByDistrict} loadingStats={loadingStats} loadingRevenue={loadingRevenue} />}
        {activeTab === "escalations" && <EscalationsTab />}
        {activeTab === "farmers"     && <FarmersTab />}
        {activeTab === "orders"      && <OrdersTab />}
        {activeTab === "surveys"     && <SurveysTab onImport={() => navigate("/admin/surveys/import")} />}
      </div>
    </div>
  );
}