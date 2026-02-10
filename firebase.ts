
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAgHWMJbe5Zl6HTvpU1KNzLxnKm-tCzKyo",
  authDomain: "classes-x.firebaseapp.com",
  projectId: "classes-x",
  storageBucket: "classes-x.firebasestorage.app",
  messagingSenderId: "857388590681",
  appId: "1:857388590681:web:aa395b1ac11b3c3e61f348"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rdb = getDatabase(app);
export default app;
