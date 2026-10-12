import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyB62uaczLCbnK1hALtcWTIGj25_HgzH2e0",
  authDomain: "poultryhub-5242a.firebaseapp.com",
  databaseURL: "https://poultryhub-5242a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "poultryhub-5242a",
  storageBucket: "poultryhub-5242a.firebasestorage.app",
  messagingSenderId: "383252048092",
  appId: "1:383252048092:web:fe486aac6edad92d1d2c19"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);