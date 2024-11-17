// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

  apiKey: "AIzaSyDda_B8ofnCZlvPkUbB8Fzpeq9NYphGw4c",

  authDomain: "cyberxapi.firebaseapp.com",

  projectId: "cyberxapi",

  storageBucket: "cyberxapi.firebasestorage.app",

  messagingSenderId: "214114050522",

  appId: "1:214114050522:web:a82b561b053fdb773f20e3"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export {auth}

