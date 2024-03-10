 // Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//     apiKey: "AIzaSyCOR_8PBujHBezTN5lUkxxL5Tp1M7DZYrU",
//     authDomain: "ka-halaman-v2.firebaseapp.com",
//     projectId: "ka-halaman-v2",
//     storageBucket: "ka-halaman-v2.appspot.com",
//     messagingSenderId: "151530126571",
//     appId: "1:151530126571:web:e8eca6af0a77e2a89d12ae",
//     measurementId: "G-ZPT4DX4H9D"
// };

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCotzSrU7iRJV685q8uceW5kve4kYGkhWA",
    authDomain: "ka-halaman-505b5.firebaseapp.com",
    projectId: "ka-halaman-505b5",
    storageBucket: "ka-halaman-505b5.appspot.com",
    messagingSenderId: "310047835427",
    appId: "1:310047835427:web:face5a3286c95b10ed3896"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);

// Initialize Firebase Storage
const storage = firebase.storage();


// Initialize Firebase
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();
let cropId = "";
let journalId = "";

// const cropRef = db.collection("users").doc(userId).collection("crops").doc(cropId);
// const cropRef = db.collection("crops");

