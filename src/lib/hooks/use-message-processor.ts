import { useEffect, useRef } from "react";

export function useMessageProcessor() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL("../workers/message-processor.worker.ts", import.meta.url),
      { type: "module" }
    );

    return () => {
      // Cleanup worker
      workerRef.current?.terminate();
    };
  }, []);

  const processMessages = async (messages: any[]) => {
    if (!workerRef.current) {
      throw new Error("Worker not initialized");
    }

    return new Promise((resolve, reject) => {
      const worker = workerRef.current!;

      const handleMessage = (e: MessageEvent) => {
        worker.removeEventListener("message", handleMessage);
        worker.removeEventListener("error", handleError);
        resolve(e.data);
      };

      const handleError = (error: ErrorEvent) => {
        worker.removeEventListener("message", handleMessage);
        worker.removeEventListener("error", handleError);
        reject(error);
      };

      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError);

      worker.postMessage(messages);
    });
  };

  return { processMessages };
}
