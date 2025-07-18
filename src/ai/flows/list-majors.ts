
'use server';
/**
 * @fileOverview An AI agent that lists the majors offered at a given college.
 *
 * - listMajors - A function that lists the majors offered at a given college.
 * - ListMajorsInput - The input type for the listMajors function.
 * - ListMajorsOutput - The return type for the listMajors function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ListMajorsInputSchema = z.object({
  collegeName: z
    .string()
    .describe('The name of the college to list majors for.'),
});
export type ListMajorsInput = z.infer<typeof ListMajorsInputSchema>;

const ListMajorsOutputSchema = z.object({
  majors: z
    .array(z.string())
    .describe('A list of majors offered at the college.'),
});
export type ListMajorsOutput = z.infer<typeof ListMajorsOutputSchema>;

export async function listMajors(
  input: ListMajorsInput,
): Promise<ListMajorsOutput> {
  return listMajorsFlow(input);
}

const listMajorsPrompt = ai.definePrompt({
  name: 'listMajorsPrompt',
  input: { schema: ListMajorsInputSchema },
  output: { schema: ListMajorsOutputSchema },
  model: 'googleai/gemini-2.0-flash-preview',
  prompt: `What are all the majors offered at {{collegeName}}? Please provide a comprehensive list.`,
});

const listMajorsFlow = ai.defineFlow(
  {
    name: 'listMajorsFlow',
    inputSchema: ListMajorsInputSchema,
    outputSchema: ListMajorsOutputSchema,
  },
  async (input) => {
     if (!process.env.GEMINI_API_KEY) {
      throw new Error('The GEMINI_API_KEY environment variable is not set.');
    }
    const { output } = await listMajorsPrompt(input);
    return output!;
  }
);
