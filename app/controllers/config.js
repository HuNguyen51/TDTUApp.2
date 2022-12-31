// Import the functions you need from the SDKs you need
var { initializeApp } = require("firebase/app");
var { getFirestore } = require("firebase/firestore");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnTC-Nf3pU1Q6Sp8cy4zYrGyig1HgrHaQ",
  authDomain: "tdtu-app-ab935.firebaseapp.com",
  databaseURL: "https://tdtu-app-ab935-default-rtdb.firebaseio.com",
  projectId: "tdtu-app-ab935",
  storageBucket: "tdtu-app-ab935.appspot.com",
  messagingSenderId: "403623297239",
  appId: "1:403623297239:web:227713017c20ee1a6df092",
  measurementId: "G-2VMSH693PM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

module.exports = db;

