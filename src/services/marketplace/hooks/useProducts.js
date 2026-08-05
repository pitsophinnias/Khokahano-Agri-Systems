// ---------------------------------------------------------------------------
// useProducts.js — now calls the real API
// ---------------------------------------------------------------------------
import { useState, useEffect, useCallback } from "react";
import { fetchProducts, fetchMarketplaceStats } from "../api/marketplace.api.js";

export function useProducts() {
  const [products, setProducts]     = useState([]);
  const [stats,    setStats]        = useState(null);
  const [loading,  setLoading]      = useState(true);
  const [error,    setError]        = useState(null);
  const [filters,  setFiltersState] = useState({
    category: "all",
    district: "all",
    query:    "",
    sort:     "default",
  });

  const load = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const [result, statsData] = await Promise.all([
        fetchProducts(params),
        fetchMarketplaceStats(),
      ]);
      // API returns { products, total, page } — extract the array
      setProducts(result.products ?? result);
      setStats(statsData);
    } catch (err) {
      setError(err.message ?? "Could not load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilter = useCallback((updates) => {
    setFiltersState((prev) => {
      const next = { ...prev, ...updates };
      load(next);
      return next;
    });
  }, [load]);

  const retry = useCallback(() => load(filters), [load, filters]);

  return { products, stats, loading, error, filters, setFilter, retry };
}

export function useOrderSubmit(submitFn) {
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const submit = useCallback(async (payload) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitFn(payload);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }, [submitFn]);

  const reset = useCallback(() => {
    setSubmitted(false);
    setSubmitError(null);
  }, []);

  return { submit, submitting, submitted, submitError, reset };
}