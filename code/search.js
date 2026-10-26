// code/search.js
export function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

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
}
import { getFirestore, collection, query, getDocs, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const keyword = e.target.value.toLowerCase().trim().replace('@', '');
            if (!keyword) return;

            const db = getFirestore();
            
            try {
                // 1. Cari berdasarkan username di koleksi 'users'
                const qUsername = query(collection(db, "users"), where("username", "==", keyword));
                const snapUsername = await getDocs(qUsername);

                if (!snapUsername.empty) {
                    const foundUsername = snapUsername.docs[0].data().username;
                    window.location.href = `profil.html?username=${foundUsername}`;
                    return;
                }

                // 2. Jika tidak ketemu berdasarkan username, coba cari berdasarkan displayName
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
