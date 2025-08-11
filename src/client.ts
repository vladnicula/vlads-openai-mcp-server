import OpenAI from "openai";
import type { ChatInput, ChatResponse } from "./schemas/index.js";

export class OpenAIAPIError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "OpenAIAPIError";
  }
}

export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      timeout: 30000, // 30 seconds timeout
    });
  }

  async chat(params: ChatInput): Promise<ChatResponse> {
    try {
      const { model, input, instructions, reasoning, max_tokens } = params;

      // Build request parameters for Responses API
      const requestParams: any = {
        model,
        input,
        ...(instructions && { instructions }),
        ...(reasoning && { reasoning }),
        ...(max_tokens && { max_tokens }),
      };

      console.error(`[INFO] Making OpenAI responses request for model: ${model}`);

      // Use the responses endpoint instead of chat completions
      const response = await this.client.post('/v1/responses', {
        body: requestParams,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      // Extract content from the new response format
      const content = responseData.output_text || 
                     (responseData.output && responseData.output.length > 0 ? 
                      responseData.output[0]?.text || "" : "");

      const chatResponse = {
        content,
        model: responseData.model || model,
        usage: responseData.usage ? {
          prompt_tokens: responseData.usage.prompt_tokens,
          completion_tokens: responseData.usage.completion_tokens,
          total_tokens: responseData.usage.total_tokens,
        } : undefined,
        output: responseData.output,
      };

      console.error(`[INFO] OpenAI response received. Tokens: ${responseData.usage?.total_tokens || 'unknown'}`);

      return chatResponse;
    } catch (error) {
      console.error("[ERROR] OpenAI API error:", error);

      if (error instanceof OpenAI.APIError) {
        throw new OpenAIAPIError(
          error.code || "api_error",
          `OpenAI API Error: ${error.message}`,
          error.status
        );
      }

      if (error instanceof Error) {
        throw new OpenAIAPIError(
          "unknown_error",
          `Unexpected error: ${error.message}`
        );
      }

      throw new OpenAIAPIError(
        "unknown_error",
        "An unexpected error occurred"
      );
    }
  }
}