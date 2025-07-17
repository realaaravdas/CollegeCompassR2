import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAYZio3LuQi0i0I0AxTfnS7BGOY4t-soVw",
  authDomain: "college-compass-lqime.firebaseapp.com",
  projectId: "college-compass-lqime",
  storageBucket: "college-compass-lqime.appspot.com",
  messagingSenderId: "128485548495",
  appId: "1:128485548495:web:efc25e68e529496c6432ba"
};

// This pattern is robust and ensures a single initialization.
const app = !getApps().length ? initializeApp(firebaseConfig as FirebaseOptions) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);

// Export the initialized services
export { db, auth };
export default firebaseConfig;
