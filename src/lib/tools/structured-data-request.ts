import { tool } from "ai";
import { z } from "zod";
import { userFormResponsesTable } from "@/db/schema";
import { db } from "@/db";

export function structuredDataRequestTool({ chatId }: { chatId: string }) {
  return tool({
    description:
      "Request structured data from the user with a customizable form",
    parameters: z.object({
      title: z.string().describe("A brief title for the data request form"),
      description: z
        .string()
        .describe(
          "Detailed explanation of what data is being requested and why",
        ),
      fields: z
        .array(
          z.object({
            id: z.string().describe("Unique identifier for this field"),
            label: z.string().describe("Human-readable label for the field"),
            type: z
              .enum([
                "text",
                "number",
                "email",
                "select",
                "textarea",
                "date",
                "checkbox",
              ])
              .describe("Type of input field"),
            placeholder: z
              .string()
              .optional()
              .describe("Optional placeholder text"),
            options: z
              .array(z.string())
              .optional()
              .describe("For select fields, the available options"),
            required: z
              .boolean()
              .optional()
              .default(false)
              .describe("Whether this field is required"),
            validation: z
              .string()
              .optional()
              .describe("Optional validation regex pattern for the field"),
          }),
        )
        .describe("The fields to include in the form"),
    }),

    execute: async ({ title }, { toolCallId }) => {
      await db.insert(userFormResponsesTable).values({
        id: crypto.randomUUID(),
        chatId,
        toolCallId,
        formTitle: title,
        state: "idle", // Initial state
        // formData: null, // Will be filled when user submits
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return `Waiting for user to submit the requested information: "${title}". The assistant should pause generation until the user responds.`;
    },
  });
}
