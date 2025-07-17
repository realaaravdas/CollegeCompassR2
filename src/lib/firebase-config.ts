import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Replace this with your own Firebase configuration
// from the Firebase console.
const firebaseConfig = {
  apiKey: "AIzaSyAYZio3LuQi0i0I0AxTfnS7BGOY4t-soVw",
  authDomain: "college-compass-lqime.firebaseapp.com",
  projectId: "college-compass-lqime",
  storageBucket: "college-compass-lqime.firebasestorage.app",
  messagingSenderId: "128485548495",
  appId: "1:128485548495:web:efc25e68e529496c6432ba"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
export default app;



