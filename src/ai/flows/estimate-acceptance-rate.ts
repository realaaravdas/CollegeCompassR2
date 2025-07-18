
'use server';

/**
 * @fileOverview An AI agent that estimates the acceptance rate for a student
 * at a specific college and major, using GPA, test scores, and AI analysis.
 *
 * - estimateAcceptanceRate - A function that estimates the acceptance rate.
 * - EstimateAcceptanceRateInput - The input type for the estimateAcceptanceRate function.
 * - EstimateAcceptanceRateOutput - The return type for the estimateAcceptanceRate function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const EstimateAcceptanceRateInputSchema = z.object({
  collegeName: z.string().describe('The name of the college.'),
  major: z.string().describe('The major the student is applying for.'),
  gpa: z.number().describe('The GPA of the student.'),
  testScore: z
    .number()
    .describe('The standardized test score of the student (e.g., SAT or ACT).'),
});
export type EstimateAcceptanceRateInput = z.infer<
  typeof EstimateAcceptanceRateInputSchema
>;

const EstimateAcceptanceRateOutputSchema = z.object({
  acceptanceRateEstimate: z
    .number()
    .describe(
      'The estimated acceptance rate (as a percentage) for the student, given their GPA, test scores, and the AI analysis.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the acceptance rate estimate, including factors considered by the AI.'
    ),
});
export type EstimateAcceptanceRateOutput = z.infer<
  typeof EstimateAcceptanceRateOutputSchema
>;

export async function estimateAcceptanceRate(
  input: EstimateAcceptanceRateInput
): Promise<EstimateAcceptanceRateOutput> {
  return estimateAcceptanceRateFlow(input);
}

const estimateAcceptanceRatePrompt = ai.definePrompt({
  name: 'estimateAcceptanceRatePrompt',
  input: { schema: EstimateAcceptanceRateInputSchema },
  output: { schema: EstimateAcceptanceRateOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an AI assistant specialized in estimating college acceptance rates.
  
    Given the following information about a student and the college they are applying to, estimate their acceptance rate for the specified major. Provide a percentage as the acceptanceRateEstimate, and explain your reasoning in the reasoning field.
  
    College Name: {{{collegeName}}}
    Major: {{{major}}}
    GPA: {{{gpa}}}
    Test Score: {{{testScore}}}
  
    Consider factors such as the college's overall acceptance rate, the competitiveness of the major, and the student's GPA and test scores.
  `,
});

const estimateAcceptanceRateFlow = ai.defineFlow(
  {
    name: 'estimateAcceptanceRateFlow',
    inputSchema: EstimateAcceptanceRateInputSchema,
    outputSchema: EstimateAcceptanceRateOutputSchema,
  },
  async (input) => {
     if (!process.env.GEMINI_API_KEY) {
      throw new Error('The GEMINI_API_KEY environment variable is not set.');
    }
    const { output } = await estimateAcceptanceRatePrompt(input);
    return output!;
  }
);
