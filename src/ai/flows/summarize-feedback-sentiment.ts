// SummarizeFeedbackSentiment.ts
'use server';

/**
 * @fileOverview Summarizes the sentiment of user feedback for a given project.
 *
 * - summarizeFeedbackSentiment - A function that takes user feedback as input and returns a summarized sentiment.
 * - SummarizeFeedbackSentimentInput - The input type for the summarizeFeedbackSentiment function.
 * - SummarizeFeedbackSentimentOutput - The return type for the summarizeFeedbackSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeFeedbackSentimentInputSchema = z.object({
  feedback: z
    .string()
    .describe('The user feedback text to analyze for sentiment.'),
});
export type SummarizeFeedbackSentimentInput = z.infer<
  typeof SummarizeFeedbackSentimentInputSchema
>;

const SummarizeFeedbackSentimentOutputSchema = z.object({
  sentimentSummary: z
    .string()
    .describe('A summary of the sentiment expressed in the feedback.'),
});
export type SummarizeFeedbackSentimentOutput = z.infer<
  typeof SummarizeFeedbackSentimentOutputSchema
>;

export async function summarizeFeedbackSentiment(
  input: SummarizeFeedbackSentimentInput
): Promise<SummarizeFeedbackSentimentOutput> {
  return summarizeFeedbackSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeFeedbackSentimentPrompt',
  input: {schema: SummarizeFeedbackSentimentInputSchema},
  output: {schema: SummarizeFeedbackSentimentOutputSchema},
  prompt: `Analyze the following user feedback and provide a concise summary of the overall sentiment expressed. Focus on identifying the main emotions and opinions conveyed in the text.\n\nFeedback: {{{feedback}}}`,
});

const summarizeFeedbackSentimentFlow = ai.defineFlow(
  {
    name: 'summarizeFeedbackSentimentFlow',
    inputSchema: SummarizeFeedbackSentimentInputSchema,
    outputSchema: SummarizeFeedbackSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
