import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "fir-chat-a713b.firebaseapp.com",
    projectId: "fir-chat-a713b",
    storageBucket: "fir-chat-a713b.appspot.com",
    messagingSenderId: "376938086908",
    appId: "1:376938086908:web:7ee8bd198d615d67c93279",
    measurementId: "G-XRB1YSVB4N",
};

initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
