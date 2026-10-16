import { create } from "zustand";

type AdminUiState = {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  commandOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
};

export const useAdminUiStore = create<AdminUiState>((set, get) => ({
  sidebarCollapsed: false,
  sidebarOpen: false,
  commandOpen: false,
  toggleSidebar() {
    set({ sidebarCollapsed: !get().sidebarCollapsed });
  },
  setSidebarOpen(sidebarOpen) {
    set({ sidebarOpen });
  },
  setCommandOpen(commandOpen) {
    set({ commandOpen });
  },
}));

export default useAdminUiStore;
