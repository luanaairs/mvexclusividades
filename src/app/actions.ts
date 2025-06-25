'use server';
import { extractPropertyDetails as extractPropertyDetailsFlow, type ExtractPropertyDetailsInput } from "@/ai/flows/extract-property-details";

export async function extractPropertyDetails(input: ExtractPropertyDetailsInput) {
    try {
        const result = await extractPropertyDetailsFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error extracting property details:", error);
        return { success: false, error: "Falha ao extrair detalhes do documento. Verifique o formato do arquivo e tente novamente." };
    }
}
