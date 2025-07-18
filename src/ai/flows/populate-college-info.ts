
'use server';

/**
 * @fileOverview This file defines a Genkit flow to populate college information using the Gemini API.
 *
 * - populateCollegeInfo - A function that handles the college information population process.
 * - PopulateCollegeInfoInput - The input type for the populateCollegeInfo function.
 * - PopulateCollegeInfoOutput - The return type for the populateCollegeInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const PopulateCollegeInfoInputSchema = z.object({
  collegeName: z
    .string()
    .describe('The name of the college to populate information for.'),
});
export type PopulateCollegeInfoInput = z.infer<
  typeof PopulateCollegeInfoInputSchema
>;

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
  input: PopulateCollegeInfoInput
): Promise<PopulateCollegeInfoOutput> {
  return populateCollegeInfoFlow(input);
}

const populateCollegeInfoPrompt = ai.definePrompt({
  name: 'populateCollegeInfoPrompt',
  input: { schema: PopulateCollegeInfoInputSchema },
  output: { schema: PopulateCollegeInfoOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an AI assistant designed to gather information about colleges.
  
    Based on the college name provided, you will find the deadlines, application portal URL, an image URL, list of majors, and acceptance rate.
    Use your knowledge and web searches to find the most accurate and up-to-date information.
  
    College Name: {{{collegeName}}}
  
    Return the information in the JSON format specified in the output schema.
    `,
});

const populateCollegeInfoFlow = ai.defineFlow(
  {
    name: 'populateCollegeInfoFlow',
    inputSchema: PopulateCollegeInfoInputSchema,
    outputSchema: PopulateCollegeInfoOutputSchema,
  },
  async (input) => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('The GEMINI_API_KEY environment variable is not set.');
    }
    const { output } = await populateCollegeInfoPrompt(input);
    return output!;
  }
);
