import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCb08D2aD99msaBZ-BbEzsYSxsjzYkK1NY",
  authDomain: "slp-edu.firebaseapp.com",
  projectId: "slp-edu",
  storageBucket: "slp-edu.firebasestorage.app",
  messagingSenderId: "21468705859",
  appId: "1:21468705859:web:a3728a89866aa0483150f6",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);