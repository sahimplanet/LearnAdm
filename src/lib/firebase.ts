import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || "AIzaSyASq1lFtDSmV4OkLZbuejxp6YYCHPCJEJU",
  authDomain: firebaseConfigJson.authDomain || "learnadm-2d781.firebaseapp.com",
  projectId: firebaseConfigJson.projectId || "learnadm-2d781",
  storageBucket: firebaseConfigJson.storageBucket || "learnadm-2d781.firebasestorage.app",
  messagingSenderId: firebaseConfigJson.messagingSenderId || "711395532021",
  appId: firebaseConfigJson.appId || "1:711395532021:web:f7c91bb6b1ee39153af9bc",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfigJson.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Custom ActionCodeSettings for customized password reset and verification emails
export const getActionCodeSettings = () => ({
  url: typeof window !== "undefined" ? window.location.origin : "https://learnadm-2d781.firebaseapp.com",
  handleCodeInApp: true,
});

// Initialize Analytics safely
export let analytics: any = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Firebase Analytics is not supported in this environment:", err);
  });
}

