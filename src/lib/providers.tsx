import { Brain, Globe } from "lucide-react";
import dynamic from "next/dynamic";

const LazyAnthropic = dynamic(() => import("@/components/icons/anthropic"));
const LazyDeepSeek = dynamic(() => import("@/components/icons/deepseek"));
const LazyGoogle = dynamic(() => import("@/components/icons/google"));
const LazyXAI = dynamic(() => import("@/components/icons/xai"));
const LazyMeta = dynamic(() => import("@/components/icons/meta"));
const LazyOpenAI = dynamic(() => import("@/components/icons/openai"));
const LazyPerplexity = dynamic(() => import("@/components/icons/perplexity"));

const reasoning = {
  name: "Reasoning",
  description: "Reasoning model",
  icon: Brain,
  color: "text-yellow-500",
};

const search = {
  name: "Search",
  description: "Searches the web for information",
  icon: Globe,
  color: "text-blue-500",
};

export const providers = [
  {
    name: "OpenAI",
    icon: LazyOpenAI,
    models: [
      {
        id: "4o-mini",
        name: "GPT-4o mini",
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
    icon: LazyAnthropic,
    models: [
      {
        id: "claude-3-7-sonnet",
        name: "Claude 3.7 Sonnet",
      },
      {
        id: "claude-3-7-sonnet-reasoning",
        name: "Claude 3.7 Sonnet Reasoning",
        features: [reasoning],
      },
      {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet",
      },
      {
        id: "claude-3-5-haiku",
        name: "Claude 3.5 Haiku",
      },
    ],
  },
  {
    name: "Google",
    icon: LazyGoogle,
    models: [
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        features: [search],
      },
      {
        id: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
      },
    ],
  },
  {
    name: "xAI",
    icon: LazyXAI,
    models: [
      {
        id: "grok-2-1212",
        name: "Grok 2",
      },
    ],
  },
  {
    name: "Meta",
    icon: LazyMeta,
    models: [
      {
        id: "llama-3.1-405b",
        name: "Llama 3.1 405B",
      },
      {
        id: "llama-4-scout",
        name: "Llama 4 Scout",
      },
    ],
  },
  {
    name: "DeepSeek",
    icon: LazyDeepSeek,
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
    icon: LazyPerplexity,
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
