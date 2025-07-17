import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: This is a sample configuration.
// Replace this with your own Firebase configuration from your project's settings.
const firebaseConfig = {
  apiKey: "AIzaSyAYZio3LuQi0i0I0AxTfnS7BGOY4t-soVw",
  authDomain: "college-compass-lqime.firebaseapp.com",
  projectId: "college-compass-lqime",
  storageBucket: "college-compass-lqime.appspot.com",
  messagingSenderId: "128485548495",
  appId: "1:128485548495:web:efc25e68e529496c6432ba"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// We only export the config and the db instance now.
// The main app instance for auth will be handled in the context.
export { db };
export default firebaseConfig;
