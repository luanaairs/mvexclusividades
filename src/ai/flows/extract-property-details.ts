'use server';

/**
 * @fileOverview AI flow to extract property details from a document.
 *
 * - extractPropertyDetails - A function that handles the property details extraction process.
 * - ExtractPropertyDetailsInput - The input type for the extractPropertyDetails function.
 * - ExtractPropertyDetailsOutput - The return type for the extractPropertyDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPropertyDetailsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A DOCX, PDF or image document containing property listings, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractPropertyDetailsInput = z.infer<typeof ExtractPropertyDetailsInputSchema>;

const ExtractPropertyDetailsOutputSchema = z.object({
  agentName: z.string().describe('The name of the agent or company listing the property.'),
  propertyName: z.string().describe('The name of the property or development.'),
  bedrooms: z.number().describe('The number of bedrooms in the property.'),
  bathrooms: z.number().describe('The number of bathrooms in the property.'),
  suites: z.number().describe('The number of suites in the property.'),
  areaSize: z.number().describe('The area size of the property in square meters.'),
  price: z.number().describe('The price of the property.'),
  paymentTerms: z.string().describe('The payment terms for the property.'),
  additionalFeatures: z.string().describe('Any additional features of the property.'),
});
export type ExtractPropertyDetailsOutput = z.infer<typeof ExtractPropertyDetailsOutputSchema>;

export async function extractPropertyDetails(input: ExtractPropertyDetailsInput): Promise<ExtractPropertyDetailsOutput> {
  return extractPropertyDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPropertyDetailsPrompt',
  input: {schema: ExtractPropertyDetailsInputSchema},
  output: {schema: ExtractPropertyDetailsOutputSchema},
  prompt: `You are an expert real estate data extraction specialist with OCR capabilities.

You will receive a document (like a PDF, DOCX, or an image) containing property listings. Your task is to first perform OCR on the document if it's an image or a scanned document to extract all the text. Then, analyze the text to extract the relevant details and return them in a structured JSON format.

Extract the following information:
- Agent/Company Name: The name of the agent or company listing the property.
- Property Name: The name of the property or development.
- Number of Bedrooms: The number of bedrooms in the property.
- Number of Bathrooms: The number of bathrooms in the property.
- Number of Suites: The number of suites in the property.
- Area Size: The area size of the property in square meters.
- Price: The price of the property.
- Payment Terms: The payment terms for the property.
- Additional Features: Any additional features of the property.

Here is the document data:
{{media url=documentDataUri}}

Return the extracted information in JSON format.
`,
});

const extractPropertyDetailsFlow = ai.defineFlow(
  {
    name: 'extractPropertyDetailsFlow',
    inputSchema: ExtractPropertyDetailsInputSchema,
    outputSchema: ExtractPropertyDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
