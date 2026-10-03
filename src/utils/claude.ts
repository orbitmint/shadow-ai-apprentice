import Anthropic from '@anthropic-ai/sdk';

export async function callClaudeText(prompt: string, customApiKey?: string): Promise<string> {
  const apiKey = customApiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022', // Fast, low-latency for hackathon real-time inquiries
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const firstBlock = response.content[0];
  if (firstBlock && firstBlock.type === 'text') {
    return firstBlock.text;
  }
  return '';
}

export async function callClaudeVision(
  prompt: string,
  imageBase64: string,
  customApiKey?: string
): Promise<string> {
  const apiKey = customApiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const anthropic = new Anthropic({ apiKey });

  // Clean base64 header
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: cleanBase64,
            },
          },
        ],
      },
    ],
  });

  const firstBlock = response.content[0];
  if (firstBlock && firstBlock.type === 'text') {
    return firstBlock.text;
  }
  return '';
}
