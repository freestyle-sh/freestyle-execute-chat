import { ToolInvocation } from "ai";

export const CodeExecution = (props: {
  execution:
    | ToolInvocation
    | {
        args: {
          script: string;
        };
        result: {
          _type: "success" | "error";
          result: unknown;
          logs: {
            message: string;
            // type: "Log" | "Error";
          }[];
        };
      };
}) => {
  return <>WE BRING DA{JSON.stringify(props.execution)}</>;
};
