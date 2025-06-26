'use server';

/**
 * @fileOverview AI flow to extract multiple property details from a document.
 *
 * - extractPropertyDetails - A function that handles the property details extraction process for multiple properties.
 * - ExtractPropertyDetailsInput - The input type for the extractPropertyDetails function.
 * - ExtractPropertyDetailsOutput - The return type for the extractPropertyDetails function, containing a list of properties.
 * - PropertyDetails - The type for a single extracted property.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPropertyDetailsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A DOCX, PDF or image document containing one or more property listings, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractPropertyDetailsInput = z.infer<typeof ExtractPropertyDetailsInputSchema>;

// Schema for a single property
const PropertyDetailsSchema = z.object({
  agentName: z.string().describe('The name of the agent or company listing the property.'),
  propertyName: z.string().describe('The name of the property or development.'),
  houseNumber: z.string().describe('The house or apartment number.').optional(),
  bedrooms: z.number().describe('The number of bedrooms in the property.'),
  bathrooms: z.number().describe('The number of bathrooms in the property.'),
  suites: z.number().describe('The number of suites in the property.'),
  lavabos: z.number().describe('The number of lavabos (washrooms without shower/bath).').optional(),
  areaSize: z.number().describe('The area size of the property in square meters.'),
  price: z.number().describe('The price of the property.'),
  paymentTerms: z.string().describe('The payment terms for the property.'),
  additionalFeatures: z.string().describe('Any additional features of the property.'),
  propertyType: z.enum(['CASA', 'APARTAMENTO', 'OUTRO']).describe('The type of property (e.g., CASA, APARTAMENTO).').optional(),
  brokerContact: z.string().describe('The contact information for the broker/agent (phone, email).').optional(),
  photoDriveLink: z.string().url().describe('A URL link to a photo gallery (e.g., Google Drive).').optional(),
  extraMaterialLink: z.string().url().describe('A URL link to extra materials (e.g., brochures, videos).').optional(),
  address: z.string().describe('The full property address.').optional(),
  neighborhood: z.string().describe('The neighborhood of the property.').optional(),
  category: z.enum(['FRENTE', 'LATERAL', 'FUNDOS', 'DECORADO', 'MOBILIADO', 'COM_VISTA_PARA_O_MAR']).describe('The property category.').optional(),
});
export type PropertyDetails = z.infer<typeof PropertyDetailsSchema>;

// Schema for the output, which is a list of properties
const ExtractPropertyDetailsOutputSchema = z.object({
    properties: z.array(PropertyDetailsSchema).describe("A list of all properties extracted from the document.")
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

You will receive a document (like a PDF, DOCX, or an image) that may contain one or more property listings. Your task is to first perform OCR on the document if it's an image or a scanned document to extract all the text. Then, analyze the text to identify and extract the details for EACH property listed.

For each property, extract the following information:
- Agent/Company Name: The name of the agent or company listing the property.
- Property Name: The name of the property or development.
- House/Apartment Number: The specific number of the unit.
- Number of Bedrooms: The number of bedrooms in the property.
- Number of Bathrooms: The number of bathrooms in the property.
- Number of Suites: The number of suites in the property.
- Number of Lavabos: The number of washrooms (toilets without shower).
- Area Size: The area size of the property in square meters.
- Price: The price of the property.
- Payment Terms: The payment terms for the property.
- Additional Features: Any additional features of the property.
- Property Type: The type of property (e.g., CASA, APARTAMENTO, OUTRO).
- Category: The category of the property (e.g., FRENTE, LATERAL, FUNDOS, DECORADO, MOBILIADO, COM_VISTA_PARA_O_MAR).
- Broker Contact: The contact information for the broker/agent (phone, email).
- Photo Drive Link: A URL link to a photo gallery (e.g., Google Drive).
- Extra Material Link: A URL link to extra materials (e.g., brochures, videos).
- Address: The full property address.
- Neighborhood: The neighborhood of the property.

Here is the document data:
{{media url=documentDataUri}}

Return all extracted properties in a single JSON object with a 'properties' key, which should be an array of property objects. If no properties are found, return an empty array.
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
