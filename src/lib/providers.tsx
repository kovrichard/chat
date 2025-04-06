import { Brain, Globe, LucideProps } from "lucide-react";
import dynamic from "next/dynamic";
import { ComponentType, ForwardRefExoticComponent, RefAttributes } from "react";

const LazyAnthropic = dynamic(() => import("@/components/icons/anthropic"));
const LazyDeepSeek = dynamic(() => import("@/components/icons/deepseek"));
const LazyGoogle = dynamic(() => import("@/components/icons/google"));
const LazyXAI = dynamic(() => import("@/components/icons/xai"));
const LazyMeta = dynamic(() => import("@/components/icons/meta"));
const LazyOpenAI = dynamic(() => import("@/components/icons/openai"));
const LazyPerplexity = dynamic(() => import("@/components/icons/perplexity"));

export type Feature = {
  name: string;
  description: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  color: string;
};

export type Model = {
  id: string;
  name: string;
  features?: Feature[];
  free?: boolean;
};

export type Provider = {
  name: string;
  icon: ComponentType<{ size?: number | undefined }>;
  models: Model[];
};

const reasoning: Feature = {
  name: "Reasoning",
  description: "Reasoning model",
  icon: Brain,
  color: "text-yellow-500",
};

const search: Feature = {
  name: "Search",
  description: "Searches the web for information",
  icon: Globe,
  color: "text-blue-500",
};

export const providers: Provider[] = [
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
