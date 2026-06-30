// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyCH70NtQj4o_3cAZPFG-v_Kqs6SDqWBjBc",
    authDomain: "tippspiel-kickturnier.firebaseapp.com",
    projectId: "tippspiel-kickturnier",
    storageBucket: "tippspiel-kickturnier.firebasestorage.app",
    messagingSenderId: "1006490909522",
    appId: "1:1006490909522:web:8bd455874f2c852c72d88b"
};

// Firebase starten
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// global verfügbar machen
window.db = db;
