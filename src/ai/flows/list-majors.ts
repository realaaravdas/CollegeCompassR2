'use server';
/**
 * @fileOverview An AI agent that lists the majors offered at a given college.
 *
 * - listMajors - A function that lists the majors offered at a given college.
 * - ListMajorsInput - The input type for the listMajors function.
 * - ListMajorsOutput - The return type for the listMajors function.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ListMajorsInputSchema = z.object({
  collegeName: z.string().describe('The name of the college to list majors for.'),
});
export type ListMajorsInput = z.infer<typeof ListMajorsInputSchema>;

const ListMajorsOptionsSchema = z.object({
  apiKey: z.string().optional(),
});

const ListMajorsOutputSchema = z.object({
  majors: z.array(z.string()).describe('A list of majors offered at the college.'),
});
export type ListMajorsOutput = z.infer<typeof ListMajorsOutputSchema>;

export async function listMajors(
  input: ListMajorsInput,
  options?: z.infer<typeof ListMajorsOptionsSchema>
): Promise<ListMajorsOutput> {
  return listMajorsFlow(input, options);
}

const prompt = {
  name: 'listMajorsPrompt',
  input: {schema: ListMajorsInputSchema},
  output: {schema: ListMajorsOutputSchema},
  prompt: `What are all the majors offered at {{collegeName}}? Please provide a comprehensive list.`,
};

const listMajorsFlow = genkit.flow(
  {
    name: 'listMajorsFlow',
    inputSchema: ListMajorsInputSchema,
    outputSchema: ListMajorsOutputSchema,
    optionsSchema: ListMajorsOptionsSchema,
  },
  async (input, options) => {
    const ai = genkit({
      plugins: [googleAI({apiKey: options.apiKey})],
      model: 'googleai/gemini-2.0-flash',
    });
    const p = ai.definePrompt(prompt);
    const {output} = await p(input);
    return output!;
  }
);
