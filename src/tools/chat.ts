import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { ChatInputSchema } from "../schemas/index.js";
import { OpenAIClient, OpenAIAPIError } from "../client.js";
import { getOpenAIAPIKey } from "../utils/env.js";

export const openaiChatTool: Tool = {
  name: "openai_chat",
  description: "Chat with OpenAI models including GPT-5 and GPT-5-mini. GPT-5 offers best performance with 400k context window, multi-modal support, and configurable verbosity. GPT-5-mini provides faster, cost-effective responses.",
  inputSchema: {
    type: "object",
    properties: {
      model: {
        type: "string",
        enum: ["gpt-5", "gpt-5-mini"],
        description: "Model to use. GPT-5 for best performance, GPT-5-mini for faster/cheaper responses",
      },
      input: {
        oneOf: [
          {
            type: "string",
            description: "Simple text input"
          },
          {
            type: "array",
            items: {
              type: "object",
              properties: {
                role: { 
                  type: "string", 
                  enum: ["developer", "user", "assistant"],
                  description: "Message role"
                },
                content: { 
                  type: "string",
                  description: "Message content"
                },
              },
              required: ["role", "content"],
            },
            description: "Array of messages in the conversation",
            minItems: 1,
          }
        ],
        description: "Input for the model - can be a string or array of messages"
      },
      instructions: {
        type: "string",
        description: "System-level instructions for the model (optional)",
      },
      reasoning: {
        type: "object",
        properties: {
          effort: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Level of reasoning effort to apply"
          }
        },
        required: ["effort"],
        description: "Reasoning configuration (optional)"
      },
      max_tokens: {
        type: "number",
        minimum: 1,
        description: "Maximum number of tokens to generate in response",
      },
    },
    required: ["model", "input"],
  },
};

export async function handleOpenAIChat(args: unknown): Promise<CallToolResult> {
  try {
    // Validate input arguments
    const validatedArgs = ChatInputSchema.parse(args);
    
    // Create OpenAI client
    const apiKey = getOpenAIAPIKey();
    const client = new OpenAIClient(apiKey);
    
    // Make chat request
    const response = await client.chat(validatedArgs);
    
    // Return successful response
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          response: response.content,
          model: response.model,
          usage: response.usage,
        }, null, 2),
      }],
    };
  } catch (error) {
    console.error("[ERROR] Chat tool error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: "Invalid input parameters",
            details: error.errors.map(err => ({
              path: err.path.join("."),
              message: err.message,
            })),
          }, null, 2),
        }],
      };
    }

    // Handle OpenAI API errors
    if (error instanceof OpenAIAPIError) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: "OpenAI API error",
            message: error.message,
            code: error.code,
            ...(error.status && { status: error.status }),
          }, null, 2),
        }],
      };
    }

    // Handle unexpected errors
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: false,
          error: "Unexpected error occurred",
          message: error instanceof Error ? error.message : String(error),
        }, null, 2),
      }],
    };
  }
}