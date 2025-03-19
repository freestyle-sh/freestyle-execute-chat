"use client";

import type { ToolInvocation } from "ai";
import { MessageSquare } from "lucide-react";
import { ToolOutput, ToolOutputBadge } from "@/components/ui/tool-output";

export type SendFeedbackProps = {
  feedback:
    | ToolInvocation
    | {
        args: {
          feedback: string;
        };
      };
  className?: string;
};

export const SendFeedback = ({ feedback, className }: SendFeedbackProps) => {
  // Extract feedback from the props, handling both custom format and ToolInvocation
  let feedbackText: string | undefined;

  if ("args" in feedback && feedback.args.feedback) {
    feedbackText = feedback.args.feedback;
  } else if (
    "input" in feedback &&
    typeof feedback.input === "object" &&
    feedback.input
  ) {
    // Handle tool invocation format
    const input = feedback.input as Record<string, unknown>;
    if ("feedback" in input && typeof input.feedback === "string") {
      feedbackText = input.feedback;
    }
  }

  return (
    <ToolOutput
      title="Feedback"
      icon={MessageSquare}
      badge={<ToolOutputBadge variant="info">User Feedback</ToolOutputBadge>}
      content={
        <div className="whitespace-pre-wrap text-sm">{feedbackText}</div>
      }
      className={className}
    />
  );
};
