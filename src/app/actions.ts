'use server';

import { auth, db, firebaseError } from '@/lib/firebase';
import { type Property, type OcrInput, OcrInputSchema, type UserCredentials } from '@/types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { headers } from 'next/headers';
import { extractTextFromDocument } from '@/ai/flows/extract-property-details';

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

export async function createShareLink(userId: string, properties: Property[], listName: string): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!userId) {
        return { success: false, error: 'Você precisa estar autenticado para compartilhar.' };
    }

    if (!db) {
        return { success: false, error: 'O serviço de banco de dados não está disponível.' };
    }

    try {
        const cleanedProperties = JSON.parse(JSON.stringify(properties));

        const docRef = await addDoc(collection(db, 'shared_lists'), {
            userId: userId,
            name: listName.trim(),
            properties: cleanedProperties,
            createdAt: serverTimestamp(),
        });

        const host = headers().get('host');
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;
        const shareUrl = `${baseUrl}/share/${docRef.id}`;
        
        return { success: true, url: shareUrl };

    } catch (error: any) {
        console.error("Error creating share link:", error);
        let errorMessage = 'Não foi possível criar o link de compartilhamento.';
        if (error.code === 'permission-denied') {
            errorMessage = 'Erro de permissão no banco de dados. Verifique as Regras de Segurança do Firestore e se você está logado.';
        }
        return { success: false, error: errorMessage };
    }
}
