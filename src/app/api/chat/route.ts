import { maybeUpdateChatTitle } from "@/actions/chats/create-chat";
import { listModules } from "@/actions/modules/list-modules";
import { db } from "@/db";
import { messagesTable } from "@/db/schema";
import { claudeSonnetModel } from "@/lib/model";
import { systemPrompt } from "@/lib/system-prompt";
import { requestDocumentationTool } from "@/lib/tools/request-documentation";
import { sendFeedbackTool } from "@/lib/tools/send-feedback";
import { structuredDataRequestTool } from "@/lib/tools/structured-data-request";
import { streamText, type Tool, ToolInvocation, type UIMessage } from "ai";
import { executeTool } from "freestyle-sandboxes/ai";

export async function POST(request: Request) {
  const json: {
    messages: UIMessage[];
  } = await request.json();

  console.log(json);
  const chatId = request.headers.get("chat-id");
  if (!chatId) {
    throw new Error("chat-id header is required");
  }

  console.log("chatId", chatId);

  const allowFirstMessage =
    request.headers.get("allow-first-message") === "true";

  const modules = await listModules(chatId);

  console.log("modules", modules);

  const nodeModules = Object.fromEntries(
    modules
      .filter((module) => module.isEnabled)
      .map((module) => module.nodeModules as Record<string, string>)
      .flatMap(Object.entries)
  );

  // Get all previous messages with tool outputs from code execution
  const previousMessages = json.messages.filter(
    (msg) => msg.role === "assistant"
  );

  // Extract execution results from previous messages and add to environment variables
  console.log("previousMessages", previousMessages);
  const executionResults = previousMessages.reduce<Record<string, string>>(
    (acc, msg) => {
      for (const part of msg.parts ?? []) {
        if (part.type == "tool-invocation") {
          const toolCall = part.toolInvocation as ToolInvocation & {
            result?: {
              result?: unknown;
            };
          };
          console.log("toolCall", toolCall);
          if (toolCall?.result?.result) {
            acc[`PREV_EXEC_${toolCall.toolCallId}`] = JSON.stringify(
              toolCall?.result?.result
            );
          }
        }
      }
      return acc;
    },
    {}
  );

  console.log("Execution results", executionResults);

  // Combine module env vars with execution results
  const envVars = {
    ...Object.fromEntries(
      modules
        .filter((module) => module.isConfigured)
        .flatMap((module) => {
          return module.configurations.map((configuration) => {
            return [configuration.name, configuration.value];
          });
        })
    ),
    ...executionResults,
  };

  if (!chatId) {
    throw new Error("chat-id header is required");
  }

  const lastMessage = json.messages[json.messages.length - 1];

  if (
    json.messages.length >= 2 ||
    (allowFirstMessage && lastMessage.role === "user")
  ) {
    await db.insert(messagesTable).values({
      ...lastMessage,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      parts: lastMessage.parts,
      content: lastMessage.content.toString(),
      role: lastMessage.role,
      chatId,
    });
  }

  maybeUpdateChatTitle(chatId).catch((error) =>
    console.error("Failed to update chat title:", error)
  );

  console.log("Chat title maybe updated");

  const tools: Record<string, Tool> = {
    codeExecutor: executeTool({
      apiKey: process.env.FREESTYLE_API_KEY!,
      nodeModules,
      envVars,
    }),
    sendFeedback: sendFeedbackTool(),
    // Human-in-the-loop tool
    structuredDataRequest: structuredDataRequestTool(),
  };

  const docRequestTool = requestDocumentationTool(modules);

  if (docRequestTool) {
    tools.requestDocumentation = docRequestTool;
  }

  const messages = json.messages.map((msg) => {
    if (msg.role === "assistant") {
      for (const part of msg.parts ?? []) {
        if (part.type === "tool-invocation") {
          if (
            part.toolInvocation.toolName === "codeExecutor" &&
            part.toolInvocation.state === "result"
          ) {
            if (
              part.toolInvocation.result?.result &&
              part.toolInvocation.result?.result.length > 5003
            ) {
              part.toolInvocation.result.result =
                part.toolInvocation.result.result.slice(0, 5000) + "...";
            }
          }
        }
      }
    }
    return msg;
  });

  return streamText({
    model: claudeSonnetModel,
    maxSteps: 10,
    system: systemPrompt({ requestDocsToolEnabled: docRequestTool !== null }),
    tools,
    messages: json.messages,
  }).toDataStreamResponse();
}
