'use server';
import { extractTextFromDocument as ocrFlow } from "@/ai/flows/extract-property-details";
import { type OcrInput, type NewUser } from "@/types";

export async function performOcr(input: OcrInput) {
    try {
        const result = await ocrFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error performing OCR:", error);
        return { success: false, error: "Falha ao extrair texto do documento. Verifique o arquivo e tente novamente." };
    }
}

export async function createUserAction(data: Pick<NewUser, 'adminPassword'>) {
    const { adminPassword } = data;

    if (!process.env.ADMIN_SECRET_KEY) {
        return { success: false, error: "A senha de administrador não está configurada no servidor." };
    }

    if (adminPassword !== process.env.ADMIN_SECRET_KEY) {
        return { success: false, error: "Senha de administrador inválida." };
    }
    
    // The actual user creation will be handled on the client-side in localStorage
    // This action is only for validating the admin secret.
    return { success: true };
}
