// ---------------------------------------------------------------------------
// LoginPage.jsx
// ---------------------------------------------------------------------------
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../AuthContext.jsx";
import { THEME } from "../../marketplace/constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

export default function LoginPage() {
  const { login, loading, error } = useAuthContext();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (!identifier || !password) {
      setLocalError("Please enter your email/phone and password");
      return;
    }
    try {
      const result = await login(identifier, password);
      if (result.user.role === "FARMER") {
        navigate("/farmer");
      } else if (result.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch {
      // error already set in useAuth
    }
  };

  const displayError = localError || error;

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: F.body,
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src={THEME.brand.logoUrl}
            alt="Khokahano"
            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div style={{ fontFamily: F.display, fontSize: 22, color: C.ink }}>
            {THEME.brand.name}
          </div>
          <div style={{ fontSize: 11, color: C.inkLight, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {THEME.brand.sub}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: C.white, border: `1px solid ${C.line}`,
          borderRadius: 8, padding: 28,
        }}>
          <h1 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.ink, marginBottom: 4 }}>
            Sign in
          </h1>
          <p style={{ fontSize: 13, color: C.inkLight, marginBottom: 24 }}>
            Use your email or phone number
          </p>

          {displayError && (
            <div style={{
              background: "#ffebee", border: "1px solid #ef9a9a",
              borderRadius: 4, padding: "10px 14px",
              fontSize: 13, color: "#c62828", marginBottom: 16,
            }}>
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.ink, display: "block", marginBottom: 6 }}>
                Email or phone number
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email@example.com or +266 5X XXX XXX"
                style={{
                  width: "100%", padding: "10px 12px",
                  border: `1px solid ${C.line}`, borderRadius: 4,
                  fontSize: 15, fontFamily: F.body, color: C.ink,
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = C.green)}
                onBlur={(e)  => (e.target.style.borderColor = C.line)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: C.ink, display: "block", marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: "100%", padding: "10px 12px",
                  border: `1px solid ${C.line}`, borderRadius: 4,
                  fontSize: 15, fontFamily: F.body, color: C.ink,
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = C.green)}
                onBlur={(e)  => (e.target.style.borderColor = C.line)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px",
                background: loading ? C.inkLight : C.green,
                color: "#fff", border: "none", borderRadius: 4,
                fontSize: 14, fontWeight: 500, cursor: loading ? "default" : "pointer",
                fontFamily: F.body, marginTop: 4,
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 20, paddingTop: 16, fontSize: 13, color: C.inkLight, textAlign: "center" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: C.green, fontWeight: 500 }}>Register</Link>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link to="/" style={{ fontSize: 13, color: C.inkLight }}>
            ← Back to marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}