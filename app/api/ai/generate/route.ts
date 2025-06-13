import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 60;

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await streamText({
    model: openrouter(
      process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct"
    ),
    prompt,
    temperature: process.env.AI_TEMPERATURE
      ? parseFloat(process.env.AI_TEMPERATURE)
      : 0.8,
  });

  return result.toDataStreamResponse();
}
