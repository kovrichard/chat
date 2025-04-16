import { create } from "zustand";

interface SearchStore {
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
