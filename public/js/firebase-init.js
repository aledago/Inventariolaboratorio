// firebase-init.js
const firebaseConfig = {
    apiKey: "AIzaSyDjXP6cMEnIJZQdSwz7KE9UVGS65L3p1-I",
    authDomain: "inventario-lab-rainerum.firebaseapp.com",
    projectId: "inventario-lab-rainerum",
    storageBucket: "inventario-lab-rainerum.firebasestorage.app",
    messagingSenderId: "1089947549262",
    appId: "1:1089947549262:web:1d02f48d03cada06994d1f"
};

// Inizializza Firebase se non già fatto
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = (typeof firebase.firestore === 'function') ? firebase.firestore() : null;
const auth = firebase.auth();

// Esponi per gli altri script
window.db = db;
window.auth = auth;
