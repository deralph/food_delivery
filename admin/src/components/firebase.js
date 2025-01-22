import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA35VGqCTVFVFnn2snlmVUPrp7NxoiZrm4",
  authDomain: "peer-to-peer-chat-ee638.firebaseapp.com",
  projectId: "peer-to-peer-chat-ee638",
  storageBucket: "peer-to-peer-chat-ee638.appspot.com",
  messagingSenderId: "538771472808",
  appId: "1:538771472808:web:8146eced2bc3615476dd9d",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { storage, db, auth };
