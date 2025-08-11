import { z } from "zod";

export const ModelSchema = z.enum(["gpt-5", "gpt-5-mini"]);
export type Model = z.infer<typeof ModelSchema>;

export const MessageSchema = z.object({
  role: z.enum(["developer", "user", "assistant"]),
  content: z.string().min(1, "Message content cannot be empty"),
});

export type Message = z.infer<typeof MessageSchema>;

export const InputSchema = z.union([
  z.string().min(1, "Input cannot be empty"),
  z.array(MessageSchema).min(1, "At least one message is required")
]);

export type Input = z.infer<typeof InputSchema>;

export const ReasoningSchema = z.object({
  effort: z.enum(["low", "medium", "high"])
});

export type Reasoning = z.infer<typeof ReasoningSchema>;

export const ChatInputSchema = z.object({
  model: ModelSchema,
  input: InputSchema,
  instructions: z.string().optional(),
  reasoning: ReasoningSchema.optional(),
  max_tokens: z.number().positive().optional(),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatResponseSchema = z.object({
  content: z.string(),
  model: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }).optional(),
  output: z.array(z.any()).optional(), // Raw output array from Responses API
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;