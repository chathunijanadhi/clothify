import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./auth.context";
import * as cartService from "./cart.service";

interface CartContextShape {
  /** Full cart object from the API */
  cart: any;
  /** Set of product IDs currently in the cart (for quick lookup) */
  cartProductIds: Set<string>;
  /** Total item count in the cart */
  count: number;
  loading: boolean;
  isInCart: (productId: string) => boolean;
  addToCart: (payload: { productId: string; variantId?: string | null; quantity?: number }) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  reload: () => Promise<void>;
}

const CartContext = createContext<CartContextShape | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    reload();
  }, [authLoading, user, reload]);

  const cartProductIds = useMemo<Set<string>>(
    () => new Set<string>((cart?.items ?? []).map((item: any) => item.product_id as string)),
    [cart],
  );

  const isInCart = useCallback((productId: string) => cartProductIds.has(productId), [cartProductIds]);

  const addToCart = useCallback(async (payload: { productId: string; variantId?: string | null; quantity?: number }) => {
    if (!user) return;
    try {
      const updated = await cartService.addItem(payload);
      setCart(updated);
    } catch (err) {
      throw err;
    }
  }, [user]);

  const removeFromCart = useCallback(async (itemId: string) => {
    if (!user) return;
    try {
      const updated = await cartService.removeItem(itemId);
      setCart(updated);
    } catch (err) {
      throw err;
    }
  }, [user]);

  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    if (!user) return;
    try {
      const updated = await cartService.updateItem(itemId, quantity);
      setCart(updated);
    } catch (err) {
      throw err;
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    try {
      const updated = await cartService.clearCart();
      setCart(updated);
    } catch (err) {
      throw err;
    }
  }, [user]);

  const count = useMemo(() => (cart?.items ?? []).length, [cart]);

  const value = useMemo(() => ({
    cart, cartProductIds, count, loading,
    isInCart, addToCart, removeFromCart, updateCartItem, clearCart, reload,
  }), [cart, cartProductIds, count, loading, isInCart, addToCart, removeFromCart, updateCartItem, clearCart, reload]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
