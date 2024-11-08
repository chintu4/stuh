// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import firebase from "firebase/compat/app";
import "firebase/compat/auth";

import { GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMzOT-kBIv5GQM4iiWnL9jXMFJ-C5vBJk",
  authDomain: "proto-27bbd.firebaseapp.com",
  projectId: "proto-27bbd",
  storageBucket: "proto-27bbd.firebasestorage.app",
  messagingSenderId: "1092665554209",
  appId: "1:1092665554209:web:58ca69f4cf8899ab187a60"
};

// Initialize Firebase

const Kpp = initializeApp(firebaseConfig);
const auth = getAuth(Kpp);
const firestore = getFirestore(Kpp);
const provider = new GoogleAuthProvider();

// export { getAuth as getAuth2 };
export { auth, firestore, provider,Kpp };

// const signInWithGoogle = async () => {
//   try {
//     const result = await signInWithPopup(auth, provider);
//     const user = result.user;
//     const userRef = doc(firestore, 'users', user.uid); // Create or get user document

//     // Check if the user already exists in Firestore
//     const userDoc = await getDoc(userRef);
//     if (!userDoc.exists()) {
//       // If user doesn't exist, create a new document with user data
//       await setDoc(userRef, {
//         name: user.displayName,
//         email: user.email,
//         uid: user.uid,
//         photoURL: user.photoURL,
//       });
//     }

//     console.log('User signed in and data saved:', user);
//   } catch (error) {
//     console.error('Error signing in with Google:', error);
//   }
// };

// export { auth, firestore, signInWithGoogle };