import { 
    collection, 
    addDoc, 
    getDocs, 
    query,
    where,
    deleteDoc,
    doc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { currentUser } from "./auth.js";

window.createPost = async function() {
    const input = document.getElementById('post-input');
    const text = input.value.trim();
    if (!text || !currentUser) return;

    try {
        const currentName = document.getElementById('profile-name-display')?.innerText || currentUser.email;
        await addDoc(collection(db, "posts"), {
            uid: currentUser.uid,
            author: currentName,
            email: currentUser.email,
            content: text,
            createdAt: new Date()
        });
        input.value = '';
        loadRealPosts();
        loadMyPosts();
    } catch (error) {
        alert('Gagal memposting: ' + error.message);
    }
};

export async function loadRealPosts() {
    const container = document.getElementById('posts-feed-container');
    if (!container) return;
    container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Memuat data dari Cloud Database...</p>';

    try {
        const q = query(collection(db, "posts"));
        const querySnapshot = await getDocs(q);
        container.innerHTML = '';

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Belum ada postingan. Jadilah yang pertama memposting!</p>';
            return;
        }

        let count = 0;
        querySnapshot.forEach((docSnap) => {
            count++;
            const post = docSnap.data();
            const postId = docSnap.id;
            
            // Cek apakah postingan ini milik user yang sedang login
            const isOwner = currentUser && post.uid === currentUser.uid;

            const postEl = document.createElement('div');
            postEl.className = "bg-gemini-surface border border-gemini-border rounded-2xl p-4 shadow-lg space-y-3";
            postEl.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-xs">${post.author ? post.author.charAt(0).toUpperCase() : 'U'}</div>
                        <div class="overflow-hidden">
                            <div class="font-semibold text-xs text-white truncate max-w-[200px]">${post.author || 'Anonim'}</div>
                            <div class="text-[10px] text-gray-400">Postingan Publik</div>
                        </div>
                    </div>
                    ${isOwner ? `<button onclick="deletePost('${postId}')" class="text-gray-400 hover:text-red-400 text-xs transition-all px-2 py-1 rounded-lg hover:bg-gemini-bg"><i class="fa-solid fa-trash"></i> Hapus</button>` : ''}
                </div>
                <p class="text-xs text-gray-200 leading-relaxed break-words">${escapeHtml(post.content)}</p>
            `;
            container.appendChild(postEl);
        });

        const statEl = document.getElementById('stat-total-posts');
        if (statEl) statEl.innerText = count;

    } catch (error) {
        container.innerHTML = `<p class="text-xs text-red-400 text-center py-4">Gagal memuat postingan: ${error.message}</p>`;
    }
}

export async function loadMyPosts() {
    const container = document.getElementById('my-posts-container');
    if (!container || !currentUser) return;
    container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Memuat postingan Anda...</p>';

    try {
        const q = query(collection(db, "posts"), where("uid", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        container.innerHTML = '';

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Anda belum pernah membuat postingan.</p>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const post = docSnap.data();
            const postId = docSnap.id;

            const postEl = document.createElement('div');
            postEl.className = "bg-gemini-bg border border-gemini-border rounded-xl p-3 space-y-2";
            postEl.innerHTML = `
                <p class="text-xs text-gray-200 leading-relaxed break-words">${escapeHtml(post.content)}</p>
                <div class="flex justify-between items-center pt-1 border-t border-gemini-border">
                    <span class="text-[10px] text-gray-500">Milik Anda</span>
                    <button onclick="deletePost('${postId}')" class="text-red-400 hover:text-red-300 text-[11px] transition-all"><i class="fa-solid fa-trash"></i> Hapus Postingan</button>
                </div>
            `;
            container.appendChild(postEl);
        });
    } catch (error) {
        container.innerHTML = `<p class="text-xs text-red-400 text-center py-4">Gagal memuat postingan Anda</p>`;
    }
}

// Fungsi Global untuk Menghapus Postingan
window.deletePost = async function(postId) {
    if (!confirm('Apakah Anda yakin ingin menghapus postingan ini?')) return;

    try {
        await deleteDoc(doc(db, "posts", postId));
        alert('Postingan berhasil dihapus!');
        loadRealPosts();
        loadMyPosts();
    } catch (error) {
        alert('Gagal menghapus postingan: ' + error.message);
    }
};

window.polishWithAI = function() {
    const input = document.getElementById('post-input');
    const text = input.value.trim();
    if (!text) {
        alert('Tuliskan draf teks terlebih dahulu!');
        return;
    }
    input.value = `✨ [TIF AI Polish] ${text} #TIFSocial #CloudFirebase`;
};

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
