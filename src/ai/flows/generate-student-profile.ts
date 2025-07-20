
'use server';

/**
 * @fileOverview An AI agent that generates a hypothetical student profile
 * with a 50% chance of acceptance to a specific college and major.
 *
 * - generateStudentProfile - A function that generates the student profile.
 * - GenerateStudentProfileInput - The input type for the generateStudentProfile function.
 * - GenerateStudentProfileOutput - The return type for the generateStudentProfile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStudentProfileInputSchema = z.object({
  collegeName: z.string().describe('The name of the college.'),
  major: z.string().describe('The major the student is applying for.'),
  residency: z.enum(['In-State', 'Out-of-State', 'International']).describe('The residency status of the hypothetical student.'),
});
export type GenerateStudentProfileInput = z.infer<
  typeof GenerateStudentProfileInputSchema
>;

const GenerateStudentProfileOutputSchema = z.object({
  gpa: z.number().describe('The GPA of the hypothetical student.'),
  activities: z
    .string()
    .describe(
      'A single sentence describing the student\'s extracurricular activities and time commitment.'
    ),
  actScore: z.number().describe('The ACT score of the hypothetical student.'),
  satScore: z.number().describe('The SAT score of the hypothetical student.'),
});
export type GenerateStudentProfileOutput = z.infer<
  typeof GenerateStudentProfileOutputSchema
>;

export async function generateStudentProfile(
  input: GenerateStudentProfileInput
): Promise<GenerateStudentProfileOutput> {
  return generateStudentProfileFlow(input);
}

const generateStudentProfilePrompt = ai.definePrompt({
  name: 'generateStudentProfilePrompt',
  input: { schema: GenerateStudentProfileInputSchema },
  output: { schema: GenerateStudentProfileOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an AI assistant specialized in college admissions.
  
    Based on the provided college, major, and residency status, create a profile for a hypothetical student who would have a 50% chance of being accepted.
    
    Provide a realistic GPA, a single sentence describing their extracurricular activities (e.g., "Student is heavily invested in robotics and football, spending 35 hours a week in total in both"), an ACT score, and an SAT score for this student.

    College Name: {{{collegeName}}}
    Major: {{{major}}}
    Residency: {{{residency}}}
  
    Return the information in the JSON format specified in the output schema.
  `,
});

const generateStudentProfileFlow = ai.defineFlow(
  {
    name: 'generateStudentProfileFlow',
    inputSchema: GenerateStudentProfileInputSchema,
    outputSchema: GenerateStudentProfileOutputSchema,
  },
  async (input) => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('The GEMINI_API_KEY environment variable is not set.');
    }
    const { output } = await generateStudentProfilePrompt(input);
    return output!;
  }
);
