import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAGqqoYx-PbWOdF5EU-WUBAAxYpBm3G5W0",
  authDomain: "bus-tracking-system-7c4f3.firebaseapp.com",
  projectId: "bus-tracking-system-7c4f3",
  storageBucket: "bus-tracking-system-7c4f3.firebasestorage.app",
  messagingSenderId: "578966332646",
  appId: "1:578966332646:web:b9a7fc9fa52d2e5a984727",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);