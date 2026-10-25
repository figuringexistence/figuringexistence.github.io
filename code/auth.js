import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export function setupAuth(auth, db) {
    let currentAuthMode = 'login';

    window.switchAuthTab = function(mode) {
        currentAuthMode = mode;
        const btnLogin = document.getElementById('tab-login');
        const btnRegister = document.getElementById('tab-register');
        const submitBtn = document.getElementById('auth-submit-btn');

        if (!btnLogin || !btnRegister || !submitBtn) return;

        if (mode === 'login') {
            btnLogin.className = "flex-1 py-2 text-sm font-medium rounded-lg transition-all bg-yuditif-surface text-white shadow-sm";
            btnRegister.className = "flex-1 py-2 text-sm font-medium rounded-lg transition-all text-gray-400 hover:text-white";
            submitBtn.innerText = "Masuk Sekarang";
        } else {
            btnRegister.className = "flex-1 py-2 text-sm font-medium rounded-lg transition-all bg-yuditif-surface text-white shadow-sm";
            btnLogin.className = "flex-1 py-2 text-sm font-medium rounded-lg transition-all text-gray-400 hover:text-white";
            submitBtn.innerText = "Daftar Akun Baru";
        }
    };

    const authForm = document.getElementById('auth-form');
    if (authForm) {
        const newForm = authForm.cloneNode(true);
        authForm.parentNode.replaceChild(newForm, authForm);

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;

            try {
                if (currentAuthMode === 'login') {
                    await signInWithEmailAndPassword(auth, email, password);
                } else {
                    const res = await createUserWithEmailAndPassword(auth, email, password);
                    const user = res.user;

                    // Generate ID Unik Berurutan
                    const customId = await generateUniqueUserId(db);

                    // Simpan data user ke Firestore beserta userId
                    await setDoc(doc(db, "users", user.uid), {
                        userId: customId,
                        displayName: email.split('@')[0],
                        bio: "Mahasiswa aktif Unimugo Space",
                        email: email
                    });

                    alert('Akun berhasil didaftarkan! ID Anda: ' + customId);
                }
            } catch (error) {
                alert('Gagal: ' + error.message);
            }
        });
    }

    window.handleGoogleLogin = async function() {
        const provider = new GoogleAuthProvider();
        try {
            const res = await signInWithPopup(auth, provider);
            const user = res.user;
            
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
                const customId = await generateUniqueUserId(db);
                await setDoc(userDocRef, {
                    userId: customId,
                    displayName: user.displayName || user.email.split('@')[0],
                    bio: "Mahasiswa aktif Unimugo Space",
                    email: user.email
                });
            }
        } catch (error) {
            alert('Gagal login Google: ' + error.message);
        }
    };

    window.handleLogout = async function() {
        try {
            await signOut(auth);
        } catch (error) {
            alert('Gagal keluar: ' + error.message);
        }
    };

    window.openResetModal = function() {
        const modal = document.getElementById('reset-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    };

    window.closeResetModal = function() {
        const modal = document.getElementById('reset-modal');
        if (modal) {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }
    };

    window.handlePasswordReset = async function() {
        const emailInput = document.getElementById('reset-email');
        if (!emailInput) return;
        const email = emailInput.value.trim();
        
        if (!email) {
            alert('Masukkan email Anda terlebih dahulu!');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Tautan reset kata sandi telah dikirim ke email Anda.');
            window.closeResetModal();
        } catch (error) {
            alert('Gagal mengirim tautan: ' + error.message);
        }
    };
}

async function generateUniqueUserId(db) {
    const counterRef = doc(db, "counters", "userCounter");

    try {
        const newId = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            let latestSeq = 100000;

            if (counterDoc.exists()) {
                latestSeq = counterDoc.data().currentSeq || 100000;
            }

            const nextSeq = latestSeq + 1;
            transaction.set(counterRef, { currentSeq: nextSeq });

            const yearMonth = "202610"; 
            return `${yearMonth}${String(nextSeq).slice(-5)}`;
        });

        return newId;
    } catch (e) {
        console.error("Gagal membuat ID unik:", e);
        return "202610" + Math.floor(10000 + Math.random() * 90000);
    }
}