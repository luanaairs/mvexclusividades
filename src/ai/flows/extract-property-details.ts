'use server';

/**
 * @fileOverview AI flow to perform OCR on a document and extract raw text.
 *
 * - extractTextFromDocument - A function that handles the OCR process.
 * - OcrInput - The input type for the function.
 * - OcrOutput - The return type for the function, containing the extracted text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OcrInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A DOCX, PDF or image document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type OcrInput = z.infer<typeof OcrInputSchema>;

const OcrOutputSchema = z.object({
    text: z.string().describe("The extracted text from the document.")
});
export type OcrOutput = z.infer<typeof OcrOutputSchema>;


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
    // We use a simple prompt that just includes the media.
    // For documents, this will perform OCR and return the text.
    const llmResponse = await ai.generate({
        prompt: `Extract all text from the following document:\n{{media url="${input.documentDataUri}"}}`,
    });

    return { text: llmResponse.text };
  }
);
