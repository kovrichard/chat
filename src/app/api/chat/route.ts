import {
  OnFinishResult,
  saveResultAsAssistantMessage,
  saveUserMessage,
} from "@/lib/dao/messages";
import { getUserFromSession } from "@/lib/dao/users";
import { AnthropicProviderOptions, anthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { smoothStream, streamText } from "ai";

export const maxDuration = 30;

const azure = createAzure({
  apiVersion: "2024-12-01-preview",
});

const allowedModels = {
  "4o-mini": azure("gpt-4o-mini"),
  "o3-mini": azure("o3-mini"),
  "claude-3-7-sonnet": anthropic("claude-3-7-sonnet-20250219"),
  "claude-3-7-sonnet-reasoning": anthropic("claude-3-7-sonnet-20250219"),
  "claude-3-5-sonnet": anthropic("claude-3-5-sonnet-20240620"),
  "claude-3-5-haiku": anthropic("claude-3-5-haiku-20241022"),
  "gemini-2.0-flash": google("gemini-2.0-flash", { useSearchGrounding: true }),
  "gemini-2.0-flash-lite": google("gemini-2.0-flash-lite"),
  "llama-3.3": groq("llama-3.3-70b-versatile"),
  "deepseek-r1": groq("deepseek-r1-distill-llama-70b"),
};

function getProviderOptions(model: string) {
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

export async function POST(req: Request) {
  const start = Date.now();
  await getUserFromSession();
  const userFetched = Date.now();
  console.log(`User fetched in: ${userFetched - start}ms`);

  const { id, messages, model: modelId, firstMessage } = await req.json();
  const model = allowedModels[modelId as keyof typeof allowedModels];

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  if (!firstMessage) {
    const lastMessage = messages[messages.length - 1];
    const startSavingUserMessage = Date.now();
    await saveUserMessage(lastMessage.content, id);
    const endSavingUserMessage = Date.now();
    console.log(
      `User message saved in: ${endSavingUserMessage - startSavingUserMessage}ms`
    );
  }

  const result = streamText({
    model,
    messages,
    maxSteps: 5,
    providerOptions: getProviderOptions(modelId),
    experimental_transform: smoothStream({
      delayInMs: 10,
    }),
    onFinish: async (result: OnFinishResult) => {
      await saveResultAsAssistantMessage(result, id);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const end = Date.now();
  console.log(`Response time: ${end - start}ms`);

  return result.toDataStreamResponse({ sendReasoning: true });
}
