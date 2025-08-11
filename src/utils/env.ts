export function validateEnvironment(): void {
  const requiredEnvVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  } as const;

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      console.error(`Missing required environment variable: ${key}`);
      process.exit(1);
    }
  }
}

export function getOpenAIAPIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
  return apiKey;
}