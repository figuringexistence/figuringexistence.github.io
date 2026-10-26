import { getFirestore, collection, query, getDocs, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"; // kalau firestore pakai import firestore yang benar di bawah
import { getFirestore, collection, query, getDocs, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // 1. Fitur Filter Postingan saat mengetik (Input event)
    searchInput.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        const postElements = document.querySelectorAll('#posts-feed-container > div');

        postElements.forEach(el => {
            const text = el.innerText.toLowerCase();
            if (text.includes(keyword)) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    });

    // 2. Fitur Pencarian User/Username saat menekan Enter (Keypress event)
    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const keyword = e.target.value.toLowerCase().trim().replace('@', '');
            if (!keyword) return;

            const db = getFirestore();
            
            try {
                // Cari berdasarkan username di koleksi 'users'
                const qUsername = query(collection(db, "users"), where("username", "==", keyword));
                const snapUsername = await getDocs(qUsername);

                if (!snapUsername.empty) {
                    const foundUsername = snapUsername.docs[0].data().username;
                    window.location.href = `profil.html?username=${foundUsername}`;
                    return;
                }

                // Jika tidak ketemu berdasarkan username, cari berdasarkan displayName
                const qSnapAll = await getDocs(collection(db, "users"));
                let foundUsernameByName = null;

                qSnapAll.forEach((docSnap) => {
                    const data = docSnap.data();
                    if (data.displayName && data.displayName.toLowerCase().includes(keyword)) {
                        foundUsernameByName = data.username;
                    }
                });

                if (foundUsernameByName) {
                    window.location.href = `profil.html?username=${foundUsernameByName}`;
                } else {
                    alert("Pengguna atau username tersebut tidak ditemukan!");
                }
            } catch (error) {
                console.error("Gagal melakukan pencarian:", error);
                alert("Terjadi kesalahan saat mencari.");
            }
        }
    });
}
