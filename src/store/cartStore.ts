import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CartItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: { name: string; value: string }) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variant?: { name: string; value: string }
  ) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existingItems = get().items;
        const existingItemIndex = existingItems.findIndex(
          (i) =>
            i.product === item.product &&
            JSON.stringify(i.variant) === JSON.stringify(item.variant)
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...existingItems];
          updatedItems[existingItemIndex].quantity += item.quantity;
          set({ items: updatedItems });
        } else {
          set({ items: [...existingItems, item] });
        }
      },
      removeItem: (productId, variant) => {
        set({
          items: get().items.filter(
            (item) =>
              !(
                item.product === productId &&
                JSON.stringify(item.variant) === JSON.stringify(variant)
              )
          ),
        });
      },
      updateQuantity: (productId, quantity, variant) => {
        if (quantity <= 0) {
          get().removeItem(productId, variant);
          return;
        }

        const updatedItems = get().items.map((item) =>
          item.product === productId &&
          JSON.stringify(item.variant) === JSON.stringify(variant)
            ? { ...item, quantity }
            : item
        );
        set({ items: updatedItems });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
