 // Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCOR_8PBujHBezTN5lUkxxL5Tp1M7DZYrU",
    authDomain: "ka-halaman-v2.firebaseapp.com",
    projectId: "ka-halaman-v2",
    storageBucket: "ka-halaman-v2.appspot.com",
    messagingSenderId: "151530126571",
    appId: "1:151530126571:web:e8eca6af0a77e2a89d12ae",
    measurementId: "G-ZPT4DX4H9D"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Database
const db = firebase.firestore();

const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);

const userId = "5hjwe1KLm9lDX1mDsrY9";
const cropId = "APSwuEOr095VYonRRR1q";
const cropRef = db.collection("users").doc(userId).collection("crops").doc(cropId);


