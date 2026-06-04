import { useState, useCallback } from "react";
import T from "../constants/translations.js";

/**
 * useLanguage
 * Provides the active language, a translation helper, and a setter.
 * Wrap your app in a context if you need lang shared across services;
 * for a single-service prototype this hook is enough.
 */
export function useLanguage(defaultLang = "en") {
  const [lang, setLang] = useState(defaultLang);

  /** Translate a key using the active language. Falls back to the key itself. */
  const t = useCallback(
    (key) => T[lang]?.[key] ?? key,
    [lang]
  );

  /**
   * Get a localised field from a product/farmer object.
   * e.g. lf(product, "title") returns product.title[lang]
   * Falls back to "en" if the current lang is missing.
   */
  const lf = useCallback(
    (obj, field) => {
      const val = obj?.[field];
      if (val === null || val === undefined) return "";
      if (typeof val === "object") return val[lang] ?? val.en ?? "";
      return val;
    },
    [lang]
  );

  return { lang, setLang, t, lf };
}