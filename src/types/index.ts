import { z } from 'zod';

export type PropertyCategory = 'FR' | 'L' | 'FU' | 'M' | 'MD' | 'VM';
export type PropertyType = 'CASA' | 'APARTAMENTO' | 'LOTE' | 'OUTRO';
export type PropertyStatus = 'DISPONIVEL' | 'NOVO_NA_SEMANA' | 'ALTERADO' | 'VENDIDO_NA_SEMANA' | 'VENDIDO_NO_MES';

export type Property = {
  id: string;
  brokerName: string;
  agencyName?: string;
  propertyName: string;
  houseNumber: string;
  bedrooms: number;
  bathrooms: number;
  suites: number;
  lavabos: number;
  areaSize: number;
  totalAreaSize?: number;
  price: number;
  paymentTerms: string;
  additionalFeatures: string;
  tags: string[];
  categories?: PropertyCategory[];
  propertyType: PropertyType;
  status: PropertyStatus;
  brokerContact?: string;
  photoDriveLink?: string;
  extraMaterialLink?: string;
  address?: string;
  neighborhood?: string;
};

export type PropertyTable = {
  id: string;
  name: string;
  userId: string;
  properties: Property[];
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
}

export const OcrInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A DOCX, PDF or image document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type OcrInput = z.infer<typeof OcrInputSchema>;

export const OcrOutputSchema = z.object({
    text: z.string().describe("The extracted text from the document.")
});
export type OcrOutput = z.infer<typeof OcrOutputSchema>;


export type UserCredentials = {
  email: string;
  password?: string;
  adminKey?: string;
};
