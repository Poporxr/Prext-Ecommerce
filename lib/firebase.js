// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUj0gQs0rojY_W1MkJc8jqVHqyGLCWjR0",
  authDomain: "prext-ecommerce.firebaseapp.com",
  projectId: "prext-ecommerce",
  storageBucket: "prext-ecommerce.firebasestorage.app",
  messagingSenderId: "286272977916",
  appId: "1:286272977916:web:ab1df5b59bffe6e8f55079",
  measurementId: "G-B7FRQM0E7Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };