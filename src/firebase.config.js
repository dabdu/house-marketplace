// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBC4MQMtZThyUGGUHn4xBVI0TQrbc-p91M",
    authDomain: "house-marketplace-b3077.firebaseapp.com",
    projectId: "house-marketplace-b3077",
    storageBucket: "house-marketplace-b3077.appspot.com",
    messagingSenderId: "704483464404",
    appId: "1:704483464404:web:ff0871cd6f810c7d0d5741",
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();