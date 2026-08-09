// ---------------------------------------------------------------------------
// ProductFormModal.jsx — add or edit a product listing
// ---------------------------------------------------------------------------
import { useState } from "react";
import { THEME, DISTRICTS } from "../../marketplace/constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

const CATEGORIES = [
  { value: "BROILERS",         label: "Broilers" },
  { value: "LAYERS",           label: "Layers" },
  { value: "INDIGENOUS",       label: "Indigenous chickens" },
  { value: "EGGS",             label: "Eggs" },
  { value: "FEED_AND_SUPPLIES",label: "Feed & supplies" },
];

const EMPTY = {
  title: "", titleSt: "", description: "", descriptionSt: "",
  category: "", pricePerUnit: "", unit: "", unitSt: "",
  stockQuantity: "", minOrderQty: "1",
  district: "", village: "",
};

export default function ProductFormModal({ product, onSave, onClose, loading }) {
  const isEdit = !!product;
  const [form, setForm] = useState(isEdit ? {
    title:        product.title?.en        ?? "",
    titleSt:      product.title?.st        ?? "",
    description:  product.description?.en  ?? "",
    descriptionSt:product.description?.st  ?? "",
    category:     product.category         ?? "",
    pricePerUnit: product.price            ?? "",
    unit:         product.unit?.en         ?? "",
    unitSt:       product.unit?.st         ?? "",
    stockQuantity:product.stock            ?? "",
    minOrderQty:  product.minOrder         ?? "1",
    district:     product.district         ?? "",
    village:      product.village          ?? "",
  } : EMPTY);

  const [images,    setImages]    = useState([]);
  const [formError, setFormError] = useState("");

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    border: `1px solid ${C.line}`, borderRadius: 4,
    fontSize: 14, fontFamily: F.body, color: C.ink, outline: "none",
  };
  const labelStyle = { fontSize: 12, fontWeight: 500, color: C.ink, display: "block", marginBottom: 5 };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.title || !form.category || !form.pricePerUnit || !form.unit || !form.stockQuantity || !form.district) {
      setFormError("Please fill in all required fields");
      return;
    }

    try {
      if (isEdit) {
        await onSave(product.id, form);
      } else {
        // Use FormData for image upload
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        images.forEach((img) => fd.append("images", img));
        await onSave(fd);
      }
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 500 }}
      onClick={onClose}
    >
      <div
        style={{ background: C.white, width: "100%", maxWidth: 560, borderRadius: "10px 10px 0 0", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, background: C.white }}>
          <div style={{ fontFamily: F.display, fontSize: 18, color: C.ink }}>
            {isEdit ? "Edit listing" : "Add new listing"}
          </div>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.line}`, borderRadius: 4, width: 30, height: 30, cursor: "pointer", fontSize: 15, color: C.inkMid }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {formError && (
            <div style={{ background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#c62828" }}>
              {formError}
            </div>
          )}

          {/* Title */}
          <div>
            <label style={labelStyle}>Product title (English) *</label>
            <input style={inputStyle} value={form.title} onChange={set("title")} placeholder="e.g. Day-old broiler chicks" required
              onFocus={(e) => (e.target.style.borderColor = C.green)}
              onBlur={(e)  => (e.target.style.borderColor = C.line)} />
          </div>
          <div>
            <label style={labelStyle}>Product title (Sesotho)</label>
            <input style={inputStyle} value={form.titleSt} onChange={set("titleSt")} placeholder="e.g. Li-pjoana tsa li-broiler"
              onFocus={(e) => (e.target.style.borderColor = C.green)}
              onBlur={(e)  => (e.target.style.borderColor = C.line)} />
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Category *</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.category} onChange={set("category")} required>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Price + Unit */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Price (LSL) *</label>
              <input type="number" style={inputStyle} value={form.pricePerUnit} onChange={set("pricePerUnit")} placeholder="e.g. 35" min="0" step="0.01" required
                onFocus={(e) => (e.target.style.borderColor = C.green)}
                onBlur={(e)  => (e.target.style.borderColor = C.line)} />
            </div>
            <div>
              <label style={labelStyle}>Unit label *</label>
              <input style={inputStyle} value={form.unit} onChange={set("unit")} placeholder="e.g. per chick" required
                onFocus={(e) => (e.target.style.borderColor = C.green)}
                onBlur={(e)  => (e.target.style.borderColor = C.line)} />
            </div>
          </div>

          {/* Stock + Min order */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Stock quantity *</label>
              <input type="number" style={inputStyle} value={form.stockQuantity} onChange={set("stockQuantity")} placeholder="e.g. 200" min="0" required
                onFocus={(e) => (e.target.style.borderColor = C.green)}
                onBlur={(e)  => (e.target.style.borderColor = C.line)} />
            </div>
            <div>
              <label style={labelStyle}>Min. order quantity</label>
              <input type="number" style={inputStyle} value={form.minOrderQty} onChange={set("minOrderQty")} placeholder="1" min="1"
                onFocus={(e) => (e.target.style.borderColor = C.green)}
                onBlur={(e)  => (e.target.style.borderColor = C.line)} />
            </div>
          </div>

          {/* Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>District *</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.district} onChange={set("district")} required>
                <option value="">Select district</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Village / Area</label>
              <input style={inputStyle} value={form.village} onChange={set("village")} placeholder="e.g. Ha Thetsane"
                onFocus={(e) => (e.target.style.borderColor = C.green)}
                onBlur={(e)  => (e.target.style.borderColor = C.line)} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description (English) *</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
              value={form.description} onChange={set("description")}
              placeholder="Describe your product — breed, age, how it's raised, availability..."
              required
              onFocus={(e) => (e.target.style.borderColor = C.green)}
              onBlur={(e)  => (e.target.style.borderColor = C.line)}
            />
          </div>

          {/* Images (new listings only) */}
          {!isEdit && (
            <div>
              <label style={labelStyle}>Product photos (up to 5)</label>
              <input
                type="file" accept="image/*" multiple
                onChange={(e) => setImages([...e.target.files])}
                style={{ fontSize: 13, color: C.inkMid }}
              />
              {images.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  {images.map((img, i) => (
                    <img key={i} src={URL.createObjectURL(img)} alt=""
                      style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4, border: `1px solid ${C.line}` }} />
                  ))}
                </div>
              )}
              <p style={{ fontSize: 11, color: C.inkLight, marginTop: 6 }}>
                JPG or PNG, max 5MB each. First image will be the main photo.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px",
              background: loading ? C.inkLight : C.green,
              color: "#fff", border: "none", borderRadius: 4,
              fontSize: 14, fontWeight: 500,
              cursor: loading ? "default" : "pointer",
              fontFamily: F.body, marginTop: 4,
            }}
          >
            {loading ? "Saving…" : isEdit ? "Save changes" : "Add listing"}
          </button>
        </form>
      </div>
    </div>
  );
}