import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  

const firebaseConfig = {
  apiKey: "AIzaSyBcJRgIDHxFkE90vAlnypmWNGyi3cT0Nj0",
  authDomain: "gestion-reunion-ac3f5.firebaseapp.com",
  projectId: "gestion-reunion-ac3f5",
  storageBucket: "gestion-reunion-ac3f5.appspot.com",
  messagingSenderId: "592192766034",
  appId: "1:592192766034:web:c685e653383452a9ae5f8b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);  

export { auth, provider, db, storage };  
