// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
// IMPORTANT: For production, configure these in environment variables
// Create a .env.local file with these values:
/*
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
*/

/**
 * Firebase configuration using environment variables
 * Environment variables must be prefixed with NEXT_PUBLIC_ to be available in the browser
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

// Fallback config only for development - DO NOT USE IN PRODUCTION
const devFallbackConfig: FirebaseOptions = {
  apiKey: "AIzaSyB-1zPYDO0vrHne8qQIalkd8MxhuBLxVWY",
  authDomain: "parenting-pathways.firebaseapp.com",
  projectId: "parenting-pathways",
  storageBucket: "parenting-pathways.appspot.com", // Fixed correct format
  messagingSenderId: "815770438418",
  appId: "1:815770438418:web:9635282aae4ba32dec41cb"
};

// Check if all required Firebase config values are available
const isFirebaseConfigValid = Object.values(firebaseConfig).every(value => 
  value !== undefined && value !== null && value !== ''
);

// Use environment variables if available, otherwise use fallback config
// For production builds, we temporarily allow fallback config for testing
const config = isFirebaseConfigValid
  ? firebaseConfig 
  : devFallbackConfig;

if (process.env.NODE_ENV === 'development' && !isFirebaseConfigValid) {
  console.warn('SECURITY WARNING: Using fallback Firebase config. Set environment variables for better security.');
}

if (process.env.NODE_ENV === 'production' && !isFirebaseConfigValid) {
  console.warn('WARNING: Using fallback Firebase config in production for testing. Use environment variables in actual production.');
}

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(config);
} else {
  app = getApp();
}

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Enable Firestore persistence for offline capability
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence could not be enabled. Multiple tabs open.');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence is not available in this browser');
      }
    });
}

// Connect to emulators in development if NEXT_PUBLIC_USE_FIREBASE_EMULATORS is set
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  // Use localhost with default emulator ports
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  
  console.log('Connected to Firebase emulators');
}

// Rate limiting helper for Firebase operations
export const createRateLimiter = (operationsPerMinute = 100) => {
  const requests: number[] = [];
  const interval = 60 * 1000; // 1 minute in milliseconds
  
  return async <T>(operation: () => Promise<T>): Promise<T> => {
    const now = Date.now();
    // Remove entries older than the interval
    while (requests.length > 0 && requests[0] < now - interval) {
      requests.shift();
    }
    
    if (requests.length >= operationsPerMinute) {
      throw new Error(`Rate limit exceeded. Max ${operationsPerMinute} operations per minute.`);
    }
    
    requests.push(now);
    return operation();
  };
};

export { db, auth, storage, functions, app };

