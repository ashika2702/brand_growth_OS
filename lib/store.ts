import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Client {
  id: string;
  name: string;
  domain?: string;
  createdAt?: string;
}

interface ClientStore {
  activeClientId: string | null;
  clients: Client[];
  setActiveClientId: (id: string) => void;
  setClients: (clients: Client[]) => void;
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set) => ({
      activeClientId: null,
      clients: [],
      setActiveClientId: (id) => set({ activeClientId: id }),
      setClients: (clients) => set({ clients }),
    }),
    {
      name: 'client-storage',
    }
  )
);
