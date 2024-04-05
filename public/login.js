import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

const loginBtn = document.getElementById('login-btn');
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
    var email = document.getElementById("email-text").value;
    var password = document.getElementById("password-text").value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log(userCredential.user);
            console.log(userCredential.user.uid);

            sessionStorage.setItem('uid', userCredential.user.uid);

            window.location.href = "data.html";
        })
}

function signup() {
    window.location.href = "signup.html";
}

loginBtn.addEventListener('click', () => {
    console.log("Login");
    login();
});
  
signupBtn.addEventListener('click', () => {
    console.log("Sign Up");
    signup();
});
  
