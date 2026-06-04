// ---------------------------------------------------------------------------
// useCart.js
// Manages cart state. Cart persists in localStorage between page reloads.
// ---------------------------------------------------------------------------
import { useState, useCallback } from "react";

const CART_KEY = "kh_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function useCart() {
  const [items, setItems] = useState(loadCart);

  const persist = useCallback((next) => {
    setItems(next);
    saveCart(next);
  }, []);

  // Add to cart or increase qty if already there
  const addItem = useCallback((product, qty = product.minOrder) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      let next;
      if (existing) {
        next = prev.map((i) =>
          i.id === product.id
            ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
            : i
        );
      } else {
        next = [...prev, {
          id:       product.id,
          title:    product.title,        // bilingual obj
          price:    product.price,
          unit:     product.unit,         // bilingual obj
          currency: product.currency,
          image:    product.images[0],
          farmer:   product.farmer.name,  // bilingual obj
          district: product.district,
          stock:    product.stock,
          minOrder: product.minOrder,
          qty,
        }];
      }
      saveCart(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== productId);
      saveCart(next);
      return next;
    });
  }, []);

  const updateQty = useCallback((productId, qty) => {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === productId ? { ...i, qty: Math.max(i.minOrder, Math.min(i.stock, qty)) } : i
      );
      saveCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    saveCart([]);
    setItems([]);
  }, []);

  const total     = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, total, itemCount, addItem, removeItem, updateQty, clearCart };
}