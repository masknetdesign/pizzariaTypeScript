import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '../types';

interface CartContextData {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Carregar itens do carrinho do AsyncStorage
  React.useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('@PizzaApp:cart');
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      }
    };

    loadCart();
  }, []);

  // Salvar itens do carrinho no AsyncStorage
  const saveCart = async (newItems: CartItem[]) => {
    try {
      await AsyncStorage.setItem('@PizzaApp:cart', JSON.stringify(newItems));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  };

  const addToCart = useCallback((newItem: CartItem) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        item => item.product.id === newItem.product.id
      );

      let newItems;
      if (existingItemIndex >= 0) {
        newItems = currentItems.map((item, index) => {
          if (index === existingItemIndex) {
            return {
              ...item,
              quantity: item.quantity + newItem.quantity,
            };
          }
          return item;
        });
      } else {
        newItems = [...currentItems, newItem];
      }

      saveCart(newItems);
      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(item => item.product.id !== productId);
      saveCart(newItems);
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems(currentItems => {
      const newItems = currentItems.map(item => {
        if (item.product.id === productId) {
          return { ...item, quantity };
        }
        return item;
      });
      saveCart(newItems);
      return newItems;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    saveCart([]);
  }, []);

  const total = items.reduce((sum, item) => {
    const itemPrice = item.product.price;
    return sum + (itemPrice * item.quantity);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
