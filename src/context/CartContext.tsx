"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  stock?: number;
  variantLabel?: string;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { status } = useSession();

  const guestCartKey = "jadeCartGuest";
  const legacyGuestKey = "jadeCart";

  const readGuestCart = () => {
    if (typeof window === "undefined") return [] as CartItem[];
    const saved = localStorage.getItem(guestCartKey);
    const legacySaved = saved ? null : localStorage.getItem(legacyGuestKey);
    const payload = saved ?? legacySaved;
    if (!payload) return [] as CartItem[];
    try {
      const parsed = JSON.parse(payload) as CartItem[];
      if (legacySaved && parsed.length > 0) {
        localStorage.setItem(guestCartKey, JSON.stringify(parsed));
        localStorage.removeItem(legacyGuestKey);
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse guest cart", e);
      return [] as CartItem[];
    }
  };

  const writeGuestCart = (items: CartItem[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(guestCartKey, JSON.stringify(items));
    localStorage.removeItem(legacyGuestKey);
  };

  const clearGuestCart = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(guestCartKey);
    localStorage.removeItem(legacyGuestKey);
  };

  const mergeCarts = (base: CartItem[], incoming: CartItem[]) => {
    const map = new Map<string, CartItem>();
    base.forEach((item) => map.set(item.productId, { ...item }));
    incoming.forEach((item) => {
      const existing = map.get(item.productId);
      if (existing) {
        map.set(item.productId, {
          ...existing,
          qty: existing.qty + item.qty,
          stock: item.stock ?? existing.stock,
          variantLabel: item.variantLabel ?? existing.variantLabel,
        });
      } else {
        map.set(item.productId, { ...item });
      }
    });
    return Array.from(map.values()).map((item) => {
      if (typeof item.stock !== "number") return item;
      if (item.stock <= 0) return { ...item, qty: 0 };
      return { ...item, qty: Math.min(item.qty, item.stock) };
    });
  };

  useEffect(() => {
    const syncAuthenticatedCart = async () => {
      setIsSyncing(true);
      const guestCart = readGuestCart();

      try {
        const response = await fetch("/api/cart");
        const data = await response.json();
        const serverCart = Array.isArray(data?.data?.items)
          ? (data.data.items as CartItem[])
          : [];
        const merged = mergeCarts(serverCart, guestCart);
        setCart(merged);
        setHasLoaded(true);

        await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: merged }),
        });

        if (guestCart.length > 0) {
          clearGuestCart();
        }
      } catch (e) {
        console.error("Failed to sync cart", e);
        if (guestCart.length > 0) {
          setCart(guestCart);
        }
        setHasLoaded(true);
      } finally {
        setIsSyncing(false);
      }
    };

    if (status === "authenticated") {
      syncAuthenticatedCart();
      return;
    }

    if (status === "unauthenticated") {
      setCart(readGuestCart());
      setHasLoaded(true);
    }
  }, [status]);

  useEffect(() => {
    if (!hasLoaded) return;

    if (status === "authenticated") {
      if (isSyncing) return;
      void fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      return;
    }

    if (status === "unauthenticated") {
      writeGuestCart(cart);
    }
  }, [cart, hasLoaded, isSyncing, status]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      const maxQty = item.stock ?? existing?.stock;
      if (typeof maxQty === "number" && maxQty <= 0) {
        return prev;
      }
      if (existing) {
        const nextQty = existing.qty + item.qty;
        const finalQty =
          typeof maxQty === "number" ? Math.min(nextQty, maxQty) : nextQty;
        return prev.map((i) =>
          i.productId === item.productId
            ? {
                ...i,
                qty: finalQty,
                stock: maxQty ?? i.stock,
              }
            : i,
        );
      }
      const finalQty =
        typeof maxQty === "number" ? Math.min(item.qty, maxQty) : item.qty;
      return [...prev, { ...item, qty: finalQty, stock: maxQty }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        if (typeof i.stock !== "number") return { ...i, qty };
        return { ...i, qty: Math.min(qty, i.stock) };
      }),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  );
  const cartCount = cart.reduce((count, item) => count + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
