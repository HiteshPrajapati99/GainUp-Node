import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyALZMiMTerA4FLbELdG2yFBxCv096uO6cU",
  authDomain: "gainup-62e81.firebaseapp.com",
  projectId: "gainup-62e81",
  storageBucket: "gainup-62e81.appspot.com",
  messagingSenderId: "850064513182",
  appId: "1:850064513182:web:b3e73f679561bb9066038f",
  measurementId: "G-S7P1SP67X2",
};

const app = initializeApp(firebaseConfig);

export const fireBaseDB = getFirestore(app);
