// ---------------------------------------------------------------------------
// useLocation.js
// Handles geolocation consent, coordinate resolution, and district mapping.
//
// localStorage keys:
//   kh_location_consent  — "granted" | "denied"
//   kh_district          — resolved district name or "all"
//   kh_location_enabled  — "true" | "false"  (user can toggle auto-filter off)
// ---------------------------------------------------------------------------
import { useState, useEffect, useCallback } from "react";

const DISTRICT_BOUNDS = [
  { district: "Maseru",        latMin: -29.55, latMax: -29.15, lngMin: 27.30, lngMax: 27.65 },
  { district: "Leribe",        latMin: -28.70, latMax: -28.40, lngMin: 27.90, lngMax: 28.20 },
  { district: "Berea",         latMin: -29.15, latMax: -28.75, lngMin: 27.60, lngMax: 27.95 },
  { district: "Butha-Buthe",   latMin: -28.85, latMax: -28.55, lngMin: 28.15, lngMax: 28.55 },
  { district: "Mokhotlong",    latMin: -29.40, latMax: -29.00, lngMin: 28.80, lngMax: 29.15 },
  { district: "Mafeteng",      latMin: -29.90, latMax: -29.55, lngMin: 27.10, lngMax: 27.50 },
  { district: "Mohale's Hoek", latMin: -30.20, latMax: -29.80, lngMin: 27.30, lngMax: 27.80 },
  { district: "Qacha's Nek",   latMin: -30.20, latMax: -29.80, lngMin: 28.50, lngMax: 29.00 },
  { district: "Quthing",       latMin: -30.50, latMax: -30.10, lngMin: 27.50, lngMax: 28.00 },
  { district: "Thaba-Tseka",   latMin: -29.70, latMax: -29.30, lngMin: 28.40, lngMax: 28.90 },
];

function coordsToDistrict(lat, lng) {
  const match = DISTRICT_BOUNDS.find(
    (b) => lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax
  );
  return match ? match.district : null;
}

const CONSENT_KEY = "kh_location_consent";   // "granted" | "denied"
const DISTRICT_KEY = "kh_district";           // resolved district or "all"
const ENABLED_KEY  = "kh_location_enabled";   // "true" | "false"

export function useLocation() {
  const [consent,         setConsent]         = useState(() => localStorage.getItem(CONSENT_KEY));
  const [detectedDistrict,setDetectedDistrict]= useState(() => localStorage.getItem(DISTRICT_KEY) || "all");
  const [locationEnabled, setLocationEnabled] = useState(() => localStorage.getItem(ENABLED_KEY) !== "false");
  const [detecting,       setDetecting]       = useState(false);
  const [showBanner,      setShowBanner]       = useState(false);

  // Show consent banner only on first visit (consent === null)
  useEffect(() => {
    if (consent === null) {
      const t = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(t);
    }
  }, [consent]);

  // The district we actually expose: only apply it when locationEnabled is true
  // When disabled, return "all" so the filter shows everything
  const district = locationEnabled ? detectedDistrict : "all";

  const requestLocation = useCallback(() => {
    setShowBanner(false);
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const found    = coordsToDistrict(latitude, longitude);
        const resolved = found || "all";
        setDetectedDistrict(resolved);
        localStorage.setItem(DISTRICT_KEY, resolved);
        localStorage.setItem(CONSENT_KEY,  "granted");
        localStorage.setItem(ENABLED_KEY,  "true");
        setConsent("granted");
        setLocationEnabled(true);
        setDetecting(false);
      },
      () => {
        localStorage.setItem(CONSENT_KEY, "denied");
        setConsent("denied");
        setDetecting(false);
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  const denyLocation = useCallback(() => {
    setShowBanner(false);
    localStorage.setItem(CONSENT_KEY, "denied");
    setConsent("denied");
    setDetectedDistrict("all");
  }, []);

  // Toggle the auto-filter on or off without revoking consent or
  // losing the detected district — so it can be re-enabled instantly.
  const toggleLocation = useCallback(() => {
    setLocationEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(ENABLED_KEY, String(next));
      return next;
    });
  }, []);

  // Full reset — clears everything and shows the banner again
  const resetLocation = useCallback(() => {
    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(DISTRICT_KEY);
    localStorage.removeItem(ENABLED_KEY);
    setConsent(null);
    setDetectedDistrict("all");
    setLocationEnabled(true);
    setTimeout(() => setShowBanner(true), 100);
  }, []);

  return {
    district,           // "all" when disabled, detected district when enabled
    detectedDistrict,   // always the raw detected value (useful for showing the pill)
    consent,
    locationEnabled,    // whether the auto-filter is currently active
    detecting,
    showBanner,
    requestLocation,
    denyLocation,
    toggleLocation,     // toggle auto-filter on/off
    resetLocation,
  };
}