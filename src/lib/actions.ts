
'use server';

import { generateItemDescription } from '@/ai/flows/generate-item-description';
import { generateItemImage } from '@/ai/flows/generate-item-image';
import { z } from 'zod';

const descriptionSchema = z.object({
  keywords: z.string().min(1, { message: 'Keywords are required.' }),
});

export async function generateDescriptionAction(
  prevState: any,
  formData: FormData
) {
  const validatedFields = descriptionSchema.safeParse({
    keywords: formData.get('keywords'),
  });

  if (!validatedFields.success) {
    return {
      description: '',
      error: validatedFields.error.flatten().fieldErrors.keywords?.[0],
    };
  }

  try {
    const result = await generateItemDescription({ keywords: validatedFields.data.keywords });
    if (result.description) {
      return { description: result.description, error: null };
    }
    return { description: '', error: 'Could not generate a description. Please try again.' };
  } catch (error) {
    console.error(error);
    return { description: '', error: 'An unexpected error occurred.' };
  }
}


const imageSchema = z.object({
  name: z.string().min(1, { message: 'Item name is required to generate an image.' }),
});

export async function generateImageAction(
  prevState: any,
  formData: FormData
) {
  const validatedFields = imageSchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      imageUrl: '',
      error: validatedFields.error.flatten().fieldErrors.name?.[0],
    };
  }

  try {
    const result = await generateItemImage({ name: validatedFields.data.name });
    if (result.imageUrl) {
      return { imageUrl: result.imageUrl, error: null };
    }
    return { imageUrl: '', error: 'Could not generate an image. Please try again.' };
  } catch (error) {
    console.error(error);
    return { imageUrl: '', error: 'An unexpected error occurred.' };
  }
}
