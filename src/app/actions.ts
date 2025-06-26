'use server';
import { extractTextFromDocument as ocrFlow, type OcrInput } from "@/ai/flows/extract-property-details";

export async function performOcr(input: OcrInput) {
    try {
        const result = await ocrFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error performing OCR:", error);
        return { success: false, error: "Falha ao extrair texto do documento. Verifique o arquivo e tente novamente." };
    }
}
