import { groq } from "@ai-sdk/groq";
import { openai } from "@ai-sdk/openai";
import { smoothStream, streamText } from "ai";

export const maxDuration = 30;

const allowedModels = {
  "4o-mini": openai("gpt-4o-mini"),
  "o3-mini": openai("o3-mini"),
  "llama-3.3": groq("llama-3.3-70b-versatile"),
};

export async function POST(req: Request) {
  const { messages, model: modelId } = await req.json();
  const model = allowedModels[modelId as keyof typeof allowedModels];

  if (!model) {
    return new Response("Invalid model", { status: 400 });
  }

  const result = streamText({
    model,
    messages,
    maxSteps: 5,
    experimental_transform: smoothStream({
      delayInMs: 15,
    }),
  });

  return result.toDataStreamResponse();
}
