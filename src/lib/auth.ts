/**
 * Authentication and Authorization utilities
 */
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp, 
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { AuthError, PermissionDeniedError } from "./errors";

// User roles for role-based access control (RBAC)
export enum UserRole {
  USER = 'user',
  EDITOR = 'editor',
  ADMIN = 'admin'
}

// Define the enhanced user type with roles and permissions
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  hasVerifiedEmail: boolean;
  lastLoginAt: Date | null;
  createdAt: Date | null;
}

/**
 * Permission checker for actions
 */
export const Permissions = {
  // Program permissions
  canViewPrograms: (user: AuthUser | null) => !!user,
  canCreateProgram: (user: AuthUser | null) => 
    !!user && (user.role === UserRole.ADMIN || user.role === UserRole.EDITOR),
  canEditProgram: (user: AuthUser | null) => 
    !!user && (user.role === UserRole.ADMIN || user.role === UserRole.EDITOR),
  canDeleteProgram: (user: AuthUser | null) => 
    !!user && user.role === UserRole.ADMIN,
  
  // User management permissions
  canViewUsers: (user: AuthUser | null) => 
    !!user && user.role === UserRole.ADMIN,
  canEditUsers: (user: AuthUser | null) => 
    !!user && user.role === UserRole.ADMIN,
    
  // Generic access check for any permission
  check: (user: AuthUser | null, permission: (user: AuthUser | null) => boolean, resourceId?: string) => {
    if (!permission(user)) {
      throw new PermissionDeniedError(`You don't have permission to perform this action`);
    }
    return true;
  }
};

/**
 * Authenticate a user with email and password
 * @param email User email
 * @param password User password
 * @returns Promise with authenticated user
 * @throws AuthError if authentication fails
 */
export async function signIn(email: string, password: string): Promise<AuthUser> {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return await getUserWithRole(userCredential.user);
  } catch (error: any) {
    throw new AuthError(`Authentication failed: ${error.message}`, 'AUTH_SIGNIN_ERROR');
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const auth = getAuth();
  return firebaseSignOut(auth);
}

/**
 * Get the currently authenticated user with their role
 * @returns Promise with the authenticated user or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  return new Promise((resolve) => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        resolve(await getUserWithRole(user));
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Helper function to get user role from Firestore
 * @param user Firebase user
 * @returns Promise with enhanced user with role
 */
async function getUserWithRole(user: FirebaseUser): Promise<AuthUser> {
  try {
    // Check if user exists in our users collection
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      // Update last login time
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userData.role || UserRole.USER,
        hasVerifiedEmail: user.emailVerified,
        lastLoginAt: userData.lastLoginAt ? new Date((userData.lastLoginAt as Timestamp).toMillis()) : new Date(),
        createdAt: userData.createdAt ? new Date((userData.createdAt as Timestamp).toMillis()) : null
      };
    } else {
      // First-time user, create a user record with default role
      const newUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: UserRole.USER,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      
      await setDoc(userRef, newUser);
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: UserRole.USER,
        hasVerifiedEmail: user.emailVerified,
        lastLoginAt: new Date(),
        createdAt: new Date()
      };
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    // Fallback to basic user role
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: UserRole.USER,
      hasVerifiedEmail: user.emailVerified,
      lastLoginAt: null,
      createdAt: null
    };
  }
}

/**
 * Authorization middleware - verifies user has required permission
 * @param requiredPermission Function that checks if user has required permission
 * @returns A wrapped function that verifies permission before executing the handler
 */
export function withAuth<T>(
  handler: (currentUser: AuthUser, ...args: any[]) => Promise<T>,
  requiredPermission: (user: AuthUser | null) => boolean
): (...args: any[]) => Promise<T> {
  return async (...args: any[]): Promise<T> => {
    const currentUser = await getCurrentUser();
    
    // Check if user has required permission
    if (!requiredPermission(currentUser)) {
      throw new PermissionDeniedError('You do not have permission to perform this action');
    }
    
    return handler(currentUser as AuthUser, ...args);
  };
} 