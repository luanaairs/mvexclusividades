'use server';

import { auth, db, firebaseError } from '@/lib/firebase';
import { type Property, type OcrInput, OcrInputSchema } from '@/types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { headers } from 'next/headers';
import { extractTextFromDocument } from '@/ai/flows/extract-property-details';

// Helper function to remove undefined values from an object.
// Firestore cannot store `undefined`.
function cleanObject(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

export async function performOcr(input: OcrInput): Promise<{ success: boolean; data?: { text: string }; error?: string }> {
  const parsedInput = OcrInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return { success: false, error: 'Dados de entrada inválidos.' };
  }

  try {
    const output = await extractTextFromDocument(parsedInput.data);
    return { success: true, data: output };
  } catch (error: any) {
    console.error('OCR Error:', error);
    return { success: false, error: 'Falha ao extrair texto do documento.' };
  }
}

export async function createShareLink(properties: Property[], listName: string): Promise<{ success: boolean; id?: string; error?: string; }> {
  if (firebaseError || !auth || !db) {
    return { success: false, error: "O serviço de banco de dados não está configurado corretamente." };
  }

  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "Você precisa estar autenticado para compartilhar." };
  }

  try {
    const cleanedProperties = properties.map(p => cleanObject(p));

    const docRef = await addDoc(collection(db, "shared_lists"), {
      userId: user.uid,
      name: listName,
      properties: cleanedProperties,
      createdAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error creating share link:", error);
    if (error.code === 'permission-denied') {
        return { success: false, error: 'Erro de permissão no banco de dados. Verifique as Regras de Segurança do Firestore.' };
    }
    return { success: false, error: 'Ocorreu um erro ao criar o link de compartilhamento.' };
  }
}

export async function getBaseUrl() {
    const host = headers().get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    return `${protocol}://${host}`;
}
