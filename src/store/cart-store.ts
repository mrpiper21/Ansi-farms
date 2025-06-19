import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Product = {
	_id: string;
	name: string;
	category: string;
	description?: string;
	price: number;
	quantity: string;
	imageUrl?: string;
	farmer?: {
		_id?: string;
		userName?: string;
		email?: string;
		avatar?: string;
	};
	createdAt: string;
	updatedAt: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (productId: string) => number;
}

const useCartStore = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      
      // Add product to cart or increase quantity if already exists
      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product._id === product._id
          );
          
          if (existingItemIndex >= 0) {
            // Item exists, update quantity
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity,
            };
            return { items: updatedItems };
          } else {
            // New item, add to cart
            return { items: [...state.items, { product, quantity }] };
          }
        });
      },
      
      // Remove product from cart completely
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product._id !== productId),
        }));
      },
      
      // Update specific product quantity
      updateQuantity: (productId, newQuantity) => {
        if (newQuantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.product._id === productId
          );
          
          if (existingItemIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: newQuantity,
            };
            return { items: updatedItems };
          }
          return state;
        });
      },
      
      // Empty the cart
      clearCart: () => {
        set({ items: [] });
      },
      
      // Helper to get total number of items in cart
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      // Helper to calculate total price of all items in cart
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      
      // Helper to get quantity of a specific product in cart
      getItemQuantity: (productId) => {
        const item = get().items.find((item) => item.product._id === productId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCartStore;