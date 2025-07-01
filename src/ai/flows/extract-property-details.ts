'use server';

/**
 * @fileOverview AI flow to perform OCR on a document and extract raw text.
 *
 * - extractTextFromDocument - A function that handles the OCR process.
 */

import {ai} from '@/ai/genkit';
import { OcrInputSchema, OcrOutputSchema, type OcrInput, type OcrOutput } from '@/types';


export async function extractTextFromDocument(input: OcrInput): Promise<OcrOutput> {
  return ocrFlow(input);
}

const ocrFlow = ai.defineFlow(
  {
    name: 'ocrFlow',
    inputSchema: OcrInputSchema,
    outputSchema: OcrOutputSchema,
  },
  async (input) => {
    // We use a multi-part prompt to send the document data correctly.
    const llmResponse = await ai.generate({
      prompt: [
        {text: 'Extract all text from the following document:'},
        {media: {url: input.documentDataUri}},
      ],
    });

    return { text: llmResponse.text };
  }
);
