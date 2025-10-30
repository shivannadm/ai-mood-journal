// src/config/firebaseConfig.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with YOUR Firebase config
const firebaseConfig = {
    apiKey: "",
    authDomain: "ai-mood-journal-app.firebaseapp.com",
    projectId: "ai-mood-journal-app",
    storageBucket: "ai-mood-journal-app.firebasestorage.app",
    messagingSenderId: "1050742242581",
    appId: "1:1050742242581:web:10",
    measurementId: "G-2QWW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;