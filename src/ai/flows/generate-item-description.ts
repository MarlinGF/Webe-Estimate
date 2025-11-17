'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating item descriptions based on keywords.
 *
 * It includes:
 * - generateItemDescription: A function to generate item descriptions using AI.
 * - GenerateItemDescriptionInput: The input type for the generateItemDescription function.
 * - GenerateItemDescriptionOutput: The output type for the generateItemDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItemDescriptionInputSchema = z.object({
  keywords: z
    .string()
    .describe('Keywords to base the item description on, separated by commas.'),
});
export type GenerateItemDescriptionInput = z.infer<
  typeof GenerateItemDescriptionInputSchema
>;

const GenerateItemDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated item description.'),
});
export type GenerateItemDescriptionOutput = z.infer<
  typeof GenerateItemDescriptionOutputSchema
>;

export async function generateItemDescription(
  input: GenerateItemDescriptionInput
): Promise<GenerateItemDescriptionOutput> {
  return generateItemDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateItemDescriptionPrompt',
  input: {schema: GenerateItemDescriptionInputSchema},
  output: {schema: GenerateItemDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in creating item descriptions for business estimates and invoices.
  Based on the provided keywords, generate a professional and detailed description for a line item.

  Keywords: {{{keywords}}}
  `,
});

const generateItemDescriptionFlow = ai.defineFlow(
  {
    name: 'generateItemDescriptionFlow',
    inputSchema: GenerateItemDescriptionInputSchema,
    outputSchema: GenerateItemDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
