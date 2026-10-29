import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  cafeId: string;
  itemId: string;
  name: string;
  price: number | null;
  priceVerified: boolean;
  quantity: number;
}

interface CartContextProps {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.itemId === item.itemId);
      if (existing) {
        return prev.map(i => i.itemId === item.itemId ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.itemId !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems(prev => prev.map(i => i.itemId === itemId ? { ...i, quantity: Math.max(1, quantity) } : i));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
