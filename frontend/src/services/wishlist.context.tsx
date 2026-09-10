import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./auth.context";
import * as wishlistService from "./wishlist.service";

interface WishlistContextShape {
  wishlistedIds: Set<string>;
  count: number;
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  reload: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextShape | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setWishlistedIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      const ids = new Set<string>((data?.items ?? []).map((item: { product_id: string }) => item.product_id));
      setWishlistedIds(ids);
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    if (authLoading) return;
    if (!user) {
      setWishlistedIds(new Set());
      return;
    }
    setLoading(true);
    wishlistService
      .getWishlist()
      .then((data) => {
        if (!active) return;
        const ids = new Set<string>((data?.items ?? []).map((item: { product_id: string }) => item.product_id));
        setWishlistedIds(ids);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authLoading, user]);

  const isWishlisted = useCallback((productId: string) => wishlistedIds.has(productId), [wishlistedIds]);

  const addToWishlist = useCallback(async (productId: string) => {
    if (!user) return;
    setWishlistedIds((prev) => new Set([...prev, productId]));
    try {
      await wishlistService.addItem(productId);
    } catch {
      setWishlistedIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
    }
  }, [user]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!user) return;
    setWishlistedIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
    try {
      await wishlistService.removeItem(productId);
    } catch {
      setWishlistedIds((prev) => new Set([...prev, productId]));
    }
  }, [user]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (wishlistedIds.has(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  }, [wishlistedIds, addToWishlist, removeFromWishlist]);

  const value = useMemo(() => ({
    wishlistedIds, count: wishlistedIds.size, loading,
    isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist, reload,
  }), [wishlistedIds, loading, isWishlisted, addToWishlist, removeFromWishlist, toggleWishlist, reload]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
