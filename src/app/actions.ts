'use server';

import { extractTextFromDocument as ocrFlow } from "@/ai/flows/extract-property-details";
import { type OcrInput, type NewUser, type UserCredentials } from "@/types";
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export async function performOcr(input: OcrInput) {
    try {
        const result = await ocrFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error performing OCR:", error);
        return { success: false, error: "Falha ao extrair texto do documento. Verifique o arquivo e tente novamente." };
    }
}

export async function createUserAction(data: NewUser) {
    const { username, password, adminPassword } = data;

    if (!process.env.ADMIN_SECRET_KEY) {
        return { success: false, error: "A senha de administrador não está configurada no servidor." };
    }

    if (adminPassword !== process.env.ADMIN_SECRET_KEY) {
        return { success: false, error: "Senha de administrador inválida." };
    }
    
    if (!username || !password) {
        return { success: false, error: "Nome de usuário e senha são obrigatórios." };
    }

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return { success: false, error: "Este nome de usuário já existe." };
        }

        await addDoc(usersRef, { username, password });
        
        return { success: true };

    } catch (error) {
        console.error("Error creating user in Firestore:", error);
        return { success: false, error: "Ocorreu um erro no servidor ao criar o usuário." };
    }
}

export async function loginAction(credentials: UserCredentials) {
    const { username, password } = credentials;

    if (!username || !password) {
        return { success: false, error: "Nome de usuário e senha são obrigatórios." };
    }

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username), where("password", "==", password));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, error: "Nome de usuário ou senha inválidos." };
        }

        const userDoc = querySnapshot.docs[0];
        const user = { username: userDoc.data().username };
        
        return { success: true, user };

    } catch (error) {
        console.error("Error during login:", error);
        return { success: false, error: "Ocorreu um erro no servidor durante o login." };
    }
}
