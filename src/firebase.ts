import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebaseConfig from "../firebase-applet-config.json";

// 🔥 Auth imports
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseSignup,
  signOut
} from "firebase/auth";

// 🔥 Firestore
import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);

const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 🔥 Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// ✅ Google Login
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// ✅ Github Login
export const signInWithGithub = () => {
  return signInWithPopup(auth, githubProvider);
};

// ✅ Email Login
export const signInWithEmailAndPassword = (email: string, password: string) => {
  return firebaseSignIn(auth, email, password);
};

// ✅ Signup
export const createUserWithEmailAndPassword = (email: string, password: string) => {
  return firebaseSignup(auth, email, password);
};

// ✅ Logout
export const logOut = () => {
  return signOut(auth);
};

// ✅ Export core
export { auth, db, app, analytics };