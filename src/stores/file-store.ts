import { create } from "zustand";

interface FileStore {
  files: FileList | undefined;
  setFiles: (files: FileList | undefined) => void;
}

const scaleImageToMaxSize = async (file: File, maxSizeKB = 4000): Promise<Blob> => {
  const maxSize = maxSizeKB * 1024; // Convert KB to bytes

  // If the file is already small enough, return it as is
  if (file.size <= maxSize) {
    return file;
  }

  const img = new Image();
  img.src = URL.createObjectURL(file);

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  const originalExtension = file.name.split(".").pop()?.toLowerCase();
  const mimeType =
    originalExtension === "png"
      ? "image/png"
      : originalExtension === "webp"
        ? "image/webp"
        : "image/jpeg"; // Default to JPEG

  let scale = 0.9; // Start with 90% of original size since we know it's too big

  while (scale > 0.1) {
    // Set canvas dimensions
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Draw the image on the canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Convert canvas to Blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
        },
        mimeType,
        0.8
      ); // Adjust quality if needed
    });

    if (blob.size <= maxSize) {
      return blob; // Return the scaled image if it's under the size limit
    }

    scale *= 0.9; // Scale down by 10%
  }

  throw new Error("Unable to reduce image size below 4000KB");
};

export const useFileStore = create<FileStore>((set) => ({
  files: undefined,
  setFiles: async (files) => {
    if (!files) {
      set({ files: undefined });
      return;
    }

    try {
      const processedFiles = new DataTransfer();

      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          const scaledBlob = await scaleImageToMaxSize(file);
          const scaledFile = new File([scaledBlob], file.name, { type: file.type });
          processedFiles.items.add(scaledFile);
        } else {
          processedFiles.items.add(file);
        }
      }

      set({ files: processedFiles.files });
    } catch (error) {
      console.error("Error processing files:", error);
      set({ files }); // Fallback to original files if processing fails
    }
  },
}));
