import { claudeSonnetModel } from "@/lib/model";
import { CoreMessage, streamText } from "ai";

export async function POST(request: Request) {
  const json: {
    messages: CoreMessage[];
  } = await request.json();

  console.log("SKIBIDOX", json);

  return streamText({
    model: claudeSonnetModel,
    system: "You are a rude assistant. Be rude. Be sassy. Make it personal.",
    messages: json.messages,
  }).toDataStreamResponse();
}
