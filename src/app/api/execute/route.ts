import { Message } from "ai";
import { executeTool } from "freestyle-sandboxes/ai";
import { NextResponse } from "next/server";

// Our custom result type that works with our UI
type ExecutionResult = {
  _type: "success" | "error";
  result?: unknown;
  error?: string;
  logs: { message: string }[];
};

export async function POST(request: Request) {
  try {
    const json: {
      script: string;
    } = await request.json();

    if (!json.script) {
      return NextResponse.json(
        { error: "Missing script parameter" },
        { status: 400 }
      );
    }

    // Create a standalone executor function that wraps the tool
    const executeCode = async (script: string): Promise<ExecutionResult> => {
      try {
        // Create the tool
        const execTool = executeTool({
          apiKey: process.env.FREESTYLE_API_KEY!,
        });

        // Since we can't directly call the tool, we need to access its internal execute method
        if (typeof execTool.execute === 'function') {
          // We need to construct mock arguments expected by the execute method
          const mockArgs = { script };
          const mockToolContext = {
            toolCallId: 'mock-call-id',
            messages: [{
              role: 'user',
              content: `Execute this code: ${script}`,
              id: 'mock-user-message-id'
            }] as Message[]
          };

          // @ts-ignore - we're using internal API that's not fully typed
          const rawResult = await execTool.execute(mockArgs, mockToolContext);
          
          // Convert result to our ExecutionResult format
          if ('error' in rawResult) {
            return {
              _type: 'error',
              error: typeof rawResult.error === 'string' ? rawResult.error : JSON.stringify(rawResult.error),
              logs: [{ message: String(rawResult.error) }]
            };
          } else {
            // For successful results, extract logs if available
            const logs = [];
            if ('logs' in rawResult && Array.isArray(rawResult.logs)) {
              logs.push(...rawResult.logs);
            }
            
            return {
              _type: 'success',
              result: 'result' in rawResult ? rawResult.result : rawResult,
              logs
            };
          }
        } else {
          throw new Error('Tool execution method not available');
        }
      } catch (error) {
        console.error('Error in executeCode:', error);
        return {
          _type: 'error',
          error: error instanceof Error ? error.message : String(error),
          logs: [{ message: `Error: ${error instanceof Error ? error.message : String(error)}` }]
        };
      }
    };

    // Execute the code
    const result = await executeCode(json.script);

    // Format the result and return it
    return NextResponse.json({
      result,
      success: result._type === "success"
    });
  } catch (error) {
    console.error("Error executing code:", error);
    return NextResponse.json(
      { 
        error: "Failed to execute code",
        details: error instanceof Error ? error.message : String(error),
        result: {
          _type: "error",
          error: error instanceof Error ? error.message : String(error),
          logs: [{ message: `Error: ${error instanceof Error ? error.message : String(error)}` }]
        }
      },
      { status: 500 }
    );
  }
}