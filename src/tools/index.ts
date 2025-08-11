import { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { openaiChatTool, handleOpenAIChat } from "./chat.js";

export const tools: Tool[] = [
  openaiChatTool,
];

export const toolHandlers = new Map<string, (args: unknown) => Promise<CallToolResult>>([
  ["openai_chat", handleOpenAIChat],
]);

export { openaiChatTool, handleOpenAIChat };