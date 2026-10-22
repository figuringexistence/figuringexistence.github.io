import { 
    collection, 
    addDoc, 
    getDocs, 
    query 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { currentUser } from "./auth.js";

window.createPost = async function() {
    const input = document.getElementById('post-input');
    const text = input.value.trim();
    if (!text || !currentUser) return;

    try {
        await addDoc(collection(db, "posts"), {
            author: currentUser.email || currentUser.displayName || 'Pengguna TIF',
            content: text,
            createdAt: new Date()
        });
        input.value = '';
        loadRealPosts();
    } catch (error) {
        alert('Gagal memposting: ' + error.message);
    }
};

export async function loadRealPosts() {
    const container = document.getElementById('posts-feed-container');
    container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Memuat data dari Cloud Database...</p>';

    try {
        const q = query(collection(db, "posts"));
        const querySnapshot = await getDocs(q);
        container.innerHTML = '';

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Belum ada postingan. Jadilah yang pertama memposting!</p>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const post = docSnap.data();
            const postEl = document.createElement('div');
            postEl.className = "bg-gemini-surface border border-gemini-border rounded-2xl p-4 shadow-lg space-y-3";
            postEl.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-xs">${post.author ? post.author.charAt(0).toUpperCase() : 'U'}</div>
                        <div class="overflow-hidden">
                            <div class="font-semibold text-xs text-white truncate max-w-[200px]">${post.author || 'Anonim'}</div>
                            <div class="text-[10px] text-gray-400">Baru saja</div>
                        </div>
                    </div>
                </div>
                <p class="text-xs text-gray-200 leading-relaxed break-words">${escapeHtml(post.content)}</p>
            `;
            container.appendChild(postEl);
        });
    } catch (error) {
        container.innerHTML = `<p class="text-xs text-red-400 text-center py-4">Gagal memuat postingan: ${error.message}</p>`;
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
