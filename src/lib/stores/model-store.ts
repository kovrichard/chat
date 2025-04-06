import { create } from "zustand";
import { Model, getModel } from "../providers";

type ModelStore = {
  model: Model;
  setModel: (modelId: string) => void;
};

export const useModelStore = create<ModelStore>((set) => ({
  model: getModel("4o-mini") as Model,
  setModel: (modelId) => set({ model: getModel(modelId) }),
}));
