// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy initialization to prevent Firebase from crashing during
// Next.js static pre-rendering (no env vars at build time).
function getFirebaseApp(): FirebaseApp {
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;

export function getFirebaseAuth(): Auth {
    if (!_auth) _auth = getAuth(getFirebaseApp());
    return _auth;
}

export function getFirebaseDb(): Firestore {
    if (!_db) _db = getFirestore(getFirebaseApp());
    return _db;
}

export function getFirebaseStorage(): FirebaseStorage {
    if (!_storage) _storage = getStorage(getFirebaseApp());
    return _storage;
}

// Convenience aliases – these will be undefined on the server during
// build but safe to use inside "use client" components at runtime.
export const auth = typeof window !== "undefined" ? getFirebaseAuth() : (undefined as unknown as Auth);
export const db = typeof window !== "undefined" ? getFirebaseDb() : (undefined as unknown as Firestore);
export const storage = typeof window !== "undefined" ? getFirebaseStorage() : (undefined as unknown as FirebaseStorage);
