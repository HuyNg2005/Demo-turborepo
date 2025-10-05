import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
    activeProjectId: string | null;
    isModalOpen: boolean;
    isInviteModalOpen: boolean;
    viewMode: "board" | "table";
    editingTaskId: string | null;
    setActiveProjectId: (id: string | null) => void;
    openModal: (taskId?: string) => void;
    closeModal: () => void;
    openInviteModal: () => void;
    closeInviteModal: () => void;
    setViewMode: (mode: "board" | "table") => void;
};

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            activeProjectId: null,
            isModalOpen: false,
            isInviteModalOpen: false,
            viewMode: "board",
            editingTaskId: null,
            setActiveProjectId: (id) => set({ activeProjectId: id }),
            openModal: (taskId) => set({ isModalOpen: true, editingTaskId: taskId ?? null }),
            closeModal: () => set({ isModalOpen: false, editingTaskId: null }),
            openInviteModal: () => set({ isInviteModalOpen: true }),
            closeInviteModal: () => set({ isInviteModalOpen: false }),
            setViewMode: (mode) => set({ viewMode: mode }),
        }),
        { name: "ui-storage" }
    )
);

type ThemeState = {
    theme: "light" | "dark";
    toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
    theme: "light",
    toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
}));