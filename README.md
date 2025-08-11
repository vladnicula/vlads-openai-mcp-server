# OpenAI Multi-Model MCP Server

A Model Context Protocol (MCP) server that enables Claude Code to interact with OpenAI's GPT-5 and GPT-5-mini models.

## Features

- **Multi-model support**: Choose between GPT-5 and GPT-5-mini per request
- **Advanced parameters**: Support for temperature, max_tokens, and GPT-5 verbosity
- **Type-safe**: Built with TypeScript and Zod validation
- **Error handling**: Comprehensive error handling with structured responses
- **MCP compliant**: Full compatibility with MCP specification

## Setup

### Prerequisites

- Node.js 18+ 
- OpenAI API key

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd /path/to/vlads-openai-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration (for local testing only):
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key - only needed for MCP Inspector testing
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

Create a `.env` file with:

```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Claude Code Configuration

Add to your Claude Code MCP configuration (typically in `~/.claude.json`):

```json
{
  "mcpServers": {
    "openai-multi": {
      "command": "node",
      "args": ["/path/to/vlads-openai-mcp-server/build/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-your-openai-api-key-here"
      }
    }
  }
}
```

**Note**: Adding this configuration to the root `mcpServers` object will make it available in all instances of Claude Code.

## Usage

### Available Tools

#### `openai_chat`

Chat with OpenAI models including GPT-5 and GPT-5-mini.

**Parameters:**
- `model` (required): "gpt-5" or "gpt-5-mini"
- `messages` (required): Array of conversation messages
- `temperature` (optional): 0-2, controls randomness (default: 0.7)
- `max_tokens` (optional): Maximum tokens in response
- `verbosity` (optional): "low", "medium", "high" (GPT-5 only)

**Example:**
```typescript
// GPT-5 for complex tasks
await openai_chat({
  model: "gpt-5",
  messages: [
    { role: "system", content: "You are a helpful assistant" },
    { role: "user", content: "Explain quantum computing" }
  ],
  verbosity: "high",
  temperature: 0.7
});

// GPT-5-mini for quick responses  
await openai_chat({
  model: "gpt-5-mini",
  messages: [
    { role: "user", content: "What's the weather like?" }
  ],
  temperature: 0.3
});
```

## Development

### Scripts

- `npm run dev` - Run in development mode with hot reload
- `npm run build` - Build for production
- `npm run start` - Run built version
- `npm run inspector` - Test with MCP Inspector
- `npm run test` - Run tests

### Testing

Use the MCP Inspector to test the server:

```bash
npm run inspector
```

This will start the MCP Inspector where you can:
1. Test tool definitions
2. Try different parameter combinations
3. Verify error handling

### Project Structure

```
src/
├── index.ts          # Main server entry point
├── client.ts         # OpenAI API client wrapper  
├── tools/
│   ├── index.ts      # Tool registry
│   └── chat.ts       # Chat tool implementation
├── schemas/
│   └── index.ts      # Zod validation schemas
└── utils/
    └── env.ts        # Environment validation
```

## Model Comparison

| Feature | GPT-5 | GPT-5-mini |
|---------|--------|------------|
| Performance | Best | Fast |
| Cost | Higher | Lower |
| Context Window | 400k tokens | 400k tokens |
| Verbosity Control | Yes | No |
| Multi-modal | Yes | Yes |

## Error Handling

The server provides structured error responses:

- **Validation errors**: Invalid input parameters
- **API errors**: OpenAI API issues (rate limits, auth, etc.)
- **Network errors**: Connectivity problems
- **Unexpected errors**: Any other failures

All errors include helpful messages and, where applicable, error codes.

## Troubleshooting

### Common Issues

1. **Missing API Key**
   ```
   Missing required environment variable: OPENAI_API_KEY
   ```
   Solution: Set your OpenAI API key in the environment

2. **Model Not Found**
   ```
   OpenAI API Error: The model 'gpt-5' does not exist
   ```
   Solution: Ensure you have access to GPT-5 models in your OpenAI account

3. **Rate Limits**
   ```
   OpenAI API Error: Rate limit exceeded
   ```
   Solution: Wait and retry, or upgrade your OpenAI plan

### Debug Mode

The server logs detailed information to stderr:
- Request details
- Response metadata  
- Error information

## License

MIT

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass