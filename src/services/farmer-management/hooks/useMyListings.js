// ---------------------------------------------------------------------------
// useMyListings.js — fetch and manage a farmer's own product listings
// ---------------------------------------------------------------------------
import { useState, useEffect, useCallback } from "react";
import {
  fetchMyListings,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
} from "../../marketplace/api/marketplace.api.js";

export function useMyListings() {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyListings();
      setListings(Array.isArray(data) ? data : data.products ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addListing = useCallback(async (formData) => {
    const product = await createProduct(formData);
    setListings((prev) => [product, ...prev]);
    return product;
  }, []);

  const editListing = useCallback(async (productId, data) => {
    const product = await updateProduct(productId, data);
    setListings((prev) => prev.map((p) => p.id === productId ? product : p));
    return product;
  }, []);

  const updateListingStock = useCallback(async (productId, quantity) => {
    await updateStock(productId, quantity);
    setListings((prev) => prev.map((p) =>
      p.id === productId ? { ...p, stock: parseInt(quantity) } : p
    ));
  }, []);

  const removeListing = useCallback(async (productId) => {
    await deleteProduct(productId);
    setListings((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  return { listings, loading, error, reload: load, addListing, editListing, updateListingStock, removeListing };
}