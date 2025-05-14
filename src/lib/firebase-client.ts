'use client';

import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

/**
 * Firebase configuration using environment variables
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Fallback config for development
const devFallbackConfig: FirebaseOptions = {
  apiKey: "AIzaSyB-1zPYDO0vrHne8qQIalkd8MxhuBLxVWY",
  authDomain: "parenting-pathways.firebaseapp.com",
  projectId: "parenting-pathways",
  storageBucket: "parenting-pathways.appspot.com",
  messagingSenderId: "815770438418",
  appId: "1:815770438418:web:9635282aae4ba32dec41cb"
};

// Check if config is valid
const isFirebaseConfigValid = Object.values(firebaseConfig).every(value => 
  value !== undefined && value !== null && value !== ''
);

// Use environment variables if available, otherwise use fallback
const config = isFirebaseConfigValid ? firebaseConfig : devFallbackConfig;

// Initialize Firebase
let app;
let db;
let auth;
let storage;
let functions;

try {
  // Initialize app
  if (!getApps().length) {
    app = initializeApp(config);
  } else {
    app = getApp();
  }

  // Initialize services
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  functions = getFunctions(app);

  // Enable offline persistence
  enableIndexedDbPersistence(db).catch(err => {
    console.warn('Firestore persistence could not be enabled:', err.code);
  });

  // Connect to emulators in development
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // In case of error, provide fallback objects
  app = null;
  db = null; 
  auth = null;
  storage = null;
  functions = null;
}

export { app, db, auth, storage, functions }; 