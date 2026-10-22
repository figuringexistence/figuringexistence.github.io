import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

let currentAuthMode = 'login';
export let currentUser = null;

export function initAuth(onUserLoggedIn, onUserLoggedOut) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            // Ambil data tambahan profil dari Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            let profileData = { displayName: user.displayName || user.email.split('@')[0], bio: "Anggota Komunitas TIF Social" };
            
            if (userDoc.exists()) {
                profileData = userDoc.data();
            } else {
                // Buat dokumen profil awal jika belum ada
                await setDoc(userDocRef, profileData);
            }

            onUserLoggedIn(user, profileData);
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
            const res = await createUserWithEmailAndPassword(auth, email, password);
            // Inisialisasi dokumen profil baru di Firestore
            await setDoc(doc(db, "users", res.user.uid), {
                displayName: email.split('@')[0],
                bio: "Anggota baru TIF Social"
            });
            alert('Akun berhasil didaftarkan!');
        }
    } catch (error) {
        alert('Gagal: ' + error.message);
    }
});

window.handleGoogleLogin = async function() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                displayName: result.user.displayName || result.user.email.split('@')[0],
                bio: "Pengguna Google di TIF Social"
            });
        }
    } catch (error) {
        alert('Gagal login Google: ' + error.message);
    }
};

// Fungsi Menyimpan Perubahan Profil (Nama & Bio)
window.saveProfileChanges = async function() {
    if (!currentUser) return;
    const newName = document.getElementById('edit-display-name').value.trim();
    const newBio = document.getElementById('edit-bio').value.trim();

    if (!newName) {
        alert('Nama tampilan tidak boleh kosong!');
        return;
    }

    try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
            displayName: newName,
            bio: newBio
        });

        document.getElementById('profile-name-display').innerText = newName;
        document.getElementById('profile-bio-display').innerText = newBio;
        document.querySelectorAll('.user-display-name').forEach(el => el.innerText = newName);
        alert('Profil berhasil diperbarui!');
    } catch (error) {
        alert('Gagal memperbarui profil: ' + error.message);
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
