'use server';

/**
 * @fileOverview An AI agent that prioritizes overdue debt cases based on several factors.
 *
 * - prioritizeCases - A function that prioritizes debt cases.
 * - CaseInput - The input type for the prioritizeCases function.
 * - CaseOutput - The return type for the prioritizeCases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CaseInputSchema = z.object({
  overdueAging: z
    .number()
    .describe('The number of days the debt is overdue.'),
  dueAmount: z.number().describe('The total amount of debt due.'),
  recoveryRate: z
    .number()
    .describe(
      'The historical recovery rate for similar cases, expressed as a percentage (e.g., 0.75 for 75%).'
    ),
  hasOverdueHistory: z
    .number()
    .describe(
      'The number of times the debtor has been overdue in the past.'
    ),
});
export type CaseInput = z.infer<typeof CaseInputSchema>;

const CaseOutputSchema = z.object({
  priorityScore: z
    .number()
    .describe(
      'A numerical score indicating the priority of the case (higher value means higher priority).'
    ),
  priorityReason: z
    .string()
    .describe(
      'A brief explanation of why the case was assigned the given priority.'
    ),
});
export type CaseOutput = z.infer<typeof CaseOutputSchema>;

export async function prioritizeCases(input: CaseInput): Promise<CaseOutput> {
  return prioritizeCasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeCasesPrompt',
  input: {schema: CaseInputSchema},
  output: {schema: CaseOutputSchema},
  prompt: `You are an AI assistant that prioritizes debt collection cases.

  Analyze the following case data to determine its priority. Cases with no prior overdue history (a value of 0) should be marked as high priority.

  Overdue Aging: {{overdueAging}} days
  Due Amount: {{dueAmount}}
  Recovery Rate: {{recoveryRate}}
  Previous Overdue Count: {{hasOverdueHistory}}

  Based on this information, assign a priority score between 0 and 100 (higher is more urgent) and explain your reasoning.

  Consider these guidelines:
  - Higher overdue aging and due amount generally increase priority.
  - Lower recovery rates increase priority.
  - Cases with a higher number of previous overdues should have a higher priority.
  - Cases with no overdue history (0) should be prioritized as high.

  Ensure the output is in JSON format.
`,
});

const prioritizeCasesFlow = ai.defineFlow(
  {
    name: 'prioritizeCasesFlow',
    inputSchema: CaseInputSchema,
    outputSchema: CaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
