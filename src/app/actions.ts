'use server';

import { auth, db, firebaseError } from '@/lib/firebase';
import { type Property, type OcrInput, OcrInputSchema } from '@/types';
import { headers } from 'next/headers';
import { extractTextFromDocument } from '@/ai/flows/extract-property-details';

export async function performOcr(input: OcrInput): Promise<{ success: boolean; data?: { text: string }; error?: string }> {
  const parsedInput = OcrInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return { success: false, error: 'Dados de entrada inválidos.' };
  }

  try {
    const output = await extractTextFromDocument(parsedInput.data);
    return { success: true, data: output };
  } catch (error: any) {
    console.error('OCR Error:', error);
    return { success: false, error: 'Falha ao extrair texto do documento.' };
  }
}

export async function getBaseUrl() {
    const host = headers().get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    return `${protocol}://${host}`;
}
