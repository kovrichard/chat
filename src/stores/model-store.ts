import type { Model } from "@/types/provider";
import { create } from "zustand";

interface ModelStore {
  model: Model;
  setModel: (model: string) => void;
  temporaryChat: boolean;
  setTemporaryChat: (temporaryChat: boolean) => void;
  availableModels: Model[];
  setAvailableModels: (availableModels: Model[]) => void;
}

function getModelById(models: Model[], modelId: string): Model {
  return models.find((m) => m.id === modelId) || models[0];
}

export const useModelStore = create<ModelStore>((set) => ({
  model: {} as Model,
  setModel: (modelId: string) =>
    set((state) => ({
      model: getModelById(state.availableModels, modelId),
    })),
  temporaryChat: false,
  setTemporaryChat: (temporaryChat: boolean) => set({ temporaryChat }),
  availableModels: [],
  setAvailableModels: (availableModels: Model[]) =>
    set(() => ({
      availableModels,
      model: getModelById(availableModels, "4o-mini"),
    })),
}));
