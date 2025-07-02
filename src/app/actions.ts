
'use server';

import { extractTextFromDocument as ocrFlow } from "@/ai/flows/extract-property-details";
import { type OcrInput, type Property, type PropertyTable } from "@/types";
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

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

// --- Table Management Actions (with new data structure) ---

// Helper function to get the user's tables subcollection
const userTablesCollection = (userId: string) => collection(db!, 'users', userId, 'tables');

export async function getTablesForUser(userId: string): Promise<{ success: boolean; tables?: PropertyTable[]; error?: string; }> {
    if (!db || !auth) return { success: false, error: firebaseNotInitializedError };
    if (!userId) return { success: false, error: "Usuário não autenticado." };
    try {
        const tablesRef = userTablesCollection(userId);
        const q = query(tablesRef);
        const querySnapshot = await getDocs(q);
        const tables = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PropertyTable));
        
        const sortedTables = tables.sort((a, b) => {
            const aTime = a.createdAt?.seconds ?? 0;
            const bTime = b.createdAt?.seconds ?? 0;
            return bTime - aTime;
        });

        return { success: true, tables: sortedTables };
    } catch (error: any) {
        console.error("Error fetching tables:", error);
        if (isPermissionError(error)) {
            return { success: false, error: permissionErrorMessage };
        }
        return { success: false, error: "Falha ao buscar as tabelas do usuário." };
    }
}

export async function createTable({ name, userId }: { name: string, userId: string }): Promise<{ success: boolean; table?: PropertyTable; error?: string; }> {
    if (!db || !auth) return { success: false, error: firebaseNotInitializedError };
    if (!userId) return { success: false, error: "Usuário não autenticado." };
    if (!name) return { success: false, error: "O nome da tabela é obrigatório." };
    try {
        const newTableData = {
            name,
            userId: userId,
            properties: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(userTablesCollection(userId), newTableData);
        const createdTableDoc = await getDoc(docRef);
        const createdTable = { id: createdTableDoc.id, ...createdTableDoc.data() } as PropertyTable;

        return { success: true, table: createdTable };
    } catch (error: any) {
        console.error("Error creating table:", error);
         if (isPermissionError(error)) {
            return { success: false, error: permissionErrorMessage };
        }
        return { success: false, error: "Falha ao criar a nova tabela." };
    }
}

export async function savePropertiesToTable({ tableId, properties, userId }: { tableId: string, properties: Property[], userId: string }): Promise<{ success: boolean; error?: string; }> {
    if (!db || !auth) return { success: false, error: firebaseNotInitializedError };
    if (!userId) return { success: false, error: "Usuário não autenticado." };
    try {
        const tableRef = doc(db, 'users', userId, 'tables', tableId);
        
        await updateDoc(tableRef, {
            properties: JSON.parse(JSON.stringify(properties)),
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error saving properties:", error);
         if (isPermissionError(error)) {
            return { success: false, error: permissionErrorMessage };
        }
        return { success: false, error: "Falha ao salvar as alterações na tabela." };
    }
}

export async function renameTable({ tableId, newName, userId }: { tableId: string, newName: string, userId: string }): Promise<{ success: boolean; error?: string; }> {
    if (!db || !auth) return { success: false, error: firebaseNotInitializedError };
    if (!userId) return { success: false, error: "Usuário não autenticado." };
    if (!newName) return { success: false, error: "O novo nome da tabela é obrigatório." };
    try {
        const tableRef = doc(db, 'users', userId, 'tables', tableId);
        await updateDoc(tableRef, { name: newName, updatedAt: serverTimestamp() });
        return { success: true };
    } catch (error: any) {
        console.error("Error renaming table:", error);
         if (isPermissionError(error)) {
            return { success: false, error: permissionErrorMessage };
        }
        return { success: false, error: "Falha ao renomear a tabela." };
    }
}

export async function deleteTable({ tableId, userId }: { tableId: string, userId: string }): Promise<{ success: boolean; error?: string; }> {
    if (!db || !auth) return { success: false, error: firebaseNotInitializedError };
    if (!userId) return { success: false, error: "Usuário não autenticado." };
    try {
        const tableRef = doc(db, 'users', userId, 'tables', tableId);
        await deleteDoc(tableRef);
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting table:", error);
         if (isPermissionError(error)) {
            return { success: false, error: permissionErrorMessage };
        }
        return { success: false, error: "Falha ao excluir a tabela." };
    }
}


// --- Sharing Logic Rework ---
export async function createShareLink(properties: Property[]): Promise<{ success: boolean; shareId?: string; error?: string }> {
    if (!db || !auth) return { success: false, error: firebaseNotInitializedError };
    try {
        const docRef = await addDoc(collection(db, "shared_lists"), {
            properties: JSON.parse(JSON.stringify(properties)),
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
