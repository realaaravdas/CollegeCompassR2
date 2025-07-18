'use server';

/**
 * @fileOverview An AI agent that tests if a Gemini API key is valid.
 *
 * - testApiKey - A function that performs a simple test call.
 */

import { ai as globalAi } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';

const TestApiKeyOptionsSchema = z.object({
  apiKey: z.string().optional(),
});

export async function testApiKey(
  options?: z.infer<typeof TestApiKeyOptionsSchema>
): Promise<{ success: boolean; message: string }> {
  try {
    const output = await testApiKeyFlow({ apiKey: options?.apiKey });
    if (output?.response.includes('Test successful')) {
      return { success: true, message: 'API Key is valid!' };
    }
    return { success: false, message: 'API Key is likely invalid.' };
  } catch (e: any) {
    console.error(e);
    if (e.message.includes('API key not valid')) {
      return { success: false, message: 'Authentication failed: The API key is not valid.' };
    }
    if (e.message.includes('permission_denied')) {
        return { success: false, message: 'Permission denied. Please check your API key permissions.' };
    }
    if (e.message.includes('Please pass in the API key')) {
        return { success: false, message: 'API key is missing. Please provide a key.' };
    }
    return { success: false, message: 'An unknown error occurred during the test.' };
  }
}

const testApiKeyFlow = globalAi.defineFlow(
  {
    name: 'testApiKeyFlow',
    inputSchema: TestApiKeyOptionsSchema,
    outputSchema: z.object({ response: z.string() }),
  },
  async ({ apiKey }) => {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        'Please pass in the API key or set the GEMINI_API_KEY environment variable.'
      );
    }

    const ai = genkit({
      plugins: [googleAI({ apiKey: key })],
    });

    const prompt = ai.definePrompt({
      name: 'testApiKeyPrompt_local',
      model: googleAI.model('gemini-2.0-flash-preview'),
      output: { schema: z.object({ response: z.string() }) },
      prompt: `Respond with only the text "Test successful."`,
    });

    const { output } = await prompt({});
    return output!;
  }
);
