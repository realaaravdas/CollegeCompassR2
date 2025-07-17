'use server';
/**
 * @fileOverview An AI agent that lists the majors offered at a given college.
 *
 * - listMajors - A function that lists the majors offered at a given college.
 * - ListMajorsInput - The input type for the listMajors function.
 * - ListMajorsOutput - The return type for the listMajors function.
 */

import { ai as globalAi } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';

const ListMajorsInputSchema = z.object({
  collegeName: z
    .string()
    .describe('The name of the college to list majors for.'),
});
export type ListMajorsInput = z.infer<typeof ListMajorsInputSchema>;

const ListMajorsOptionsSchema = z.object({
  apiKey: z.string().optional(),
});

const ListMajorsOutputSchema = z.object({
  majors: z
    .array(z.string())
    .describe('A list of majors offered at the college.'),
});
export type ListMajorsOutput = z.infer<typeof ListMajorsOutputSchema>;

export async function listMajors(
  input: ListMajorsInput,
  options?: z.infer<typeof ListMajorsOptionsSchema>
): Promise<ListMajorsOutput> {
  return listMajorsFlow({ input, apiKey: options?.apiKey });
}

const listMajorsFlow = globalAi.defineFlow(
  {
    name: 'listMajorsFlow',
    inputSchema: z.object({
      input: ListMajorsInputSchema,
      apiKey: z.string().optional(),
    }),
    outputSchema: ListMajorsOutputSchema,
  },
  async ({ input, apiKey }) => {
    const key = apiKey || process.env.GEMINI_API_KEY;
    let ai = globalAi;
    if (key) {
      ai = genkit({
        plugins: [googleAI({ apiKey: key })],
      });
    }
    const prompt = ai.definePrompt({
      name: 'listMajorsPrompt_local',
      model: googleAI.model('gemini-2.0-flash-preview'),
      input: { schema: ListMajorsInputSchema },
      output: { schema: ListMajorsOutputSchema },
      prompt: `What are all the majors offered at {{collegeName}}? Please provide a comprehensive list.`,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
