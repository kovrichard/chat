// import { groq } from "@ai-sdk/groq";
import { openai } from "@ai-sdk/openai";
import { smoothStream, streamText } from "ai";

export const maxDuration = 30;

const allowedModels = ["gpt-4o-mini", "o3-mini"];

export async function POST(req: Request) {
  const { messages, model } = await req.json();

  if (!allowedModels.includes(model)) {
    return new Response("Invalid model", { status: 400 });
  }

  const result = streamText({
    model: openai(model),
    messages,
    maxSteps: 5,
    experimental_transform: smoothStream({
      delayInMs: 15,
    }),
  });

  return result.toDataStreamResponse();
}
