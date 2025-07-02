'use server';

import { extractTextFromDocument as ocrFlow } from "@/ai/flows/extract-property-details";
import { type OcrInput, type OcrOutput } from "@/types";

export async function performOcr(input: OcrInput): Promise<{ success: boolean; data?: OcrOutput; error?: string; }> {
    try {
        const result = await ocrFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error performing OCR:", error);
        return { success: false, error: "Falha ao extrair texto do documento. Verifique o arquivo e tente novamente." };
    }
}
