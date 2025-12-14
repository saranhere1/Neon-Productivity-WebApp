import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, Auth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
const provider = new GoogleAuthProvider();

export const isFirebaseInitialized = () => !!app;

export const initializeFirebase = (config: any): boolean => {
  try {
    if (app) return true; // Already initialized
    app = initializeApp(config);
    auth = getAuth(app);
    return true;
  } catch (error) {
    console.error("Firebase Init Error", error);
    return false;
  }
};

export const loginWithGoogle = async () => {
  if (!auth) throw new Error("Firebase not initialized");
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logoutFirebase = async () => {
  if (!auth) return;
  await firebaseSignOut(auth);
};

export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};