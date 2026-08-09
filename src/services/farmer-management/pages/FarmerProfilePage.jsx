// ---------------------------------------------------------------------------
// FarmerProfilePage.jsx
// Farmer can view and edit their profile: name, village, farm name, bio,
// and profile photo.
// Route:  /farmer/profile  (FarmerRoute protected)
// Module: src/services/farmer-management/pages/FarmerProfilePage.jsx
// ---------------------------------------------------------------------------

import { useState, useEffect, useRef } from "react";
import { useNavigate }                 from "react-router-dom";
import { useAuthContext }              from "../../auth/AuthContext.jsx";
import { THEME }                       from "../../marketplace/constants/theme.js";
import {
  fetchFarmerProfile,
  updateFarmerProfile,
  uploadProfilePhoto,
} from "../../marketplace/api/marketplace.api.js";

const C = THEME.colors;
const F = THEME.fonts;

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

// ── Sub-components ────────────────────────────────────────────

function TopBar({ onBack }) {
  return (
    <div style={{
      background: C.green, padding: "0 16px", height: 52,
      display: "flex", alignItems: "center", gap: 10,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <button onClick={onBack} style={{
        background: "rgba(255,255,255,0.12)", border: "none",
        color: "#fff", width: 32, height: 32, borderRadius: 4,
        cursor: "pointer", fontSize: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>←</button>
      <img src="/assets/logo.png" alt="Khokahano" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
      <div style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>My Profile</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", fontSize: 13, fontWeight: 500,
        color: C.inkMid, marginBottom: 4, fontFamily: F.body,
      }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: C.inkLight, marginLeft: 6 }}>— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = (disabled) => ({
  width: "100%", padding: "10px 12px",
  borderTop:    `1px solid ${C.line}`,
  borderRight:  `1px solid ${C.line}`,
  borderBottom: `1px solid ${C.line}`,
  borderLeft:   `1px solid ${C.line}`,
  borderRadius: 4,
  fontFamily: F.body, fontSize: 14, color: disabled ? C.inkLight : C.ink,
  background: disabled ? C.bg : C.white,
  outline: "none", boxSizing: "border-box",
});

// ── Main page ─────────────────────────────────────────────────

export default function FarmerProfilePage() {
  const navigate            = useNavigate();
  const { user: authUser }  = useAuthContext();
  const photoInputRef       = useRef(null);

  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const [form, setForm] = useState({
    firstName: "", lastName: "", village: "",
    farmName: "", bio: "",
  });

  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState(null);
  const [saveSuccess,  setSaveSuccess]  = useState(false);

  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError,     setPhotoError]     = useState(null);
  const [photoPreview,   setPhotoPreview]   = useState(null);

  // Load profile on mount
  useEffect(() => {
    fetchFarmerProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          firstName: data.user.firstName ?? "",
          lastName:  data.user.lastName  ?? "",
          village:   data.user.village   ?? "",
          farmName:  data.farmName       ?? "",
          bio:       data.bio            ?? "",
        });
      })
      .catch((err) => setError(err.message ?? "Could not load profile"))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updated = await updateFarmerProfile(form);
      setProfile(updated);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err.message ?? "Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoError(null);
    setPhotoUploading(true);

    try {
      const formData = new FormData();
      formData.append("images", file);
      await uploadProfilePhoto(formData);
    } catch (err) {
      setPhotoError(err.message ?? "Photo upload failed.");
      setPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
    }
  };

  // Resolve photo URL — preview → stored URL → initial avatar
  const photoUrl = photoPreview
    ?? (profile?.profilePhotoUrl ? `${BASE_URL}${profile.profilePhotoUrl}` : null);

  const initials = `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase();

  if (loading) return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh" }}>
      <TopBar onBack={() => navigate("/farmer")} />
      <div style={{ padding: "60px 20px", textAlign: "center", color: C.inkLight }}>Loading…</div>
    </div>
  );

  if (error) return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh" }}>
      <TopBar onBack={() => navigate("/farmer")} />
      <div style={{ padding: "60px 20px", textAlign: "center", color: "#a32d2d" }}>{error}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh", color: C.ink, WebkitFontSmoothing: "antialiased" }}>
      <TopBar onBack={() => navigate("/farmer")} />

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* ── Profile photo ── */}
        <div style={{
          background: C.white,
          borderTop:    `1px solid ${C.line}`,
          borderRight:  `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
          borderLeft:   `1px solid ${C.line}`,
          borderRadius: 6, padding: 20, marginBottom: 16,
          display: "flex", alignItems: "center", gap: 20,
        }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {photoUrl ? (
              <img
                src={photoUrl} alt="Profile"
                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: C.green,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: F.display, fontSize: 28, color: "#fff",
              }}>
                {initials || "?"}
              </div>
            )}
            {photoUploading && (
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>⏳</div>
            )}
          </div>

          <div>
            <div style={{ fontFamily: F.display, fontSize: 17, color: C.ink, marginBottom: 4 }}>
              {form.firstName} {form.lastName}
            </div>
            {profile?.farmName && (
              <div style={{ fontSize: 13, color: C.inkMid, marginBottom: 10 }}>{profile.farmName}</div>
            )}
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={photoUploading}
              style={{
                padding: "7px 14px",
                borderTop:    `1px solid ${C.line}`,
                borderRight:  `1px solid ${C.line}`,
                borderBottom: `1px solid ${C.line}`,
                borderLeft:   `1px solid ${C.line}`,
                borderRadius: 4, background: "none",
                fontSize: 13, color: C.inkMid,
                cursor: photoUploading ? "default" : "pointer",
                fontFamily: F.body,
              }}
            >
              {photoUploading ? "Uploading…" : "📷 Change photo"}
            </button>
            <input
              ref={photoInputRef} type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
            {photoError && (
              <div style={{ fontSize: 12, color: "#a32d2d", marginTop: 6, fontFamily: F.body }}>
                {photoError}
              </div>
            )}
          </div>
        </div>

        {/* ── Read-only info ── */}
        <div style={{
          background: C.white,
          borderTop:    `1px solid ${C.line}`,
          borderRight:  `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
          borderLeft:   `1px solid ${C.line}`,
          borderRadius: 6, padding: 20, marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.inkLight, marginBottom: 14, fontFamily: F.body }}>
            Account info
          </div>
          <Field label="Email">
            <input value={profile?.user?.email ?? ""} disabled style={inputStyle(true)} />
          </Field>
          <Field label="Phone">
            <input value={profile?.user?.phone ?? ""} disabled style={inputStyle(true)} />
          </Field>
          <Field label="District">
            <input value={profile?.user?.district ?? ""} disabled style={inputStyle(true)} />
          </Field>
          <div style={{ fontSize: 12, color: C.inkLight, marginTop: -8, fontFamily: F.body }}>
            Email, phone, and district can only be changed by contacting Khokahano support.
          </div>
        </div>

        {/* ── Editable fields ── */}
        <div style={{
          background: C.white,
          borderTop:    `1px solid ${C.line}`,
          borderRight:  `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
          borderLeft:   `1px solid ${C.line}`,
          borderRadius: 6, padding: 20, marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.inkLight, marginBottom: 14, fontFamily: F.body }}>
            Personal details
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="First name">
              <input
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                style={inputStyle(false)}
              />
            </Field>
            <Field label="Last name">
              <input
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                style={inputStyle(false)}
              />
            </Field>
          </div>
          <Field label="Village" hint="optional">
            <input
              value={form.village}
              onChange={(e) => setField("village", e.target.value)}
              placeholder="e.g. Ha Matala"
              style={inputStyle(false)}
            />
          </Field>
        </div>

        {/* ── Farm details ── */}
        <div style={{
          background: C.white,
          borderTop:    `1px solid ${C.line}`,
          borderRight:  `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
          borderLeft:   `1px solid ${C.line}`,
          borderRadius: 6, padding: 20, marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.inkLight, marginBottom: 14, fontFamily: F.body }}>
            Farm details
          </div>
          <Field label="Farm name" hint="optional">
            <input
              value={form.farmName}
              onChange={(e) => setField("farmName", e.target.value)}
              placeholder="e.g. Mokhele Poultry Farm"
              style={inputStyle(false)}
            />
          </Field>
          <Field label="Bio" hint="shown on your marketplace profile">
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => setField("bio", e.target.value)}
              placeholder="Tell buyers about your farm — how long you've been farming, your practices, what makes your products special…"
              style={{ ...inputStyle(false), resize: "vertical", lineHeight: 1.5 }}
            />
          </Field>

          {/* Stats */}
          {profile && (
            <div style={{
              display: "flex", gap: 20, paddingTop: 14, marginTop: 4,
              borderTop: `1px solid ${C.line}`,
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: F.display, fontSize: 20, color: C.ink }}>{profile._count?.products ?? 0}</div>
                <div style={{ fontSize: 11, color: C.inkLight }}>Products</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: F.display, fontSize: 20, color: C.ink }}>{profile._count?.orders ?? 0}</div>
                <div style={{ fontSize: 11, color: C.inkLight }}>Orders received</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: F.display, fontSize: 20, color: C.ink }}>
                  {profile.isVerified ? "✓" : "—"}
                </div>
                <div style={{ fontSize: 11, color: profile.isVerified ? C.green : C.inkLight }}>
                  {profile.isVerified ? "Verified" : "Unverified"}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: F.display, fontSize: 20, color: C.ink }}>
                  {profile.subscription ?? "—"}
                </div>
                <div style={{ fontSize: 11, color: C.inkLight }}>Plan</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Save feedback ── */}
        {saveError && (
          <div style={{
            padding: "12px 16px", marginBottom: 16,
            background: "rgba(163,45,45,0.08)",
            borderTop:    `1px solid rgba(163,45,45,0.2)`,
            borderRight:  `1px solid rgba(163,45,45,0.2)`,
            borderBottom: `1px solid rgba(163,45,45,0.2)`,
            borderLeft:   `3px solid #a32d2d`,
            borderRadius: 4, fontSize: 14, color: "#a32d2d", fontFamily: F.body,
          }}>
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div style={{
            padding: "12px 16px", marginBottom: 16,
            background: "rgba(28,74,28,0.06)",
            borderTop:    `1px solid rgba(28,74,28,0.2)`,
            borderRight:  `1px solid rgba(28,74,28,0.2)`,
            borderBottom: `1px solid rgba(28,74,28,0.2)`,
            borderLeft:   `3px solid ${C.green}`,
            borderRadius: 4, fontSize: 14, color: C.green, fontFamily: F.body,
          }}>
            ✓ Profile saved
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%", padding: 14,
            background: saving ? C.inkLight : C.green,
            color: "#fff", border: "none", borderRadius: 4,
            fontSize: 15, fontWeight: 600,
            cursor: saving ? "default" : "pointer",
            fontFamily: F.body,
          }}
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </div>
  );
}