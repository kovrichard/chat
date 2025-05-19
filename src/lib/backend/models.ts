import { type AnthropicProviderOptions, anthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { fireworks } from "@ai-sdk/fireworks";
import { google } from "@ai-sdk/google";
import { perplexity } from "@ai-sdk/perplexity";
import { xai } from "@ai-sdk/xai";
import { extractReasoningMiddleware, wrapLanguageModel } from "ai";

const azure = createAzure({
  apiVersion: "2024-12-01-preview",
});

const azure41 = createAzure({
  apiVersion: "2024-12-01-preview",
  apiKey: process.env.AZURE_GPT41_API_KEY,
  resourceName: process.env.AZURE_GPT41_RESOURCE_NAME,
});

const reasoningFireworks = (model: string) => {
  return wrapLanguageModel({
    model: fireworks(model),
    middleware: extractReasoningMiddleware({ tagName: "think" }),
  });
};

export const allowedModels = {
  // OpenAI
  "o4-mini": azure41("o4-mini"),
  "gpt-4.1": azure41("gpt-4.1"),
  "4.1-mini": azure41("gpt-4.1-mini"),
  "4o-mini": azure("gpt-4o-mini"),
  "o3-mini": azure("o3-mini"),

  // Anthropic
  "claude-3-7-sonnet": anthropic("claude-3-7-sonnet-20250219"),
  "claude-3-7-sonnet-reasoning": anthropic("claude-3-7-sonnet-20250219"),
  "claude-3-5-sonnet": anthropic("claude-3-5-sonnet-20240620"),
  "claude-3-5-haiku": anthropic("claude-3-5-haiku-20241022"),

  // Google
  "gemini-2.5-pro-preview": google("gemini-2.5-pro-exp-03-25"),
  "gemini-2.5-flash-preview": google("gemini-2.5-flash-preview-04-17", {
    useSearchGrounding: true,
  }),
  "gemini-2.0-flash": google("gemini-2.0-flash", { useSearchGrounding: true }),
  "gemini-2.0-flash-lite": google("gemini-2.0-flash-lite"),

  // xAI
  "grok-3-beta": xai("grok-3-beta"),
  "grok-3-mini-beta": xai("grok-3-mini-beta"),
  "grok-2-1212": xai("grok-2-1212"),

  // Fireworks
  "llama-3.1-405b": fireworks("accounts/fireworks/models/llama-v3p1-405b-instruct"),
  "llama-4-scout": fireworks("accounts/fireworks/models/llama4-scout-instruct-basic"),
  "llama-4-maverick": fireworks(
    "accounts/fireworks/models/llama4-maverick-instruct-basic"
  ),
  "deepseek-r1": reasoningFireworks("accounts/fireworks/models/deepseek-r1"),
  "deepseek-v3": fireworks("accounts/fireworks/models/deepseek-v3"),
  sonar: perplexity("sonar"),
  "sonar-pro": perplexity("sonar-pro"),
};

export function getProviderOptions(model: string) {
  const providerOptions: any = {};

  if (model === "deepseek-r1") {
    providerOptions.groq = { reasoningFormat: "parsed" };
  }

  if (model === "claude-3-7-sonnet-reasoning") {
    providerOptions.anthropic = {
      thinking: { type: "enabled", budgetTokens: 12000 },
    } satisfies AnthropicProviderOptions;
  }

  return providerOptions;
}
