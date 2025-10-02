/*Ali, youtube tutorials were used for opening and closing functions of the MODAL. 
            "Build a Popup With JavaScript": https://www.youtube.com/watch?v=MBaw_6cPmAw&t=300s&ab_channel=WebDevSimplified
            "How to Make A Popup...": https://www.youtube.com/watch?v=AF6vGYIyV8M&ab_channel=GreatStack */

/* For Google Firebase, email and password authentication was implemented with this youtube tutorial:
   https://www.youtube.com/watch?v=WM178YopjfI */
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
    import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
    
    const firebaseConfig = {
        apiKey: "AIzaSyCZPyRZ9yzEARK1iHNnDz9E-lnnfhF2esc",
        authDomain: "task-manager-2d534.firebaseapp.com",
        projectId: "task-manager-2d534",
        storageBucket: "task-manager-2d534.firebasestorage.app",
        messagingSenderId: "38793812705",
        appId: "1:38793812705:web:b3bbd5f7faf96f816675a0",
        measurementId: "G-NE30PTQEC9"
    }

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    document.addEventListener('DOMContentLoaded', function () {
    const openButton = document.querySelector('.login-open-button');
    const closeButton = document.querySelector('.login-close');
    const modalOverlay = document.getElementById('login-modalOverlay');
    const loginContainer = document.getElementById('loginContainer');
    const loginForm = document.getElementById('login-form');
    const EYE = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>';
    const EYEOFF = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>';
    const loginOverlay = document.getElementById('login-modalOverlay');

    loginOverlay.addEventListener('click', function(e) {
        // Used this youtube tutorial: https://www.youtube.com/watch?v=sVBRJ-0AzXw&t=99s&ab_channel=TylerPotts
        // and ChatGPT to write the logic of this password toggle function. 
        const btn = e.target.closest('.toggle-password');
        if (!btn) return;

        const inputId = btn.getAttribute('data-target');
        const input = document.getElementById(inputId);
        if (!input) return;

        const showing = input.type === 'password';
        input.type = showing ? 'text' : 'password';

        btn.innerHTML = showing ? EYE : EYEOFF;
        
        btn.dataset.showing = String(showing);
        btn.setAttribute('aria-pressed', String(showing));
        btn.setAttribute('aria-label', showing ? 'Hide password' : 'Show password');
    });

    function openModal() {
        modalOverlay.style.display = 'flex';
        loginContainer.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        loginContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    window.openLoginModal = openModal;
    window.closeLoginModal = closeModal;

    openButton?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    closeButton?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });

    /* Our event listener was different than what was shown in the Firebase youtube tutorial,
    so we used ChatGPT for enacting the code below (login form event listener) */
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        alert('Login form submitted') // testing...

        const email = document.getElementById('email').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            alert("Logged In!");
            closeModal();
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        }
    });

});