// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let firebaseError: string | null = null;

// We check for the presence of the key environment variables.
// This prevents the app from crashing and allows us to show a friendly error.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  firebaseError = "A chave de API do Firebase está faltando. Verifique se a variável NEXT_PUBLIC_FIREBASE_API_KEY está definida no seu arquivo .env ou nas configurações de ambiente da Vercel.";
} else {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (e: any) {
        console.error("Firebase initialization error:", e);
        firebaseError = "Ocorreu um erro ao inicializar o Firebase. Verifique se as chaves fornecidas no ambiente estão corretas.";
    }
}

export { app, auth, db, firebaseError };
