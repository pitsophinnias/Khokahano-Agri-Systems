// ---------------------------------------------------------------------------
// RegisterPage.jsx
// ---------------------------------------------------------------------------
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../AuthContext.jsx";
import { THEME, DISTRICTS } from "../../marketplace/constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

const INITIAL = {
  firstName: "", lastName: "", email: "", phone: "",
  password: "", confirmPassword: "",
  district: "", village: "", farmName: "",
};

export default function RegisterPage() {
  const { registerBuyer, registerFarmer, loading, error } = useAuthContext();
  const navigate = useNavigate();

  const [role,       setRole]       = useState(null); // "BUYER" | "FARMER"
  const [form,       setForm]       = useState(INITIAL);
  const [localError, setLocalError] = useState("");

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }
    if (!form.district) {
      setLocalError("Please select your district");
      return;
    }

    try {
      const payload = {
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, phone: form.phone,
        password: form.password,
        district: form.district, village: form.village,
        ...(role === "FARMER" ? { farmName: form.farmName } : {}),
      };

      if (role === "FARMER") {
        await registerFarmer(payload);
        navigate("/farmer");
      } else {
        await registerBuyer(payload);
        navigate("/");
      }
    } catch {
      // error set in useAuth
    }
  };

  const displayError = localError || error;

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    border: `1px solid ${C.line}`, borderRadius: 4,
    fontSize: 15, fontFamily: F.body, color: C.ink, outline: "none",
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 500, color: C.ink, display: "block", marginBottom: 6,
  };

  // Step 1 — choose role
  if (!role) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: F.body }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontFamily: F.display, fontSize: 22, color: C.ink }}>Create an account</div>
            <p style={{ fontSize: 13, color: C.inkLight, marginTop: 6 }}>Who are you joining as?</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { key: "BUYER",  icon: "🛒", title: "I want to buy",  desc: "Browse and order poultry products from local farmers" },
              { key: "FARMER", icon: "🐔", title: "I am a farmer",  desc: "List your products and receive orders from customers" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setRole(opt.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "18px 20px", background: C.white,
                  border: `1px solid ${C.line}`, borderRadius: 6,
                  cursor: "pointer", textAlign: "left", fontFamily: F.body,
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.green)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.line)}
              >
                <span style={{ fontSize: 28 }}>{opt.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: C.ink, marginBottom: 3 }}>{opt.title}</div>
                  <div style={{ fontSize: 12, color: C.inkLight }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.inkLight }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: C.green, fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 — fill form
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: F.body }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: F.display, fontSize: 22, color: C.ink }}>
            {role === "FARMER" ? "Register as a farmer" : "Create a buyer account"}
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 8, padding: 28 }}>
          {displayError && (
            <div style={{ background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#c62828", marginBottom: 16 }}>
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>First name</label>
                <input style={inputStyle} value={form.firstName} onChange={set("firstName")} placeholder="Nthabiseng" required
                  onFocus={(e) => (e.target.style.borderColor = C.green)}
                  onBlur={(e)  => (e.target.style.borderColor = C.line)} />
              </div>
              <div>
                <label style={labelStyle}>Last name</label>
                <input style={inputStyle} value={form.lastName} onChange={set("lastName")} placeholder="Mokoena" required
                  onFocus={(e) => (e.target.style.borderColor = C.green)}
                  onBlur={(e)  => (e.target.style.borderColor = C.line)} />
              </div>
            </div>

            {role === "FARMER" && (
              <div>
                <label style={labelStyle}>Farm name</label>
                <input style={inputStyle} value={form.farmName} onChange={set("farmName")} placeholder="Mokoena Poultry Farm"
                  onFocus={(e) => (e.target.style.borderColor = C.green)}
                  onBlur={(e)  => (e.target.style.borderColor = C.line)} />
              </div>
            )}

            <div>
              <label style={labelStyle}>Email address</label>
              <input type="email" style={inputStyle} value={form.email} onChange={set("email")} placeholder="you@example.com" required
                onFocus={(e) => (e.target.style.borderColor = C.green)}
                onBlur={(e)  => (e.target.style.borderColor = C.line)} />
            </div>

            <div>
              <label style={labelStyle}>Phone number</label>
              <input style={inputStyle} value={form.phone} onChange={set("phone")} placeholder="+266 5X XXX XXX" required
                onFocus={(e) => (e.target.style.borderColor = C.green)}
                onBlur={(e)  => (e.target.style.borderColor = C.line)} />
            </div>

            {/* Location */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>District</label>
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={form.district}
                  onChange={set("district")}
                  required
                >
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Village / Area</label>
                <input style={inputStyle} value={form.village} onChange={set("village")} placeholder="Ha Thetsane"
                  onFocus={(e) => (e.target.style.borderColor = C.green)}
                  onBlur={(e)  => (e.target.style.borderColor = C.line)} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" style={inputStyle} value={form.password} onChange={set("password")} placeholder="At least 8 characters" required
                onFocus={(e) => (e.target.style.borderColor = C.green)}
                onBlur={(e)  => (e.target.style.borderColor = C.line)} />
            </div>

            <div>
              <label style={labelStyle}>Confirm password</label>
              <input type="password" style={inputStyle} value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" required
                onFocus={(e) => (e.target.style.borderColor = C.green)}
                onBlur={(e)  => (e.target.style.borderColor = C.line)} />
            </div>

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
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.line}`, fontSize: 13, color: C.inkLight }}>
            <button onClick={() => setRole(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.inkLight, fontFamily: F.body, fontSize: 13 }}>
              ← Change role
            </button>
            <span>
              Have an account?{" "}
              <Link to="/login" style={{ color: C.green, fontWeight: 500 }}>Sign in</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}