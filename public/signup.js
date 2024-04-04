import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

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
    window.location.href = "index.html";
}

function signup() {
    var name = document.getElementById("name-text").value;
    var email = document.getElementById("email-text").value;
    var password = document.getElementById("password-text").value;

    console.log(name, email, password);

    createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
            window.location.href = "heart-rate-chart.html";
        })
        .catch((error) => {
            alert(error.message);
        });
}

loginBtn.addEventListener('click', () => {
    console.log("Login");
    login();
  });
  
signupBtn.addEventListener('click', () => {
    console.log("Sign Up");
    signup();
  });
  
