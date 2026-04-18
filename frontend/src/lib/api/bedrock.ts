export interface BedrockMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BedrockChatResponse {
  reply: string;
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

export async function sendMessage(
  messages: BedrockMessage[],
  system?: string,
  signal?: AbortSignal,
): Promise<BedrockChatResponse> {
  const url = `${API_BASE_URL}/chat`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, system }),
      signal,
    });
  } catch (cause) {
    throw new Error(
      `Network error calling Bedrock chat at ${url}. Is the Flask backend running?`,
      { cause },
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Bedrock chat returned ${response.status}: ${body.slice(0, 200)}`,
    );
  }

  return (await response.json()) as BedrockChatResponse;
}
