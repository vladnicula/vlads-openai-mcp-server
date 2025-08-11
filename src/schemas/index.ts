import { z } from "zod";

export const ModelSchema = z.enum(["gpt-5", "gpt-5-mini"]);
export type Model = z.infer<typeof ModelSchema>;

export const MessageSchema = z.object({
  role: z.enum(["developer", "user", "assistant"]),
  content: z.string().min(1, "Message content cannot be empty"),
});

export type Message = z.infer<typeof MessageSchema>;

export const InputSchema = z.string().min(1, "Input cannot be empty");

export type Input = z.infer<typeof InputSchema>;

export const ReasoningSchema = z.object({
  effort: z.enum(["minimal", "low", "medium", "high"]),
});

export type Reasoning = z.infer<typeof ReasoningSchema>;

export const TextSchema = z.object({
  verbosity: z.enum(["low", "medium", "high"]),
});

export type Text = z.infer<typeof TextSchema>;

export const ChatInputSchema = z.object({
  model: ModelSchema,
  input: InputSchema,
  instructions: z.string().optional(),
  reasoning: ReasoningSchema.optional(),
  text: TextSchema.optional(),
  max_tokens: z.number().positive().optional(),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;
