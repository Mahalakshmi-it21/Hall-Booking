import { auth, firestore } from "../firebase"; 
import { signInWithPopup, signInWithEmailAndPassword, GoogleAuthProvider, signOut, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getDocs, collection, query, where } from "firebase/firestore"; 
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" }); // ✅ Forces account selection

export const googleSignIn = async () => {
  try {
    await setPersistence(auth, browserSessionPersistence); // ✅ Ensures session is per tab
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userEmail = user.email;

    console.log("✅ Google Sign-In User Data:", user);

    if (!userEmail.endsWith("@bitsathy.ac.in")) {
      console.error("❌ Unauthorized domain:", userEmail);
      await signOut(auth);
      toast.error("Only BitSathy domain users can sign in!");
      return null; 
    }

    return {
      name: user.displayName || "No Name",
      email: user.email,
      photoURL: user.photoURL || "",
    };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    toast.error("Google Sign-In Failed! Please try again.");
    return null;
  }
};

export const googleSignOut = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Google Sign-Out Error:", error);
  }
};

export const adminSignIn = async (email, password) => {
  try {
    console.log("🔹 Attempting Admin Login with:", email);
    await setPersistence(auth, browserSessionPersistence); // ✅ Ensures session is per tab

    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    console.log("✅ Firebase Auth successful:", user.email);
    const adminRef = collection(firestore, "admin_lib");
    const q = query(adminRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const adminData = querySnapshot.docs[0].data();
      if (adminData.role === "admin") {
        console.log("✅ Admin login successful");
        return { email: user.email, role: "admin" };
      } else {
        console.error("❌ User exists but is not an admin");
      }
    } else {
      console.error("❌ No admin record found in Firestore!");
    }

    return null;
  } catch (error) {
    console.error("❌ Admin Login Error:", error.message);
    return null;
  }
};

export const adminSignOut = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("admin");
  } catch (error) {
    console.error("Admin Logout Error:", error);
  }
};
