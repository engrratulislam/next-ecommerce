import { create } from "zustand";

interface UIStore {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  toggleMobileMenu: () => void;
  toggleCart: () => void;
  closeMobileMenu: () => void;
  closeCart: () => void;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  closeCart: () => set({ isCartOpen: false }),
  showToast: (message, type) => {
    // This will be handled by react-hot-toast in components
    console.log(`[${type.toUpperCase()}] ${message}`);
  },
}));
