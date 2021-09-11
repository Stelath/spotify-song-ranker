import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGwfcIRXmtojZ0khW24JR2mY56a689j3Q",
  authDomain: "xc-playlist.firebaseapp.com",
  projectId: "xc-playlist",
  storageBucket: "xc-playlist.appspot.com",
  messagingSenderId: "205350291811",
  appId: "1:205350291811:web:d59314cd2faf68ba882b56"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Export the app
export default firebaseApp;