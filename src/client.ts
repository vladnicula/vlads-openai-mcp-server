import OpenAI from "openai";
import type { ChatInput } from "./schemas/index.js";

export class OpenAIAPIError extends Error {
  constructor(public code: string, message: string, public status?: number) {
    super(message);
    this.name = "OpenAIAPIError";
  }
}

export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      timeout: 5 * 60 * 1000, // 5 minutes timeout
    });
  }

  async chat(params: ChatInput) {
    try {
      const { model, input, instructions, reasoning, max_tokens, text } =
        params;

      console.error(
        `[INFO] Making OpenAI responses request for model: ${model}`
      );

      // Use the official responses.create method as shown in docs
      const response = await this.client.responses.create({
        model,
        input,
        ...(instructions && { instructions }),
        ...(reasoning && { reasoning }),
        ...(max_tokens && { max_tokens }),
        ...(text && { text }),
      });

      // Extract content from the response using output_text convenience property
      const content = response.output_text || "";

      console.error(
        `[INFO] OpenAI response received. Tokens: ${
          response.usage?.total_tokens || "unknown"
        }`
      );

      return content;
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

      throw new OpenAIAPIError("unknown_error", "An unexpected error occurred");
    }
  }
}
