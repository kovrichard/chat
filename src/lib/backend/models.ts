import { type AnthropicProvider, anthropic } from "@ai-sdk/anthropic";
import { type AzureOpenAIProvider, createAzure } from "@ai-sdk/azure";
import { type FireworksProvider, fireworks } from "@ai-sdk/fireworks";
import { google } from "@ai-sdk/google";
import { type PerplexityProvider, perplexity } from "@ai-sdk/perplexity";
import { type XaiProvider, xai } from "@ai-sdk/xai";
import { type LanguageModelV1, extractReasoningMiddleware, wrapLanguageModel } from "ai";

const azure = createAzure({
  apiVersion: "2024-12-01-preview",
});

const azure41 = createAzure({
  apiVersion: "2024-12-01-preview",
  apiKey: process.env.AZURE_GPT41_API_KEY,
  resourceName: process.env.AZURE_GPT41_RESOURCE_NAME,
});

function wrappedGoogle(model: string, browse: boolean) {
  return google(model, { useSearchGrounding: browse });
}

function wrappedModel(
  provider:
    | AzureOpenAIProvider
    | AnthropicProvider
    | XaiProvider
    | FireworksProvider
    | PerplexityProvider
) {
  return function (model: string, _browse: boolean) {
    return provider(model);
  };
}

const reasoningFireworks = (model: string, _browse: boolean) => {
  return wrapLanguageModel({
    model: fireworks(model),
    middleware: extractReasoningMiddleware({ tagName: "think" }),
  });
};

const allowedModels = {
  // OpenAI
  "o4-mini": { id: "o4-mini", provider: wrappedModel(azure41), tools: true },
  "gpt-4.1": { id: "gpt-4.1", provider: wrappedModel(azure41), tools: true },
  "4.1-mini": { id: "gpt-4.1-mini", provider: wrappedModel(azure41), tools: true },
  "4o-mini": { id: "gpt-4o-mini", provider: wrappedModel(azure), tools: true },
  "o3-mini": { id: "o3-mini", provider: wrappedModel(azure), tools: true },

  // Anthropic
  "claude-3-7-sonnet": {
    id: "claude-3-7-sonnet-20250219",
    provider: wrappedModel(anthropic),
    tools: true,
  },
  "claude-3-5-sonnet": {
    id: "claude-3-5-sonnet-20240620",
    provider: wrappedModel(anthropic),
    tools: true,
  },
  "claude-3-5-haiku": {
    id: "claude-3-5-haiku-20241022",
    provider: wrappedModel(anthropic),
    tools: true,
  },

  // Google
  "gemini-2.5-pro-preview": {
    id: "models/gemini-2.5-pro-preview-03-25",
    provider: wrappedGoogle,
    tools: true,
  },
  "gemini-2.5-flash-preview": {
    id: "gemini-2.5-flash-preview-04-17",
    provider: wrappedGoogle,
    tools: true,
  },
  "gemini-2.0-flash": { id: "gemini-2.0-flash", provider: wrappedGoogle, tools: true },
  "gemini-2.0-flash-lite": {
    id: "gemini-2.0-flash-lite",
    provider: wrappedGoogle,
    tools: true,
  },

  // xAI
  "grok-3-beta": { id: "grok-3-beta", provider: wrappedModel(xai), tools: true },
  "grok-3-mini-beta": {
    id: "grok-3-mini-beta",
    provider: wrappedModel(xai),
    tools: true,
  },
  "grok-2-1212": { id: "grok-2-1212", provider: wrappedModel(xai), tools: false },

  // Fireworks
  "llama-3.1-405b": {
    id: "accounts/fireworks/models/llama-v3p1-405b-instruct",
    provider: wrappedModel(fireworks),
    tools: true,
  },
  "llama-4-scout": {
    id: "accounts/fireworks/models/llama4-scout-instruct-basic",
    provider: wrappedModel(fireworks),
    tools: true,
  },
  "llama-4-maverick": {
    id: "accounts/fireworks/models/llama4-maverick-instruct-basic",
    provider: wrappedModel(fireworks),
    tools: true,
  },
  "deepseek-r1": {
    id: "accounts/fireworks/models/deepseek-r1",
    provider: reasoningFireworks,
    tools: false,
  },
  "deepseek-v3": {
    id: "accounts/fireworks/models/deepseek-v3",
    provider: wrappedModel(fireworks),
    tools: true,
  },

  // Perplexity
  sonar: { id: "sonar", provider: wrappedModel(perplexity), tools: false },
  "sonar-pro": { id: "sonar-pro", provider: wrappedModel(perplexity), tools: false },
};

export function getModel(modelId: string, browse: boolean) {
  const { id, provider, tools } = allowedModels[modelId as keyof typeof allowedModels];

  return { model: provider(id, browse), supportsTools: tools };
}
