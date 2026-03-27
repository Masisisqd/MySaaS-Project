// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "localhost",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "botswana-holding",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp {
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;

export function getFirebaseAuth(): Auth {
    if (!_auth) {
        _auth = getAuth(getFirebaseApp());
        if (typeof window !== "undefined" && window.location.hostname === "localhost") {
            connectAuthEmulator(_auth, "http://localhost:9099");
        }
    }
    return _auth;
}

export function getFirebaseDb(): Firestore {
    if (!_db) {
        _db = getFirestore(getFirebaseApp());
        if (typeof window !== "undefined" && window.location.hostname === "localhost") {
            connectFirestoreEmulator(_db, "localhost", 8080);
        }
    }
    return _db;
}

export function getFirebaseFunctions() {
    const functions = getFunctions(getFirebaseApp());
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
        connectFunctionsEmulator(functions, "localhost", 5001);
    }
    return functions;
}

export function getFirebaseStorage(): FirebaseStorage {
    if (!_storage) {
        _storage = getStorage(getFirebaseApp());
        // Storage emulator not explicitly requested but good practice
    }
    return _storage;
}

export const auth = typeof window !== "undefined" ? getFirebaseAuth() : (undefined as unknown as Auth);
export const db = typeof window !== "undefined" ? getFirebaseDb() : (undefined as unknown as Firestore);
export const storage = typeof window !== "undefined" ? getFirebaseStorage() : (undefined as unknown as FirebaseStorage);
