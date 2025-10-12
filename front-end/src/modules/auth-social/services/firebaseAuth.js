// src/modules/auth-social/services/firebaseAuth.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Configuração do Firebase (pode usar variáveis de ambiente)
const firebaseConfig = {
  apiKey: "AIzaSyD1LdsUhT7lrBQ4fEd6kHqD9U0Z3Wp88eQ",
  authDomain: "auth-firebase-65d96.firebaseapp.com",
  projectId: "auth-firebase-65d96",
  storageBucket: "auth-firebase-65d96.firebasestorage.app",
  messagingSenderId: "809513575477",
  appId: "1:809513575477:web:3b2a437079adbc57d1fd7c"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o serviço de autenticação
export const auth = getAuth(app);
