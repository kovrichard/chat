import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "fyzz-chat",
    name: "Fyzz.chat - Chat with the best AI models, all in one place",
    short_name: "Fyzz.chat",
    description:
      "One platform for GPT, Perplexity, Gemini, and more. Chat, speak with PDFs, and analyze images.",
    start_url: "/",
    display: "standalone",
    icons: [
      {
        src: "/any-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/any-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/monochrome-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "monochrome",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-desktop.png",
        sizes: "2880x1456",
        type: "image/png",
        form_factor: "wide",
        label: "Fyzz.chat desktop interface",
      },
      {
        src: "/screenshot-mobile.png",
        sizes: "593x1287",
        type: "image/png",
        form_factor: "narrow",
        label: "Fyzz.chat mobile interface",
      },
    ],
    background_color: "#2A2024",
    theme_color: "#2A2024",
    orientation: "portrait",
    lang: "en-US",
    dir: "ltr",
    scope: "/",
    categories: ["productivity", "utilities", "ai"],
    display_override: ["standalone", "browser"],
    shortcuts: [
      {
        name: "New Chat",
        url: "/chat",
        description: "Start a new conversation",
      },
    ],
  };
}
