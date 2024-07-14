// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics"; // Remove this line

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrxWNYNOIfL0w-gUnjc5OWbU0RdWuFZT4",
  authDomain: "workler-70bfa.firebaseapp.com",
  projectId: "workler-70bfa",
  storageBucket: "workler-70bfa.appspot.com",
  messagingSenderId: "1058801765988",
  appId: "1:1058801765988:web:3fc110ab3907ccf74c5971",
  measurementId: "G-5DX5DPY059"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Remove or comment out this line

// Initialize Firebase Storage and create a storage reference
const storage = getStorage(app);

export { storage };
