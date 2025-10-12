// src/firebase.js
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    OAuthProvider
} from 'firebase/auth';

// Cole aqui as configurações do Firebase Console
const firebaseConfig = {
    apiKey: "cole-sua-api-key-aqui",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "seu-app-id"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta a autenticação e os providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');