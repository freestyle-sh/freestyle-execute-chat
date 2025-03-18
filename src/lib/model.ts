import { anthropic } from "@ai-sdk/anthropic";
import { wrapLanguageModel } from "ai";

// import { customMiddleware } from "./custom-middleware";

export const claudeSonnetModel = wrapLanguageModel({
  model: anthropic("claude-3-sonnet-20240229"),
  middleware: [],
});
