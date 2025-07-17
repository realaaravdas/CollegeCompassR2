'use server';

/**
 * @fileOverview This file defines a Genkit flow to populate college information using web scraping and the Gemini API.
 *
 * - populateCollegeInfo - A function that handles the college information population process.
 * - PopulateCollegeInfoInput - The input type for the populateCollegeInfo function.
 * - PopulateCollegeInfoOutput - The return type for the populateCollegeInfo function.
 */

import { ai as globalAi } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';

const PopulateCollegeInfoInputSchema = z.object({
  collegeName: z
    .string()
    .describe('The name of the college to populate information for.'),
});
export type PopulateCollegeInfoInput = z.infer<
  typeof PopulateCollegeInfoInputSchema
>;

const PopulateCollegeInfoOptionsSchema = z.object({
  apiKey: z.string().optional(),
});

const PopulateCollegeInfoOutputSchema = z.object({
  deadlines: z
    .string()
    .describe('Important application deadlines for the college.'),
  applicationPortal: z
    .string()
    .describe('The URL of the college application portal.'),
  imageUrl: z.string().describe('The URL of an image representing the college.'),
  majors: z.array(z.string()).describe('A list of majors offered by the college.'),
  acceptanceRate: z.string().describe('Acceptance rate for the college.'),
});
export type PopulateCollegeInfoOutput = z.infer<
  typeof PopulateCollegeInfoOutputSchema
>;

export async function populateCollegeInfo(
  input: PopulateCollegeInfoInput,
  options?: z.infer<typeof PopulateCollegeInfoOptionsSchema>
): Promise<PopulateCollegeInfoOutput> {
  return populateCollegeInfoFlow({ input, apiKey: options?.apiKey });
}

const populateCollegeInfoFlow = globalAi.defineFlow(
  {
    name: 'populateCollegeInfoFlow',
    inputSchema: z.object({
      input: PopulateCollegeInfoInputSchema,
      apiKey: z.string().optional(),
    }),
    outputSchema: PopulateCollegeInfoOutputSchema,
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
      name: 'populateCollegeInfoPrompt_local',
      model: googleAI.model('gemini-2.0-flash-preview'),
      input: { schema: PopulateCollegeInfoInputSchema },
      output: { schema: PopulateCollegeInfoOutputSchema },
      prompt: `You are an AI assistant designed to gather information about colleges.
      
        Based on the college name provided, you will find the deadlines, application portal URL, an image URL, list of majors, and acceptance rate.
        Use your knowledge and web searches to find the most accurate and up-to-date information.
      
        College Name: {{{collegeName}}}
      
        Return the information in the JSON format specified in the output schema.
        `,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
