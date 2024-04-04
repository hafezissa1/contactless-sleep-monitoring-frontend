import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

const emailLoginBtn = document.getElementById('email-login-btn');
const signupBtn = document.getElementById('signup-btn');

// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyDVsMTk_uP5OGUjUTFwPgyYH2_80GbZkvY",
    authDomain: "undercover-vitals.firebaseapp.com",
    projectId: "undercover-vitals",
    storageBucket: "undercover-vitals.appspot.com",
    messagingSenderId: "496410237161",
    appId: "1:496410237161:web:215af8d9ad1bd72c3af878"
};

initializeApp(firebaseConfig);
const auth = getAuth();
console.log(auth);

// Login function
function login() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = "heart-rate-chart.html";
        })
        .catch((error) => {
            alert(error.message);
        });
}

// Signup function
function signup() {
    var email = document.getElementById("email-signup").value;
    var password = document.getElementById("password-signup").value;

    createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
            window.location.href = "heart-rate-chart.html";
        })
        .catch((error) => {
            alert(error.message);
        });
}

emailLoginBtn.addEventListener('click', () => {
    login();
  });
  
  signupBtn.addEventListener('click', () => {
    signup();
  });
  
