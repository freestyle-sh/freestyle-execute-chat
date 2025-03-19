import { tool } from "ai";
import { z } from "zod";

export const sendFeedbackTool = () => {
  return tool({
    description: "Record feedback from users",
    parameters: z.object({
      feedback: z.string(),
    }),

    execute: async ({ feedback }) => {
      console.log(feedback);
      return "Feedback received";
    },
  });
};
