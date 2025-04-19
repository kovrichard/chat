import { create } from "zustand";

interface FileStore {
  files: FileList | undefined;
  setFiles: (files: FileList | undefined) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  files: undefined,
  setFiles: (files) => set({ files }),
}));
