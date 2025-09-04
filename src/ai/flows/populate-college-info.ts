
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
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an AI assistant designed to gather information about colleges.
  
    Based on the college name provided, you will find the deadlines, application portal URL, list of majors, and acceptance rate.
    Use your knowledge and web searches to find the most accurate and up-to-date information.
  
    College Name: {{{collegeName}}}
  
    Return the information in the JSON format specified in the output schema. Do not include an image URL.
    `,
});

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Only retry on 503 Service Unavailable errors
      if (error?.status === 503 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Gemini API overloaded, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError!;
}

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
    
    const { output } = await retryWithBackoff(() => populateCollegeInfoPrompt(input));
    return output!;
  }
);
