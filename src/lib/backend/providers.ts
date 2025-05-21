import "server-only";

import type { Feature, Model, Provider } from "@/types/provider";

export function getProviders() {
  return providers;
}

export function countModels() {
  return providers.flatMap((provider) => provider.models).length;
}

export function getModel(modelId: string): Model | undefined {
  return providers
    .flatMap((provider) => provider.models)
    .find((model) => model.id === modelId);
}

const reasoning: Feature = {
  name: "Reasoning",
  description: "Reasoning model",
  icon: "brain",
  color: "text-yellow-500",
};

const search: Feature = {
  name: "Search",
  description: "Searches the web for information",
  icon: "globe",
  color: "text-blue-500",
};

const coding: Feature = {
  name: "Coding",
  description: "Excels at coding tasks",
  icon: "codeXml",
  color: "text-green-500",
};

const images: Feature = {
  name: "Images",
  description: "Supports images",
  icon: "image",
  color: "text-orange-500",
};

const pdf: Feature = {
  name: "PDFs",
  description: "Supports PDFs",
  icon: "fileText",
  color: "text-purple-500",
};

const providers: Provider[] = [
  {
    name: "OpenAI",
    icon: "openai",
    models: [
      {
        id: "o4-mini",
        name: "o4-mini",
        features: [images, reasoning],
      },
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        features: [images, coding],
      },
      {
        id: "4.1-mini",
        name: "GPT-4.1 mini",
        features: [images, coding],
      },
      {
        id: "4o-mini",
        name: "GPT-4o mini",
        features: [images],
      },
      {
        id: "o3-mini",
        name: "o3-mini",
        features: [reasoning],
      },
    ],
  },
  {
    name: "Anthropic",
    icon: "anthropic",
    models: [
      {
        id: "claude-3-7-sonnet",
        name: "Claude 3.7 Sonnet",
        features: [images, pdf],
      },
      {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet",
        features: [images, pdf],
      },
      {
        id: "claude-3-5-haiku",
        name: "Claude 3.5 Haiku",
        features: [images, pdf],
      },
    ],
  },
  {
    name: "Google",
    icon: "google",
    models: [
      {
        id: "gemini-2.5-pro-preview",
        name: "Gemini 2.5 Pro",
        features: [images, pdf, reasoning],
      },
      {
        id: "gemini-2.5-flash-preview",
        name: "Gemini 2.5 Flash",
        features: [images, pdf, search],
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        features: [images, pdf, search],
      },
      {
        id: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
        features: [images, pdf],
      },
    ],
  },
  {
    name: "xAI",
    icon: "xai",
    models: [
      {
        id: "grok-3-beta",
        name: "Grok 3",
      },
      {
        id: "grok-3-mini-beta",
        name: "Grok 3 mini",
        features: [reasoning],
      },
      {
        id: "grok-2-1212",
        name: "Grok 2",
      },
    ],
  },
  {
    name: "Meta",
    icon: "meta",
    models: [
      {
        id: "llama-3.1-405b",
        name: "Llama 3.1 405B",
      },
      {
        id: "llama-4-scout",
        name: "Llama 4 Scout",
        features: [images],
      },
      {
        id: "llama-4-maverick",
        name: "Llama 4 Maverick",
        features: [images],
      },
    ],
  },
  {
    name: "DeepSeek",
    icon: "deepseek",
    models: [
      {
        id: "deepseek-r1",
        name: "DeepSeek R1",
        features: [reasoning],
      },
      {
        id: "deepseek-v3",
        name: "DeepSeek V3",
      },
    ],
  },
  {
    name: "Perplexity",
    icon: "perplexity",
    models: [
      {
        id: "sonar",
        name: "Sonar",
        features: [search],
      },
      {
        id: "sonar-pro",
        name: "Sonar Pro",
        features: [search],
      },
    ],
  },
];
