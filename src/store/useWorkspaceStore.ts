import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Workspace {
  _id: string;
  name: string; 
  createdAt: string;
}

interface WorkspaceState {
  activeWorkspaceId: string | null;
  workspaces: Workspace[];
  setActiveWorkspaceId: (id: string | null) => void;
  setActiveWorkspace: (id: string | null) => void; 
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  fetchWorkspaces: () => Promise<void>; 
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      workspaces: [],

      setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
      setWorkspaces: (workspaces) => set({ workspaces }),
      
      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [workspace, ...state.workspaces],
        })),

      fetchWorkspaces: async () => { 
        try {
          // 🚀 FIX: Ab cache purana data nahi dega
          const res = await fetch("/api/workspace", { cache: 'no-store' });
          const data = await res.json();
          if (data.success) {
            set({ workspaces: data.workspaces });
          }
        } catch (error) {
          console.error("Failed to global fetch workspaces", error);
        }
      },

    }),
    {
      name: 'workspace-storage', 
    }
  )
);