import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDIeqOZn9lvvEBHuAlX5y_C_Y7zhffU8jw",
  authDomain: "gen-lang-client-0009045123.firebaseapp.com",
  projectId: "gen-lang-client-0009045123",
  storageBucket: "gen-lang-client-0009045123.firebasestorage.app",
  messagingSenderId: "809402934219",
  appId: "1:809402934219:web:88e8611abdceea69260c4e",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-ba00abe5-9149-42bf-960d-14c71c2a155d");
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Critical verification check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

testConnection();

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  const authUser = auth.currentUser;
  const errorInfo: FirestoreErrorInfo = {
    error: error.message || 'Unknown Firestore error',
    operationType: operation,
    path,
    authInfo: {
      userId: authUser?.uid || 'unauthenticated',
      email: authUser?.email || 'N/A',
      emailVerified: authUser?.emailVerified || false,
      isAnonymous: authUser?.isAnonymous || false,
      providerInfo: authUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || ''
      })) || []
    }
  };
  
  throw new Error(JSON.stringify(errorInfo));
}
