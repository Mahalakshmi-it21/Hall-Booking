import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyBWgbkoyedBqJuNun3jJdc_k94eFIAZLKQ",
  authDomain: "lib-hall-booking.firebaseapp.com",
  projectId: "lib-hall-booking",
  storageBucket: "lib-hall-booking.firebasestorage.app",
  messagingSenderId: "619260907014",
  appId: "1:619260907014:web:8526ff6bcabebfc7413d87",
  measurementId: "G-LGL1PRF25J"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  
const firestore = getFirestore(app);

// ✅ Set session persistence to per-tab mode
setPersistence(auth, browserSessionPersistence)
  .then(() => console.log("✅ Firebase session set to per-tab"))
  .catch((error) => console.error("❌ Error setting persistence:", error));

export { app, auth, firestore };
