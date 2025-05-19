import { Brain, CodeXml, FileText, Globe, Image, type LucideProps } from "lucide-react";
import dynamic from "next/dynamic";
import type { ComponentType, ForwardRefExoticComponent, RefAttributes } from "react";

const LazyAnthropic = dynamic(() => import("@/components/icons/anthropic"));
const LazyDeepSeek = dynamic(() => import("@/components/icons/deepseek"));
const LazyGoogle = dynamic(() => import("@/components/icons/google"));
const LazyXAI = dynamic(() => import("@/components/icons/xai"));
const LazyMeta = dynamic(() => import("@/components/icons/meta"));
const LazyOpenAI = dynamic(() => import("@/components/icons/openai"));
const LazyPerplexity = dynamic(() => import("@/components/icons/perplexity"));

export function getModel(modelId: string): Model | undefined {
  return providers
    .flatMap((provider) => provider.models)
    .find((model) => model.id === modelId);
}

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

const coding: Feature = {
  name: "Coding",
  description: "Excels at coding tasks",
  icon: CodeXml,
  color: "text-green-500",
};

const images: Feature = {
  name: "Images",
  description: "Supports images",
  icon: Image,
  color: "text-orange-500",
};

const pdf: Feature = {
  name: "PDFs",
  description: "Supports PDFs",
  icon: FileText,
  color: "text-purple-500",
};

export const providers: Provider[] = [
  {
    name: "OpenAI",
    icon: LazyOpenAI,
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
    icon: LazyAnthropic,
    models: [
      {
        id: "claude-3-7-sonnet",
        name: "Claude 3.7 Sonnet",
        features: [images, pdf],
      },
      // {
      //   id: "claude-3-7-sonnet-reasoning",
      //   name: "Claude 3.7 Sonnet Reasoning",
      //   features: [reasoning],
      // },
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
    icon: LazyGoogle,
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
    icon: LazyXAI,
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
    icon: LazyMeta,
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
