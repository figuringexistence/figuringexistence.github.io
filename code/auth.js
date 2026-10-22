import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

let currentAuthMode = 'login';
export let currentUser = null;

export function initAuth(onUserLoggedIn, onUserLoggedOut) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            onUserLoggedIn(user);
        } else {
            currentUser = null;
            onUserLoggedOut();
        }
    });
}

window.switchAuthTab = function(mode) {
    currentAuthMode = mode;
    const btnLogin = document.getElementById('tab-login');
    const btnRegister = document.getElementById('tab-register');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (mode === 'login') {
        btnLogin.className = "flex-1 py-2 text-sm font-medium rounded-lg transition-all bg-gemini-surface text-white shadow-sm";
        btnRegister.className = "flex-1 py-2 text-sm font-medium rounded-lg transition-all text-gray-400 hover:text-white";
        submitBtn.innerText = "Masuk Sekarang";
    } else {
        btnRegister.className = "flex-1 py-2 text-sm font-medium rounded-lg transition-all bg-gemini-surface text-white shadow-sm";
        btnLogin.className = "flex-1 py-2 text-sm font-medium rounded-lg transition-all text-gray-400 hover:text-white";
        submitBtn.innerText = "Daftar Akun Baru";
    }
};

document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
        if (currentAuthMode === 'login') {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
            alert('Akun berhasil didaftarkan!');
        }
    } catch (error) {
        alert('Gagal: ' + error.message);
    }
});

window.handleGoogleLogin = async function() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        alert('Gagal login Google: ' + error.message);
    }
};

window.openResetModal = function() {
    document.getElementById('reset-modal').classList.remove('hidden');
    document.getElementById('reset-modal').classList.add('flex');
};

window.closeResetModal = function() {
    document.getElementById('reset-modal').classList.remove('flex');
    document.getElementById('reset-modal').classList.add('hidden');
};

window.handlePasswordReset = async function() {
    const email = document.getElementById('reset-email').value.trim();
    if (!email) {
        alert('Masukkan alamat email Anda terlebih dahulu!');
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        alert('Tautan reset kata sandi telah dikirim ke email Anda.');
        closeResetModal();
    } catch (error) {
        alert('Gagal mengirim tautan reset: ' + error.message);
    }
};

window.handleLogout = async function() {
    await signOut(auth);
};
