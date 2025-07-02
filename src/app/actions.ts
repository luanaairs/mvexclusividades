
'use server';

import { extractTextFromDocument as ocrFlow } from "@/ai/flows/extract-property-details";
import { type OcrInput, type Property } from "@/types";
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, serverTimestamp, addDoc } from "firebase/firestore";

const permissionErrorMessage = "Erro de permissão no banco de dados. Verifique se as Regras de Segurança do Firestore foram atualizadas conforme as instruções mais recentes.";
const firebaseNotInitializedError = "O Firebase não está configurado corretamente. Verifique as variáveis de ambiente.";

function isPermissionError(error: any): boolean {
    const code = error?.code?.toUpperCase();
    return code === 'PERMISSION-DENIED';
}

export async function performOcr(input: OcrInput) {
    if (!db || !auth) return { success: false, error: firebaseNotInitializedError };
    try {
        const result = await ocrFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error performing OCR:", error);
        return { success: false, error: "Falha ao extrair texto do documento. Verifique o arquivo e tente novamente." };
    }
}

// --- Simplified Data Management Actions ---

export async function loadPropertiesForUser(userId: string): Promise<{ success: boolean; properties?: Property[]; error?: string; }> {
    if (!db || !auth) return { success: false, error: firebaseNotInitializedError };
    if (!userId) return { success: false, error: "Usuário não autenticado." };
    try {
        const userDocRef = doc(db, 'userData', userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().properties) {
            return { success: true, properties: docSnap.data().properties as Property[] };
        } else {
            // Document doesn't exist or has no properties, return empty array.
            return { success: true, properties: [] };
        }
    } catch (error: any) {
        console.error("Error loading properties:", error);
        if (isPermissionError(error)) {
            return { success: false, error: permissionErrorMessage };
        }
        return { success: false, error: "Falha ao carregar os dados da nuvem." };
    }
}

export async function savePropertiesForUser({ userId, properties }: { userId: string, properties: Property[] }): Promise<{ success: boolean; error?: string; }> {
    if (!db || !auth) return { success: false, error: firebaseNotInitializedError };
    if (!userId) return { success: false, error: "Usuário não autenticado." };
    try {
        const userDocRef = doc(db, 'userData', userId);
        
        // Firestore cannot store 'undefined' values. This robustly strips any undefined fields.
        const cleanProperties = JSON.parse(JSON.stringify(properties));
        
        // Use setDoc with merge: true to create or update the document without overwriting other fields.
        await setDoc(userDocRef, {
            properties: cleanProperties,
            updatedAt: serverTimestamp()
        }, { merge: true });

        return { success: true };
    } catch (error: any) {
        console.error("Error saving properties:", error);
        if (isPermissionError(error)) {
            return { success: false, error: permissionErrorMessage };
        }
        return { success: false, error: "Falha ao salvar as alterações na nuvem." };
    }
}


// --- Sharing Logic (Unchanged) ---
export async function createShareLink(properties: Property[]): Promise<{ success: boolean; shareId?: string; error?: string }> {
    if (!db || !auth) return { success: false, error: firebaseNotInitializedError };
    try {
        // Firestore cannot store 'undefined' values. This robustly strips any undefined fields.
        const cleanProperties = JSON.parse(JSON.stringify(properties));
        const docRef = await addDoc(collection(db, "shared_lists"), {
            properties: cleanProperties,
            createdAt: serverTimestamp()
        });
        return { success: true, shareId: docRef.id };
    } catch (error: any) {
        console.error("Error creating share link in DB:", error);
        if (isPermissionError(error)) {
            return { success: false, error: permissionErrorMessage };
        }
        return { success: false, error: "Falha ao criar o link de compartilhamento no servidor." };
    }
}

export async function getSharedList(shareId: string): Promise<{ success: boolean; properties?: Property[]; error?: string }> {
    if (!db || !auth) return { success: false, error: firebaseNotInitializedError };
    try {
        const docRef = doc(db, "shared_lists", shareId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { success: true, properties: docSnap.data().properties as Property[] };
        } else {
            return { success: false, error: "Link de compartilhamento não encontrado." };
        }
    } catch (error) {
        console.error("Error fetching shared list:", error);
         if (isPermissionError(error)) {
            return { success: false, error: permissionErrorMessage };
        }
        return { success: false, error: "Falha ao buscar a lista compartilhada." };
    }
}
