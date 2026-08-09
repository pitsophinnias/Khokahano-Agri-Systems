// ---------------------------------------------------------------------------
// MyListingsPage.jsx — farmer's product management dashboard
// ---------------------------------------------------------------------------
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyListings } from "../hooks/useMyListings.js";
import ProductFormModal from "../components/ProductFormModal.jsx";
import { THEME } from "../../marketplace/constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

const CATEGORY_LABELS = {
  BROILERS:          "Broilers",
  LAYERS:            "Layers",
  INDIGENOUS:        "Indigenous",
  EGGS:              "Eggs",
  FEED_AND_SUPPLIES: "Feed & Supplies",
};

function StockEditor({ product, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [qty,     setQty]     = useState(product.stock ?? 0);
  const [saving,  setSaving]  = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate(product.id, qty);
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="number" value={qty} min={0}
          onChange={(e) => setQty(e.target.value)}
          style={{ width: 70, padding: "4px 8px", border: `1px solid ${C.green}`, borderRadius: 4, fontSize: 13, fontFamily: F.body }}
        />
        <button onClick={save} disabled={saving} style={{ padding: "4px 10px", background: C.green, color: "#fff", border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: F.body }}>
          {saving ? "…" : "Save"}
        </button>
        <button onClick={() => setEditing(false)} style={{ padding: "4px 8px", background: "none", border: `1px solid ${C.line}`, borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: F.body, color: C.inkMid }}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{
        fontSize: 13, fontWeight: 500,
        color: qty === 0 ? "#c62828" : qty < 20 ? C.gold : C.ink,
      }}>
        {qty} units
      </span>
      <button onClick={() => setEditing(true)} style={{ fontSize: 11, color: C.green, background: "none", border: "none", cursor: "pointer", fontFamily: F.body, textDecoration: "underline" }}>
        Update
      </button>
    </div>
  );
}

export default function MyListingsPage() {
  const navigate = useNavigate();
  const { listings, loading, error, addListing, editListing, updateListingStock, removeListing } = useMyListings();

  const [showForm,    setShowForm]    = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(null);

  const handleSaveNew = async (formData) => {
    setSaving(true);
    try {
      await addListing(formData);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (productId, data) => {
    setSaving(true);
    try {
      await editListing(productId, data);
      setEditProduct(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    await removeListing(productId);
    setConfirmDel(null);
  };

  return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh", color: C.ink }}>
      {/* Top bar */}
      <div style={{ background: C.green, padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => navigate("/farmer")}
            style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: 4, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ←
          </button>
          <div style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>My Listings</div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: "#fff", color: C.green, border: "none", padding: "7px 14px", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F.body }}
        >
          + Add product
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
        {loading && <div style={{ padding: "60px 20px", textAlign: "center", color: C.inkLight }}>Loading listings…</div>}
        {error   && <div style={{ padding: "40px 20px", textAlign: "center", color: "#c62828" }}>{error}</div>}

        {!loading && !error && listings.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🐔</div>
            <div style={{ fontFamily: F.display, fontSize: 20, color: C.ink, marginBottom: 8 }}>No listings yet</div>
            <p style={{ fontSize: 13, color: C.inkLight, marginBottom: 20 }}>Add your first product to appear in the marketplace.</p>
            <button
              onClick={() => setShowForm(true)}
              style={{ padding: "10px 24px", background: C.green, color: "#fff", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: F.body }}
            >
              + Add your first product
            </button>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {listings.map((product) => {
              const title = typeof product.title === "object" ? product.title.en : product.title;
              const image = product.images?.[0];

              return (
                <div key={product.id} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ display: "flex", gap: 12, padding: "14px 16px", alignItems: "flex-start" }}>
                    {image ? (
                      <img src={image} alt={title} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 56, height: 56, background: C.bg, borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🐔</div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: C.ink, marginBottom: 3 }}>{title}</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: C.greenLight, color: C.green, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              {CATEGORY_LABELS[product.category] ?? product.category}
                            </span>
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: C.bg, color: C.inkLight }}>
                              {product.district}
                            </span>
                            {!product.isActive && (
                              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "#ffebee", color: "#c62828" }}>
                                Inactive
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: C.green }}>
                            M {product.price} <span style={{ fontSize: 11, fontWeight: 400, color: C.inkLight }}>{typeof product.unit === "object" ? product.unit.en : product.unit}</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => setEditProduct(product)}
                            style={{ padding: "6px 12px", background: "none", border: `1px solid ${C.line}`, borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: F.body, color: C.inkMid }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDel(product)}
                            style={{ padding: "6px 12px", background: "none", border: "1px solid #ef9a9a", borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: F.body, color: "#c62828" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontSize: 11, color: C.inkLight, marginRight: 8 }}>Stock:</span>
                        <StockEditor product={product} onUpdate={updateListingStock} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(showForm || editProduct) && (
        <ProductFormModal
          product={editProduct}
          loading={saving}
          onSave={editProduct ? handleSaveEdit : handleSaveNew}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
        />
      )}

      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600, padding: 20 }}>
          <div style={{ background: C.white, borderRadius: 8, padding: 24, maxWidth: 360, width: "100%" }}>
            <div style={{ fontFamily: F.display, fontSize: 18, color: C.ink, marginBottom: 8 }}>Remove listing?</div>
            <p style={{ fontSize: 13, color: C.inkMid, marginBottom: 20 }}>
              This will remove <strong>{typeof confirmDel.title === "object" ? confirmDel.title.en : confirmDel.title}</strong> from the marketplace. You can add it again later.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: "10px", background: "none", border: `1px solid ${C.line}`, borderRadius: 4, fontSize: 14, cursor: "pointer", fontFamily: F.body, color: C.inkMid }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDel.id)} style={{ flex: 1, padding: "10px", background: "#c62828", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: F.body }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}