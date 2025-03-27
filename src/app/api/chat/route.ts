import { maybeUpdateChatTitle } from "@/actions/chats/create-chat";
import { listModules } from "@/actions/modules/list-modules";
import { db } from "@/db";
import { messagesTable } from "@/db/schema";
import { claudeSonnetModel } from "@/lib/model";
import stripe from "@/lib/stripe";
import { systemPrompt } from "@/lib/system-prompt";
import { requestDocumentationTool } from "@/lib/tools/request-documentation";
import { sendFeedbackTool } from "@/lib/tools/send-feedback";
import { structuredDataRequestTool } from "@/lib/tools/structured-data-request";
import { stackServerApp } from "@/stack";
import { StripeAgentToolkit } from "@stripe/agent-toolkit/ai-sdk";

import {
  streamText,
  type Tool,
  ToolInvocation,
  type UIMessage,
  wrapLanguageModel,
} from "ai";
import { executeTool } from "freestyle-sandboxes/ai";
// import { custom } from "zod";

const stripeAgentToolkit = new StripeAgentToolkit({
  secretKey: process.env.STRIPE_KEY!,
  configuration: {
    actions: {
      paymentLinks: {
        create: true,
      },
    },
  },
});

export async function POST(request: Request) {
  const stackUser = await stackServerApp.getUser({ or: "return-null" });

  let customerId = stackUser?.serverMetadata?.customerId;
  if (customerId == null && stackUser) {
    console.log("Creating new customer ID");
    const newCustomer = await stripe.customers.create({
      email: stackUser.primaryEmail ?? undefined,
      name: stackUser.displayName ?? undefined,
    });
    const newCustomerId = newCustomer.id;
    await stackUser.setServerMetadata({
      ...(stackUser.serverMetadata ?? {}),
      customerId: newCustomerId,
    });
    customerId = newCustomerId;
    console.log("Created new customer ID", customerId);
  } else {
    console.log("Customer ID already exists", customerId);
  }

  const json: {
    messages: UIMessage[];
  } = await request.json();

  if (
    json.messages.filter((message) => message.role == "user").length > 5 &&
    !stackUser
  ) {
    return new Response(
      JSON.stringify({
        error: {
          kind: "AnonymousUserMessageLimit",
        },
      }),
      {
        status: 403,
      }
    );
  }

  const chatId = request.headers.get("chat-id");
  if (!chatId) {
    throw new Error("chat-id header is required");
  }

  const allowFirstMessage =
    request.headers.get("allow-first-message") === "true";

  const modules = await listModules(chatId);

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
  const allToolCalls = previousMessages.flatMap((msg) =>
    (msg.parts ?? [])
      .filter((part) => part.type === "tool-invocation")
      .map(
        (part) =>
          part.toolInvocation as ToolInvocation & {
            result?: { result?: unknown };
          }
      )
  );

  // Only take the last 5:
  const lastFiveToolCalls = allToolCalls.slice(-5);

  // Reduce them to build `executionResults`:
  const executionResults = lastFiveToolCalls.reduce<Record<string, string>>(
    (acc, toolCall) => {
      if (toolCall?.result?.result) {
        acc[`PREV_EXEC_${toolCall.toolCallId}`] = JSON.stringify(
          toolCall.result.result
        );
      }
      return acc;
    },
    {}
  );

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
    console.log("Inserting message into database");
    await db.insert(messagesTable).values({
      ...lastMessage,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      parts: lastMessage.parts,
      content: lastMessage.content.toString(),
      role: lastMessage.role,
      chatId,
    });
    console.log("Inserted message into database");
  }

  console.log("Updating chat title");

  maybeUpdateChatTitle(chatId).catch((error) =>
    console.error("Failed to update chat title:", error)
  );

  console.log("Chat title updated");

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

  const docRequestTool = requestDocumentationTool(
    modules.filter((module) => module.isEnabled)
  );

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

  console.log("Sending response");

  return streamText({
    // model: customerId
    //   ? wrapLanguageModel({
    //       model: claudeSonnetModel,
    //       middleware: [
    //         stripeAgentToolkit.middleware({
    //           billing: {
    //             customer: customerId,
    //             meters: {
    //               input: "INPUT_TOKENS",
    //               output: "OUTPUT_TOKENS",
    //             },
    //           },
    //         }),
    //       ],
    //     })
    //   : claudeSonnetModel,
    model: claudeSonnetModel,
    maxSteps: 10,
    system: systemPrompt({ requestDocsToolEnabled: docRequestTool !== null }),
    tools,
    messages: messages,
  }).toDataStreamResponse();
}
