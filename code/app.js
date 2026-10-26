import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { setupAuth } from "./auth.js";
import { setupPosts, loadRealPosts, loadMyPosts } from "./posts.js";
import { initSearch } from "./search.js";

let currentUser = null;
const getCurrentUser = () => currentUser;

// Inisialisasi modul
setupAuth(auth, db);
setupPosts(db, getCurrentUser);

// Pantau status login secara real-time
onAuthStateChanged(auth, async (user) => {
    const authContainer = document.getElementById('auth-container');
    const dashboardContainer = document.getElementById('dashboard-container');

    if (user) {
        // --- JIKA USER SUDAH LOGIN ---
        currentUser = user;
        
        if (authContainer) authContainer.classList.add('hidden');
        if (dashboardContainer) dashboardContainer.classList.remove('hidden');

        let profileData = { displayName: user.displayName || user.email.split('@')[0], bio: "Mahasiswa aktif Unimugo Space" };
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                profileData = userDoc.data();
            } else {
                await setDoc(userDocRef, profileData);
            }
        } catch (err) {
            console.log("Error loading profile:", err);
        }

        const displayName = profileData.displayName || user.email.split('@')[0];
        const bio = profileData.bio || "Mahasiswa aktif Unimugo Space";
        const initial = displayName.charAt(0).toUpperCase();

        document.querySelectorAll('.user-initial').forEach(el => el.innerText = initial);
        const avatarBadge = document.getElementById('user-avatar-badge');
        if (avatarBadge) avatarBadge.innerText = initial;
        
        const nameDisplay = document.getElementById('profile-name-display');
        if (nameDisplay) nameDisplay.innerText = displayName;
        
        const emailDisplay = document.getElementById('profile-email-display');
        if (emailDisplay) emailDisplay.innerText = user.email;
        
        const bioDisplay = document.getElementById('profile-bio-display');
        if (bioDisplay) bioDisplay.innerText = bio;
        
        const editName = document.getElementById('edit-display-name');
        if (editName) editName.value = displayName;
        
        const editBio = document.getElementById('edit-bio');
        if (editBio) editBio.value = bio;

        loadRealPosts(db, getCurrentUser);
        loadMyPosts(db, getCurrentUser);
        initSearch();
    } else {
        import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

window.handleGoogleLogin = async function() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("Login Google berhasil:", result.user);
    } catch (error) {
        console.error("Error Google Login:", error.code, error.message);
        alert("Gagal login dengan Google: " + error.message);
    }
};
        // --- JIKA USER BELUM LOGIN / KELUAR ---
        currentUser = null;
        
        if (authContainer) authContainer.classList.remove('hidden');
        if (dashboardContainer) dashboardContainer.classList.add('hidden');
    }
});

window.switchTab = function(tabName) {
    ['feed', 'explore', 'profile', 'jadwalkuliah'].forEach(t => {
        const content = document.getElementById(`tab-content-${t}`);
        const nav = document.getElementById(`nav-${t}`);
        if (!content || !nav) return;

        if (t === tabName) {
            content.classList.remove('hidden');
            nav.className = "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all bg-yuditif-surface text-yuditif-primary border border-yuditif-border shadow-sm";
        } else {
            content.classList.add('hidden');
            nav.className = "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all text-gray-400 hover:text-white hover:bg-yuditif-surface";
        }
    });
};

window.saveProfileChanges = async function() {
    if (!currentUser) return;
    const nameInput = document.getElementById('edit-display-name');
    const bioInput = document.getElementById('edit-bio');
    if (!nameInput || !bioInput) return;

    const newName = nameInput.value.trim();
    const newBio = bioInput.value.trim();

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

        const nameDisplay = document.getElementById('profile-name-display');
        const bioDisplay = document.getElementById('profile-bio-display');
        if (nameDisplay) nameDisplay.innerText = newName;
        if (bioDisplay) bioDisplay.innerText = newBio;
        alert('Profil berhasil diperbarui!');
    } catch (error) {
        alert('Gagal memperbarui profil: ' + error.message);
    }
};
