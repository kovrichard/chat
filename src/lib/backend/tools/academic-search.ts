import { openai } from "@ai-sdk/openai";
import { type Message, generateText, tool } from "ai";
import { z } from "zod";
import { exa, exaConfigured } from ".";

const openaiConfigured = process.env.OPENAI_API_KEY !== undefined;
export const academicSearchConfigured = exaConfigured && openaiConfigured;

async function academicSearch(query: string) {
  if (!exa) {
    return [];
  }

  const result = await exa.searchAndContents(query, {
    type: "auto",
    category: "research paper",
    numResults: 5,
    summary: true,
  });
  return result.results.map((result) => ({
    title: result.title,
    url: result.url,
    summary: result.summary,
  }));
}

const academicSearchTool = tool({
  description: "Search for scientific papers",
  parameters: z.object({
    query: z.string().describe("The query to search for scientific papers"),
  }),
  execute: async ({ query }) => {
    const result = await academicSearch(query);
    return result;
  },
});

export async function retrieveSources(messages: Message[]) {
  const response = await generateText({
    model: openai("gpt-4o-mini"),
    messages,
    maxSteps: 1,
    tools: {
      academicSearch: academicSearchTool,
    },
    toolChoice: {
      type: "tool",
      toolName: "academicSearch",
    },
  });
  return response.toolResults[0].result;
}

export function buildAcademicPrompt(
  sources: { title: string | null; url: string; summary: string }[]
) {
  if (!exa) {
    return "There are no academic sources available because the academic search tool is not configured.";
  }

  let academicPrompt =
    "\n\nThe current conversation is focused on academic research. Here are some sources that are relevant to the conversation:\n\n";
  sources.forEach((source) => {
    academicPrompt += `Title: ${source.title || "No title"}\nURL: ${source.url}\nSummary: ${source.summary}\n\n`;
  });
  academicPrompt +=
    "Use these sources to answer the user's question. Don't forget to cite the sources in your response using the provided URLs.";

  return academicPrompt;
}
