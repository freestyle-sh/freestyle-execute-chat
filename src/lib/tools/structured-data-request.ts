import { tool } from "ai";
import { z } from "zod";

export function structuredDataRequestTool() {
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
  });
}
