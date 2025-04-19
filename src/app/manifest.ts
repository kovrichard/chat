import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fyzz.chat - Chat with the best AI models, all in one place",
    short_name: "Fyzz.chat",
    description:
      "One platform for GPT, Perplexity, Gemini, and more. Chat, speak with PDFs, and analyze images.",
    start_url: "/",
    display: "standalone",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
