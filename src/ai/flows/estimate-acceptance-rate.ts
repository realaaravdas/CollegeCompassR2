'use server';

/**
 * @fileOverview An AI agent that estimates the acceptance rate for a student
 * at a specific college and major, using GPA, test scores, and AI analysis.
 *
 * - estimateAcceptanceRate - A function that estimates the acceptance rate.
 * - EstimateAcceptanceRateInput - The input type for the estimateAcceptanceRate function.
 * - EstimateAcceptanceRateOutput - The return type for the estimateAcceptanceRate function.
 */

import { ai as globalAi } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';

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

const EstimateAcceptanceRateOptionsSchema = z.object({
  apiKey: z.string().optional(),
});

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

const estimateAcceptanceRateFlow = globalAi.defineFlow(
  {
    name: 'estimateAcceptanceRateFlow',
    inputSchema: z.object({
      input: EstimateAcceptanceRateInputSchema,
      apiKey: z.string().optional(),
    }),
    outputSchema: EstimateAcceptanceRateOutputSchema,
  },
  async ({ input, apiKey }) => {
    let ai = globalAi;
    if (apiKey) {
      ai = genkit({
        plugins: [googleAI({ apiKey })],
      });
    }

    const prompt = ai.definePrompt({
      name: 'estimateAcceptanceRatePrompt_local',
      model: 'gemini-1.5-flash-latest',
      input: { schema: EstimateAcceptanceRateInputSchema },
      output: { schema: EstimateAcceptanceRateOutputSchema },
      prompt: `You are an AI assistant specialized in estimating college acceptance rates.
      
        Given the following information about a student and the college they are applying to, estimate their acceptance rate for the specified major. Provide a percentage as the acceptanceRateEstimate, and explain your reasoning in the reasoning field.
      
        College Name: {{{collegeName}}}
        Major: {{{major}}}
        GPA: {{{gpa}}}
        Test Score: {{{testScore}}}
      
        Consider factors such as the college's overall acceptance rate, the competitiveness of the major, and the student's GPA and test scores.
      `,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

export async function estimateAcceptanceRate(
  input: EstimateAcceptanceRateInput,
  options?: z.infer<typeof EstimateAcceptanceRateOptionsSchema>
): Promise<EstimateAcceptanceRateOutput> {
  return estimateAcceptanceRateFlow({ input, apiKey: options?.apiKey });
}
