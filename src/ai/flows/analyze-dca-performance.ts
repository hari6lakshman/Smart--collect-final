'use server';

/**
 * @fileOverview Analyzes DCA performance based on recovery rates, communication modes, and timelines to suggest optimal case assignments.
 *
 * - analyzeDcaPerformance - A function that initiates the DCA performance analysis.
 * - AnalyzeDcaPerformanceInput - The input type for the analyzeDcaPerformance function.
 * - AnalyzeDcaPerformanceOutput - The return type for the analyzeDcaPerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDcaPerformanceInputSchema = z.object({
  dcaId: z.string().describe('The ID of the DCA to analyze.'),
  caseHistory: z.string().describe('The historical data of cases handled by the DCA, including recovery rates, communication modes, and timelines.'),
});
export type AnalyzeDcaPerformanceInput = z.infer<typeof AnalyzeDcaPerformanceInputSchema>;

const AnalyzeDcaPerformanceOutputSchema = z.object({
  analysisSummary: z.string().describe('A summary of the DCA performance analysis, including strengths, weaknesses, and areas for improvement.'),
  recommendedAssignments: z.string().describe('Recommendations for optimal case assignments based on the DCA performance analysis.'),
});
export type AnalyzeDcaPerformanceOutput = z.infer<typeof AnalyzeDcaPerformanceOutputSchema>;

export async function analyzeDcaPerformance(input: AnalyzeDcaPerformanceInput): Promise<AnalyzeDcaPerformanceOutput> {
  return analyzeDcaPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDcaPerformancePrompt',
  input: {schema: AnalyzeDcaPerformanceInputSchema},
  output: {schema: AnalyzeDcaPerformanceOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing Debt Collection Agency (DCA) performance.

You will analyze the provided case history of a specific DCA and provide a summary of their performance.

Based on the analysis, you will recommend optimal case assignments to improve overall recovery rates.

DCA ID: {{{dcaId}}}
Case History: {{{caseHistory}}}

Analyze the DCA's performance, focusing on recovery rates, communication modes, and timelines.
Provide a summary of the DCA's strengths and weaknesses.
Recommend optimal case assignments based on the analysis.`,
});

const analyzeDcaPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeDcaPerformanceFlow',
    inputSchema: AnalyzeDcaPerformanceInputSchema,
    outputSchema: AnalyzeDcaPerformanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
