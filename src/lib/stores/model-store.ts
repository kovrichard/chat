import { create } from "zustand";

type ModelStore = {
  model: string;
  setModel: (model: string) => void;
};

export const useModelStore = create<ModelStore>((set) => ({
  model: "4o-mini",
  setModel: (model) => set({ model }),
}));
