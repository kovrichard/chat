import { Metadata } from "next";

export const metaTitle = "Fyzz.chat - One platform for every AI mind";
export const metaDescription =
  "Fyzz.chat is your gateway to seamless conversations with a growing collection of AI models like GPT, Claude, Llama, Perplexity, and more. Experience the future of AI-powered communication in one intuitive platform.";
export const canonicalUrl = "https://www.fyzz.chat";

export const openGraph: Metadata["openGraph"] = {
  title: metaTitle,
  description: metaDescription,
  type: "website",
  siteName: "Fyzz.chat",
  locale: "en_US",
  images: [
    {
      url: "/opengraph-image.png",
      width: 1200,
      height: 630,
    },
  ],
};

export const twitter: Metadata["twitter"] = {
  title: metaTitle,
  description: metaDescription,
  card: "summary_large_image",
  images: [
    {
      url: "/twitter-image.png",
      width: 1200,
      height: 630,
    },
  ],
};
