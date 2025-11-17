'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an item image based on a name.
 *
 * It includes:
 * - generateItemImage: A function to generate item images using AI.
 * - GenerateItemImageInput: The input type for the generateItemImage function.
 * - GenerateItemImageOutput: The output type for the generateItemImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItemImageInputSchema = z.object({
  name: z.string().describe('The name of the item to generate an image for.'),
});
export type GenerateItemImageInput = z.infer<
  typeof GenerateItemImageInputSchema
>;

const GenerateItemImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateItemImageOutput = z.infer<
  typeof GenerateItemImageOutputSchema
>;

export async function generateItemImage(
  input: GenerateItemImageInput
): Promise<GenerateItemImageOutput> {
  return generateItemImageFlow(input);
}

const generateItemImageFlow = ai.defineFlow(
  {
    name: 'generateItemImageFlow',
    inputSchema: GenerateItemImageInputSchema,
    outputSchema: GenerateItemImageOutputSchema,
  },
  async ({name}) => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a high-quality, professional product image for the following item: ${name}. The image should be on a clean, light-colored background, well-lit, and suitable for a business catalog or library.`,
      config: {
        aspectRatio: '1:1',
      },
    });

    if (!media.url) {
      throw new Error('Image generation failed.');
    }

    return {imageUrl: media.url};
  }
);
