import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBdsCzOFNpVKSwcQ1SdAulPuYwby_KeFpg",
    authDomain: "tif-social.firebaseapp.com",
    projectId: "tif-social",
    storageBucket: "tif-social.firebasestorage.app",
    messagingSenderId: "852033430946",
    appId: "1:852033430946:web:4b48c434427710db34befb",
    measurementId: "G-GTFD75TYMT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
