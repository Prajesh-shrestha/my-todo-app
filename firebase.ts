import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIspLcDl-btR_o2yMq72OEXn7uJhUy8kY",
  authDomain: "my-todo-app-4478c.firebaseapp.com",
  projectId: "my-todo-app-4478c",
  storageBucket: "my-todo-app-4478c.firebasestorage.app",
  messagingSenderId: "665617054899",
  appId: "1:665617054899:web:a10320733a22c3858084c6",
  measurementId: "G-T0KYLQ3SDF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);