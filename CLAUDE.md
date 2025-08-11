# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an OpenAI Multi-Model MCP (Model Context Protocol) server that enables Claude Code to interact with OpenAI's GPT-5 and GPT-5-mini models. It's built as a TypeScript Node.js application using the MCP SDK.

## Common Commands

### Development
- `npm run dev` - Run in development mode with hot reload using tsx
- `npm run build` - Build TypeScript to JavaScript in `build/` directory and make executable
- `npm start` - Run the built version from `build/index.js`
- When making changes, `npm run build` to check for errors and fix them

### Testing
- `npm run test` - Run tests using Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run inspector` - Build and test with MCP Inspector for debugging tools

## Architecture

### Core Components

**MCP Server (`src/index.ts`)**
- Main entry point that creates and configures the MCP server
- Handles tool registration and request routing
- Uses stdio transport for communication with Claude Code
- Comprehensive error handling with structured JSON responses

**OpenAI Client (`src/client.ts`)**
- Uses OpenAI Responses API (`/v1/responses`) instead of Chat Completions
- Supports both GPT-5 and GPT-5-mini models
- Custom `OpenAIAPIError` class for structured error responses
- Parses response from `output` array and `output_text` property
- 30-second timeout configuration

**Tool System (`src/tools/`)**
- Modular tool architecture with registry pattern
- `chat.ts` - Main OpenAI chat tool implementation
- `index.ts` - Tool registry and handler mapping

**Schema Validation (`src/schemas/index.ts`)**
- Zod-based validation for all inputs and outputs
- Type-safe input handling (string only)
- Message roles: `developer`, `user`, `assistant`
- Reasoning effort validation: `minimal`, `low`, `medium`, `high`
- Input parameter accepts only strings

**Environment Utilities (`src/utils/env.ts`)**
- Environment variable validation on startup
- Secure API key handling

### Key Patterns

**Error Handling Strategy**
- Three-tier error handling: validation, API, and unexpected errors
- All errors return structured JSON with success/failure status
- Detailed error messages with specific error codes when available

**Type Safety**
- Full TypeScript coverage with strict configuration
- Zod schemas provide runtime validation matching TypeScript types
- Input parameter accepts only string type
- Reasoning effort parameter validation for GPT-5 optimization

**Tool Implementation Pattern**
Tools follow a consistent structure:
1. Tool definition with JSON schema for Responses API
2. Handler function with Zod validation 
3. Client interaction with Responses API endpoint
4. Structured JSON response from output array

## Environment Configuration

Required environment variable:
- `OPENAI_API_KEY` - OpenAI API key (validated on startup)

## Tool Details

**openai_chat Tool (Uses Responses API)**
- Supports `gpt-5` and `gpt-5-mini` models
- Parameters: model, input (string only), instructions, reasoning.effort, text.verbosity, max_tokens
- Uses `/v1/responses` endpoint instead of chat completions
- Returns response from `output_text` convenience property
- Reasoning effort options: `minimal`, `low`, `medium`, `high`
- Verbosity options: `low`, `medium`, `high` (nested under `text` parameter)

## Development Notes

- Uses ES modules (`"type": "module"` in package.json)
- TypeScript compiled to `build/` directory with declarations
- Executable permissions set on build output via shx
- MCP Inspector available for testing tool definitions and parameters
- Comprehensive logging to stderr for debugging MCP communication
- **CRITICAL**: Uses OpenAI Responses API, not Chat Completions API
- Input accepts only string type (no message arrays)
- No temperature parameter support in Responses API
- Verbosity control available via `text.verbosity` parameter

## TypeScript Best Practices

- Don't cast to `any` when writing TypeScript code