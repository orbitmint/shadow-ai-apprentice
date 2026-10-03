import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function callGeminiCli(prompt: string, timeoutMs: number = 20000): Promise<string> {
  try {
    // Escape double quotes and backslashes in prompt
    const sanitizedPrompt = prompt.replace(/"/g, '\\"');

    // Run gemini CLI with --skip-trust and -o text
    const command = `gemini --skip-trust -p "${sanitizedPrompt}" -o text`;

    const { stdout, stderr } = await execAsync(command, {
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024 * 5,
      env: {
        ...process.env,
        GEMINI_CLI_TRUST_WORKSPACE: 'true',
      },
    });

    return stdout;
  } catch (error: any) {
    console.warn('Gemini CLI execution notice:', error.message);
    throw error;
  }
}

export function extractJsonFromCliOutput<T = any>(output: string): T | null {
  try {
    // Try finding JSON inside markdown code blocks ```json ... ```
    const codeBlockMatch = output.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      return JSON.parse(codeBlockMatch[1].trim());
    }

    // Otherwise find outer curly braces
    const match = output.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0].trim());
    }
  } catch (e) {
    console.warn('Failed to parse JSON from Gemini CLI output:', e);
  }
  return null;
}
