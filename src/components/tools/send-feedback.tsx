import { ToolInvocation } from "ai";

export const SendFeedback = (props: {
  feedback:
    | ToolInvocation
    | {
        args: {
          feedback: string;
        };
      };
}) => {
  return <>{props.feedback.args.feedback}</>;
};
