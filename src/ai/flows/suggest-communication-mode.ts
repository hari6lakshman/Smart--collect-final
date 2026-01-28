'use server';

/**
 * @fileOverview Suggests optimal communication channels based on past case reply patterns.
 *
 * - suggestCommunicationMode - A function that suggests the communication mode.
 * - SuggestCommunicationModeInput - The input type for the suggestCommunicationMode function.
 * - SuggestCommunicationModeOutput - The return type for the suggestCommunicationMode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCommunicationModeInputSchema = z.object({
  caseHistory: z
    .string()
    .describe(
      'The past communication history for the case, including channels used and reply patterns.'
    ),
});
export type SuggestCommunicationModeInput = z.infer<
  typeof SuggestCommunicationModeInputSchema
>;

const SuggestCommunicationModeOutputSchema = z.object({
  suggestedChannel: z
    .enum(['calling', 'email', 'messaging'])
    .describe(
      'The suggested optimal communication channel based on the case history.'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI reasoning behind the suggested communication channel choice.'
    ),
});
export type SuggestCommunicationModeOutput = z.infer<
  typeof SuggestCommunicationModeOutputSchema
>;

export async function suggestCommunicationMode(
  input: SuggestCommunicationModeInput
): Promise<SuggestCommunicationModeOutput> {
  return suggestCommunicationModeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCommunicationModePrompt',
  input: {schema: SuggestCommunicationModeInputSchema},
  output: {schema: SuggestCommunicationModeOutputSchema},
  prompt: `You are an AI assistant that suggests the optimal communication channel (calling, email, messaging) for debt collection cases based on their past reply patterns.

  Analyze the following case history and suggest the best communication channel to increase engagement. Provide a brief reasoning for your choice.

  Case History: {{{caseHistory}}}

  Consider past reply patterns, channel effectiveness, and any other relevant information.

  Your suggestion should be based on what would most likely result in a response from the debtor.

  Ensure that your output matches the following schema: {{outputSchema}}.
  `,
});

const suggestCommunicationModeFlow = ai.defineFlow(
  {
    name: 'suggestCommunicationModeFlow',
    inputSchema: SuggestCommunicationModeInputSchema,
    outputSchema: SuggestCommunicationModeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
