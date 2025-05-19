import { type Model, getModel } from "@/lib/providers";
import { create } from "zustand";

interface ModelStore {
  model: Model;
  setModel: (model: string) => void;
  temporaryChat: boolean;
  setTemporaryChat: (temporaryChat: boolean) => void;
}

export const useModelStore = create<ModelStore>((set) => ({
  model: getModel("4o-mini") as Model,
  setModel: (model: string) => set({ model: getModel(model) }),
  temporaryChat: false,
  setTemporaryChat: (temporaryChat: boolean) => set({ temporaryChat }),
}));
