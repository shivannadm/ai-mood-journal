// src/config/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Get this from Firebase Console > Project Settings > Your apps > Firebase SDK snippet
const firebaseConfig = {
    apiKey: "",
    authDomain: "ai-mood-journal-app.firebaseapp.com",
    projectId: "ai-mood-journal-app",
    storageBucket: "ai-mood-journal-app.firebasestorage.app",
    messagingSenderId: "1050742242581",
    appId: "1:1050742242581:web:xxxxxxxxxxxxxxxxxxxx",
    measurementId: ""
};

// Initialize Firebase with error handling
let app;
let auth;
let db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('Please check your firebaseConfig values');

    // Create mock auth object to prevent crashes
    // This allows the app to load even if Firebase fails
    auth = {
        currentUser: null,
        onAuthStateChanged: (callback) => {
            callback(null);
            return () => { };
        }
    };

    db = null;
}

export { auth, db };
export default app;