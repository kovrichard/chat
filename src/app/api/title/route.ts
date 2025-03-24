import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system:
      "Your job is to generate a title for a conversation based on the messages. The title should never be longer than 3 words. Only return the title, no other text.",
    messages,
  });

  return new Response(text);
}
