import "server-only";

import type { Feature, Model, Provider } from "@/types/provider";

const openaiConfigured =
  process.env.AZURE_API_KEY !== undefined &&
  process.env.AZURE_RESOURCE_NAME !== undefined &&
  process.env.AZURE_GPT41_API_KEY !== undefined &&
  process.env.AZURE_GPT41_RESOURCE_NAME !== undefined;
const anthropicConfigured = process.env.ANTHROPIC_API_KEY !== undefined;
const googleConfigured = process.env.GOOGLE_GENERATIVE_AI_API_KEY !== undefined;
const xaiConfigured = process.env.XAI_API_KEY !== undefined;
const metaConfigured = process.env.FIREWORKS_API_KEY !== undefined;
const deepseekConfigured = process.env.FIREWORKS_API_KEY !== undefined;
const perplexityConfigured = process.env.PERPLEXITY_API_KEY !== undefined;

export function getProviders() {
  return providers.filter((provider) => {
    if (provider.name === "OpenAI" && !openaiConfigured) {
      return false;
    }
    if (provider.name === "Anthropic" && !anthropicConfigured) {
      return false;
    }
    if (provider.name === "Google" && !googleConfigured) {
      return false;
    }
    if (provider.name === "xAI" && !xaiConfigured) {
      return false;
    }
    if (provider.name === "Meta" && !metaConfigured) {
      return false;
    }
    if (provider.name === "DeepSeek" && !deepseekConfigured) {
      return false;
    }
    if (provider.name === "Perplexity" && !perplexityConfigured) {
      return false;
    }
    return true;
  });
}

export function countModels() {
  return getProviders().flatMap((provider) => provider.models).length;
}

export function getModel(modelId: string): Model | undefined {
  return getProviders()
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
        id: "claude-sonnet-4",
        name: "Claude Sonnet 4",
        features: [images, pdf],
      },
      {
        id: "claude-opus-4",
        name: "Claude Opus 4",
        features: [images, pdf],
      },
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
