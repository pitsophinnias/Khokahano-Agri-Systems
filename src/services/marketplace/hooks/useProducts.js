import { useState, useEffect, useCallback } from "react";
import { fetchProducts, fetchMarketplaceStats } from "../api/marketplace.api.js";

/**
 * useProducts
 * Manages product list state: fetching, filtering, sorting, loading, error.
 * Components call setFilter/setSort; this hook owns the fetch lifecycle.
 */
export function useProducts() {
  const [products, setProducts]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [filters, setFiltersState] = useState({
    category: "all",
    district: "all",
    query:    "",
    sort:     "default",
  });

  const load = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const [{ products: data }, statsData] = await Promise.all([
        fetchProducts(params),
        fetchMarketplaceStats(),
      ]);
      setProducts(data);
      setStats(statsData);
    } catch (err) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Update one or more filter fields and refetch */
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

/**
 * useOrderSubmit
 * Manages the order submission lifecycle separately from product loading.
 */
export function useOrderSubmit(submitFn) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
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