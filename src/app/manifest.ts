import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fyzz.chat - One platform for every AI mind",
    short_name: "Fyzz.chat",
    description:
      "Fyzz.chat is your gateway to seamless conversations with a growing collection of AI models like GPT, Claude, Llama, Perplexity, and more. Experience the future of AI-powered communication in one intuitive platform.",
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
