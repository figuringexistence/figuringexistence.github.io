import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, query, getDocs, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const urlParams = new URLSearchParams(window.location.search);
const targetUsername = urlParams.get('username');

// Pantau status login (bisa null jika user belum login)
onAuthStateChanged(auth, async (user) => {
    // Jika tidak ada username di URL dan user belum login, baru arahkan ke index.html
    if (!user && !targetUsername) {
        window.location.href = "index.html";
        return;
    }

    let profileId = null;
    let isMyProfile = false;

    try {
        if (targetUsername) {
            // Cari data user berdasarkan username di URL
            const cleanUsername = targetUsername.toLowerCase().replace('@', '').trim();
            const q = query(collection(db, "users"), where("username", "==", cleanUsername));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const userDocSnap = querySnapshot.docs[0];
                profileId = userDocSnap.id;
                // Cek apakah user yang login adalah pemilik profil ini
                isMyProfile = user && (profileId === user.uid);
            } else {
                alert("Pengguna dengan username tersebut tidak ditemukan!");
                window.location.href = "index.html";
                return;
            }
        } else {
            // Jika tidak ada parameter username di URL, berarti melihat profil sendiri yang sedang login
            profileId = user.uid;
            isMyProfile = true;
        }

        // Ambil elemen UI form edit dan tombol aksi
        const editSection = document.getElementById('edit-profile-section');
        const actionContainer = document.getElementById('profile-action-container');
        const avatarOverlay = document.querySelectorAll('.group-hover\\:opacity-100'); // Tombol ganti foto profil

        if (!isMyProfile) {
            // 1. JIKA DILIHAT ORANG LAIN / TANPA LOGIN: Sembunyikan form edit & tombol ganti foto
            if (editSection) editSection.style.display = 'none';
            avatarOverlay.forEach(el => el.style.display = 'none');
            
            if (actionContainer) {
                actionContainer.innerHTML = `<button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow transition-all flex items-center gap-1.5"><i class="fa-solid fa-user-plus"></i> Tambah Teman</button>`;
            }
        } else {
            // 2. JIKA INI PROFIL SENDIRI: Tampilkan form edit & alat pengatur
            if (editSection) editSection.style.display = 'block';
            if (actionContainer) actionContainer.innerHTML = '';
        }

        // Muat Data Profil dari Firestore (Bisa diakses publik tanpa login)
        const userDocRef = doc(db, "users", profileId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const data = userDoc.data();
            const usernameVal = data.username || "user";

            document.getElementById('profile-view-name').innerText = data.displayName || "Pengguna Unimugo";
            document.getElementById('profile-view-username').innerText = "@" + usernameVal;
            document.getElementById('profile-view-bio').innerText = data.bio || "Mahasiswa aktif Unimugo Space";
            
            if (data.photoURL) {
                document.getElementById('profile-avatar-img').src = data.photoURL;
            }

            if (data.coverURL) {
                const coverBg = document.getElementById('profile-cover-bg');
                if (coverBg) {
                    coverBg.style.backgroundImage = `url(${data.coverURL})`;
                }
            }

            // Isi form edit hanya jika ini profil pemilik akun yang sedang login
            if (isMyProfile && user) {
                const editNameInput = document.getElementById('edit-display-name');
                const editUsernameInput = document.getElementById('edit-username');
                const editBioInput = document.getElementById('edit-bio');

                if (editNameInput) editNameInput.value = data.displayName || "";
                if (editUsernameInput) editUsernameInput.value = usernameVal;
                if (editBioInput) editBioInput.value = data.bio || "";
            }
        }
    } catch (err) {
        console.error("Gagal memuat profil:", err);
    }

    // Event Listener Tombol Simpan Perubahan (Hanya aktif jika pemilik akun)
    const saveBtn = document.getElementById('btn-save-profile');
    if (saveBtn && isMyProfile && user) {
        saveBtn.addEventListener('click', async () => {
            const newName = document.getElementById('edit-display-name').value.trim();
            const newUsername = document.getElementById('edit-username').value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
            const newBio = document.getElementById('edit-bio').value.trim();

            if (!newName || !newUsername) {
                alert("Nama dan Username tidak boleh kosong!");
                return;
            }

            try {
                await updateDoc(doc(db, "users", user.uid), {
                    displayName: newName,
                    username: newUsername,
                    bio: newBio
                });

                alert("Profil dan username berhasil diperbarui!");
                window.location.href = `profil.html?username=${newUsername}`;
            } catch (error) {
                alert("Gagal memperbarui profil: " + error.message);
            }
        });
    }

    // Fitur Ganti/Hapus Foto Profil & Sampul (Hanya aktif jika pemilik akun)
    if (isMyProfile && user) {
        const uploadInput = document.getElementById('upload-avatar-file');
        if (uploadInput) {
            uploadInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async function(uploadEvent) {
                    const base64Image = uploadEvent.target.result;
                    document.getElementById('profile-avatar-img').src = base64Image;
                    await updateDoc(doc(db, "users", user.uid), { photoURL: base64Image });
                    alert("Foto profil berhasil diperbarui!");
                };
                reader.readAsDataURL(file);
            });
        }

        const deleteBtn = document.getElementById('delete-avatar-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (confirm("Hapus foto profil Anda?")) {
                    await updateDoc(doc(db, "users", user.uid), { photoURL: "" });
                    document.getElementById('profile-avatar-img').src = "https://via.placeholder.com/150";
                    alert("Foto profil berhasil dihapus!");
                }
            });
        }

        const uploadCoverInput = document.getElementById('upload-cover-file');
        if (uploadCoverInput) {
            uploadCoverInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async function(uploadEvent) {
                    const base64Image = uploadEvent.target.result;
                    document.getElementById('profile-cover-bg').style.backgroundImage = `url(${base64Image})`;
                    await updateDoc(doc(db, "users", user.uid), { coverURL: base64Image });
                    alert("Foto sampul berhasil diperbarui!");
                };
                reader.readAsDataURL(file);
            });
        }

        const deleteCoverBtn = document.getElementById('delete-cover-btn');
        if (deleteCoverBtn) {
            deleteCoverBtn.addEventListener('click', async () => {
                if (confirm("Hapus foto sampul Anda?")) {
                    await updateDoc(doc(db, "users", user.uid), { coverURL: "" });
                    document.getElementById('profile-cover-bg').style.backgroundImage = "";
                    alert("Foto sampul berhasil dihapus!");
                }
            });
        }
    }
});

// Fitur Pencarian Pengguna Berdasarkan Username (Bisa diakses publik)
const searchInput = document.getElementById('search-username-input');
if (searchInput) {
    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const keyword = e.target.value.toLowerCase().trim().replace('@', '');
            if (!keyword) return;
            window.location.href = `profil.html?username=${keyword}`;
        }
    });
}
