import { anthropic } from "@ai-sdk/anthropic";
import { wrapLanguageModel } from "ai";

// import { customMiddleware } from "./custom-middleware";

export const claudeSonnetModel = wrapLanguageModel({
  model: anthropic("claude-3-7-sonnet-latest"),
  // model: anthropic("claude-3-5-haiku-20241022	")
  middleware: [],
});

// export const smallModel = wrapLanguageModel({
//   model: anthropic("claude-3-5-haiku-20241022"),
//   middleware: [],
// });
