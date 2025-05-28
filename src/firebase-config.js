// في ملف firebase-config.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCTbHVsJQN6qiVrucCpzOPmnFlwUDFmu-g",
  authDomain: "discountfinder-1.firebaseapp.com",
  databaseURL: "https://discountfinder-1-default-rtdb.firebaseio.com",
  projectId: "discountfinder-1",
  storageBucket: "discountfinder-1.firebasestorage.app",
  messagingSenderId: "371075383253",
  appId: "1:371075383253:web:f0dfc1e4019dfe029e475c",
  measurementId: "G-TFY1221YN4",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };
