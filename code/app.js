import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, serverTimestamp, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBdsCzOFNpVKSwcQ1SdAulPuYwby_KeFpg",
    authDomain: "tif-social.firebaseapp.com",
    projectId: "tif-social",
    storageBucket: "tif-social.firebasestorage.app",
    messagingSenderId: "852033430946",
    appId: "1:852033430946:web:4b48c434427710db34befb",
    measurementId: "G-GTFD75TYMT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isLoginMode = true;

// 1. Tab Switcher (Masuk / Daftar)
window.switchAuthTab = function(mode) {
    isLoginMode = (mode === 'login');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (tabLogin && tabRegister && submitBtn) {
        if (isLoginMode) {
            tabLogin.className = "flex-1 py-2 text-sm font-medium rounded-lg transition-all bg-yuditif-surface text-white shadow-sm";
            tabRegister.className = "flex-1 py-2 text-sm font-medium rounded-lg transition-all text-gray-400 hover:text-white";
            submitBtn.innerText = "Masuk Sekarang";
        } else {
            tabRegister.className = "flex-1 py-2 text-sm font-medium rounded-lg transition-all bg-yuditif-surface text-white shadow-sm";
            tabLogin.className = "flex-1 py-2 text-sm font-medium rounded-lg transition-all text-gray-400 hover:text-white";
            submitBtn.innerText = "Daftar Akun Baru";
        }
    }
};

// 2. Google Login
window.handleGoogleLogin = async function() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        alert("Gagal login Google: " + error.message);
    }
};

// 3. Logout
window.handleLogout = async function() {
    try {
        await signOut(auth);
        window.location.reload();
    } catch (error) {
        console.error("Gagal keluar:", error);
    }
};

// 4. Modal Reset Password
window.openResetModal = function() {
    const modal = document.getElementById('reset-modal');
    if (modal) modal.style.display = 'flex';
};
window.closeResetModal = function() {
    const modal = document.getElementById('reset-modal');
    if (modal) modal.style.display = 'none';
};
window.handlePasswordReset = async function() {
    const emailInput = document.getElementById('reset-email');
    if (!emailInput || !emailInput.value) {
        alert("Masukkan email terlebih dahulu.");
        return;
    }
    try {
        await sendPasswordResetEmail(auth, emailInput.value);
        alert("Tautan reset kata sandi telah dikirim ke email Anda.");
        closeResetModal();
    } catch (error) {
        alert("Gagal mengirim email reset: " + error.message);
    }
};

// 5. Navigasi Tab Dashboard
window.switchTab = function(tabName) {
    const feedContent = document.getElementById('tab-content-feed');
    const exploreContent = document.getElementById('tab-content-explore');
    const profileContent = document.getElementById('tab-content-profile');
    
    const navFeed = document.getElementById('nav-feed');
    const navExplore = document.getElementById('nav-explore');

    // Sembunyikan semua tab dulu
    if (feedContent) feedContent.style.display = 'none';
    if (exploreContent) exploreContent.style.display = 'none';
    if (profileContent) profileContent.style.display = 'none';

    if (tabName === 'feed') {
        if (feedContent) feedContent.style.display = 'block';
        if (navFeed) navFeed.className = "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all bg-yuditif-surface text-yuditif-primary border border-yuditif-border shadow-sm";
        if (navExplore) navExplore.className = "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all text-gray-400 hover:text-white hover:bg-yuditif-surface";
    } else if (tabName === 'explore') {
        if (exploreContent) exploreContent.style.display = 'block';
        if (navExplore) navExplore.className = "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all bg-yuditif-surface text-yuditif-primary border border-yuditif-border shadow-sm";
        if (navFeed) navFeed.className = "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all text-gray-400 hover:text-white hover:bg-yuditif-surface";
    }
};

// 6. Buat Postingan
window.createPost = async function() {
    const postInput = document.getElementById('post-input');
    if (!postInput) return;
    const content = postInput.value.trim();
    if (!content) {
        alert("Postingan tidak boleh kosong!");
        return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
        let customUsername = user.email.split('@')[0];
        let displayName = user.displayName || customUsername;
        
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const uData = userDoc.data();
            if (uData.username) customUsername = uData.username;
            if (uData.displayName) displayName = uData.displayName;
        }

        await addDoc(collection(db, "posts"), {
            userId: user.uid,
            userName: displayName,
            userUsername: customUsername,
            userPhoto: user.photoURL || "",
            content: content,
            createdAt: serverTimestamp()
        });

        postInput.value = "";
        loadPosts(user);
    } catch (error) {
        alert("Gagal membuat postingan: " + error.message);
    }
};

// 7. Muat Postingan Beranda
async function loadPosts(currentUser) {
    const feedContainer = document.getElementById('posts-feed-container');
    if (!feedContainer) return;

    feedContainer.innerHTML = `<div class="text-center py-6 text-gray-400 text-xs">Memuat postingan...</div>`;

    try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        feedContainer.innerHTML = "";

        if (querySnapshot.empty) {
            feedContainer.innerHTML = `<div class="text-center py-6 text-gray-500 text-xs">Belum ada postingan di beranda.</div>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const post = docSnap.data();
            const postId = docSnap.id;
            const isMyPost = currentUser && (post.userId === currentUser.uid);

            const postCard = document.createElement('div');
            postCard.className = "bg-yuditif-surface border border-yuditif-border rounded-2xl p-4 space-y-3 shadow-md";
            
            postCard.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <img src="${post.userPhoto || 'https://via.placeholder.com/40'}" class="w-9 h-9 rounded-full object-cover bg-gray-700">
                        <div>
                            <h4 class="text-xs font-bold text-white">${post.userName || 'Pengguna'}</h4>
                            <a href="profil.html?username=${post.userUsername || ''}" class="text-[10px] text-yuditif-primary hover:underline">@${post.userUsername || 'user'}</a>
                        </div>
                    </div>
                    ${isMyPost ? `<button onclick="window.hapusPostingan('${postId}')" class="text-red-400 hover:text-red-300 text-xs p-1.5 transition-all" title="Hapus Postingan"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
                <p class="text-xs text-gray-200 whitespace-pre-line">${post.content}</p>
            `;
            feedContainer.appendChild(postCard);
        });
    } catch (error) {
        console.error("Gagal memuat feed:", error);
    }
}

// 8. Hapus Postingan Sendiri
window.hapusPostingan = async function(postId) {
    if (confirm("Yakin ingin menghapus postingan ini?")) {
        try {
            await deleteDoc(doc(db, "posts", postId));
            alert("Postingan berhasil dihapus!");
            loadPosts(auth.currentUser);
        } catch (error) {
            alert("Gagal menghapus postingan: " + error.message);
        }
    }
};

// 9. Event Listener saat DOM Siap (Menangani Form Login / Register)
document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('auth-email');
            const passInput = document.getElementById('auth-password');
            
            if (!emailInput || !passInput) return;
            const email = emailInput.value.trim();
            const password = passInput.value;

            try {
                if (isLoginMode) {
                    await signInWithEmailAndPassword(auth, email, password);
                } else {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const newUser = userCredential.user;
                    
                    // Simpan data ke koleksi users Firestore
                    await setDoc(doc(db, "users", newUser.uid), {
                        displayName: newUser.email.split('@')[0],
                        username: newUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ''),
                        email: newUser.email,
                        bio: "Mahasiswa aktif Unimugo Space",
                        photoURL: "",
                        coverURL: ""
                    });
                    alert("Akun berhasil didaftarkan!");
                }
            } catch (error) {
                alert("Gagal autentikasi: " + error.message);
            }
        });
    }

    // Search bar handler
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const keyword = e.target.value.toLowerCase().trim().replace('@', '');
                if (!keyword) return;
                window.location.href = `profil.html?username=${keyword}`;
            }
        });
    }
});

// 10. Pemantau Auth Firebase
onAuthStateChanged(auth, async (user) => {
    const authContainer = document.getElementById('auth-container');
    const dashboardContainer = document.getElementById('dashboard-container');

    if (user) {
        if (authContainer) authContainer.style.display = 'none';
        if (dashboardContainer) dashboardContainer.style.display = 'flex';
        loadPosts(user);
    } else {
        if (authContainer) authContainer.style.display = 'flex';
        if (dashboardContainer) dashboardContainer.style.display = 'none';
    }
});
