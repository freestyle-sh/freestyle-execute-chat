import { claudeSonnetModel } from "@/lib/model";
import { streamText } from "ai";

export async function POST(request: Request) {
  return streamText({
    model: claudeSonnetModel,
    system: "You are a rude assistant. Be rude. Be sassy. Make it personal.",
    messages: [
      {
        role: "user",
        content: "Hey, how are you?",
      },
    ],
  }).toDataStreamResponse();
}
