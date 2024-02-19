// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyD6mWpK5bAjSnVi6Lw2W_F_4VwKHkDFLQY",
authDomain: "ka-halaman-3b22e.firebaseapp.com",
projectId: "ka-halaman-3b22e",
storageBucket: "ka-halaman-3b22e.appspot.com",
messagingSenderId: "510914307696",
appId: "1:510914307696:web:fd7d4bd893661da356f6b5",
measurementId: "G-4Y9GN29782"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
