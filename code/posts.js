import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export function setupPosts(db, getCurrentUser) {
    window.createPost = async function() {
        const currentUser = getCurrentUser();
        const input = document.getElementById('post-input');
        const text = input.value.trim();
        if (!text || !currentUser) return;

        try {
            const currentName = document.getElementById('profile-name-display')?.innerText || currentUser.email;
            await addDoc(collection(db, "posts"), {
                uid: currentUser.uid,
                email: currentUser.email,
                author: currentName,
                content: text,
                createdAt: new Date()
            });
            input.value = '';
            loadRealPosts(db, getCurrentUser);
            loadMyPosts(db, getCurrentUser);
        } catch (error) {
            alert('Gagal memposting: ' + error.message);
        }
    };

    window.addComment = async function(postId) {
        const currentUser = getCurrentUser();
        const inputEl = document.getElementById(`comment-input-${postId}`);
        const text = inputEl.value.trim();
        if (!text || !currentUser) return;

        try {
            const currentName = document.getElementById('profile-name-display')?.innerText || currentUser.email;
            await addDoc(collection(db, "posts", postId, "comments"), {
                uid: currentUser.uid,
                author: currentName,
                content: text,
                createdAt: new Date()
            });
            inputEl.value = '';
            loadComments(postId, db, getCurrentUser);
        } catch (error) {
            alert('Gagal mengirim komentar: ' + error.message);
        }
    };

    window.confirmDeleteComment = function(postId, commentId, elementId) {
        const targetEl = document.getElementById(elementId);
        if (!targetEl) return;

        if (document.getElementById(`confirm-box-${commentId}`)) return;

        const confirmBox = document.createElement('div');
        confirmBox.id = `confirm-box-${commentId}`;
        confirmBox.className = "mt-2 p-2.5 bg-yuditif-bg border border-red-500/40 rounded-xl text-xs space-y-2 animate-fadeIn shadow-lg";
        confirmBox.innerHTML = `
            <div class="text-gray-300 font-medium">Hapus komentar ini?</div>
            <div class="flex gap-2">
                <button onclick="executeDeleteComment('${postId}', '${commentId}')" class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all">Ya, Hapus</button>
                <button onclick="document.getElementById('confirm-box-${commentId}').remove()" class="px-3 py-1 bg-yuditif-surface hover:bg-yuditif-border text-gray-300 rounded-lg transition-all">Batal</button>
            </div>
        `;
        targetEl.appendChild(confirmBox);
    };

    window.executeDeleteComment = async function(postId, commentId) {
        try {
            await deleteDoc(doc(db, "posts", postId, "comments", commentId));
            loadComments(postId, db, getCurrentUser);
        } catch (error) {
            alert('Gagal menghapus komentar: ' + error.message);
        }
    };

    window.confirmDeletePost = function(postId, containerId) {
        const targetEl = document.getElementById(containerId);
        if (!targetEl) return;

        if (document.getElementById(`confirm-post-${postId}`)) return;

        const confirmBox = document.createElement('div');
        confirmBox.id = `confirm-post-${postId}`;
        confirmBox.className = "mt-3 p-3 bg-yuditif-bg border border-red-500/40 rounded-xl text-xs space-y-2 animate-fadeIn shadow-lg";
        confirmBox.innerHTML = `
            <div class="text-gray-200 font-medium">Apakah Anda yakin ingin menghapus postingan ini?</div>
            <div class="flex gap-2">
                <button onclick="executeDeletePost('${postId}')" class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all">Ya, Hapus Postingan</button>
                <button onclick="document.getElementById('confirm-post-${postId}').remove()" class="px-3 py-1.5 bg-yuditif-surface hover:bg-yuditif-border text-gray-300 rounded-lg transition-all">Batal</button>
            </div>
        `;
        targetEl.appendChild(confirmBox);
    };

    window.executeDeletePost = async function(postId) {
        try {
            await deleteDoc(doc(db, "posts", postId));
            loadRealPosts(db, getCurrentUser);
            loadMyPosts(db, getCurrentUser);
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
        input.value = `✨ [Unimugo Space AI] ${text} #UnimugoSpace #MahasiswaUnimugo`;
    };
}

export async function loadRealPosts(db, getCurrentUser) {
    const currentUser = getCurrentUser();
    const container = document.getElementById('posts-feed-container');
    if (!container) return;
    container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Memuat data dari Unimugo Space...</p>';

    try {
        const q = query(collection(db, "posts"));
        const querySnapshot = await getDocs(q);
        container.innerHTML = '';

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Belum ada postingan. Jadilah mahasiswa pertama yang memposting!</p>';
            return;
        }

        let count = 0;
        querySnapshot.forEach((docSnap) => {
            count++;
            const postData = docSnap.data();
            const postId = docSnap.id;
            const isOwner = currentUser && (postData.uid === currentUser.uid || postData.email === currentUser.email);

            const postEl = document.createElement('div');
            postEl.id = `post-card-${postId}`;
            postEl.className = "bg-yuditif-surface border border-yuditif-border rounded-2xl p-4 shadow-lg space-y-3";
            postEl.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-xs">${postData.author ? postData.author.charAt(0).toUpperCase() : 'U'}</div>
                        <div class="overflow-hidden">
                            <div class="font-semibold text-xs text-white truncate max-w-[200px]">${postData.author || 'Anonim'}</div>
                            <div class="text-[10px] text-gray-400">Mahasiswa Unimugo</div>
                        </div>
                    </div>
                    ${isOwner ? `<button onclick="confirmDeletePost('${postId}', 'post-card-${postId}')" class="text-gray-400 hover:text-red-400 text-xs transition-all px-2 py-1 rounded-lg hover:bg-yuditif-bg flex items-center gap-1"><i class="fa-solid fa-trash"></i> Hapus</button>` : ''}
                </div>
                <p class="text-xs text-gray-200 leading-relaxed break-words">${escapeHtml(postData.content)}</p>
                
                <div class="mt-3 pt-3 border-t border-yuditif-border space-y-2">
                    <div class="text-[11px] font-semibold text-gray-400"><i class="fa-solid fa-comments"></i> Komentar</div>
                    <div id="comments-list-${postId}" class="space-y-1.5 pl-2 border-l-2 border-yuditif-border text-xs">
                        <span class="text-[10px] text-gray-500">Memuat komentar...</span>
                    </div>
                    <div class="flex gap-2 pt-1">
                        <input type="text" id="comment-input-${postId}" placeholder="Tulis komentar..." class="flex-1 bg-yuditif-bg border border-yuditif-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yuditif-primary">
                        <button onclick="addComment('${postId}')" class="px-3 py-1.5 bg-yuditif-primary hover:bg-blue-600 text-black font-medium rounded-xl text-xs transition-all">Kirim</button>
                    </div>
                </div>
            `;
            container.appendChild(postEl);
            loadComments(postId, db, getCurrentUser);
        });

        const statEl = document.getElementById('stat-total-posts');
        if (statEl) statEl.innerText = count;

    } catch (error) {
        container.innerHTML = `<p class="text-xs text-red-400 text-center py-4">Gagal memuat postingan: ${error.message}</p>`;
    }
}

async function loadComments(postId, db, getCurrentUser) {
    const currentUser = getCurrentUser();
    const commentsContainer = document.getElementById(`comments-list-${postId}`);
    if (!commentsContainer) return;

    try {
        const q = query(collection(db, "posts", postId, "comments"));
        const querySnapshot = await getDocs(q);
        commentsContainer.innerHTML = '';

        if (querySnapshot.empty) {
            commentsContainer.innerHTML = '<span class="text-[10px] text-gray-500">Belum ada komentar.</span>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const comment = docSnap.data();
            const commentId = docSnap.id;
            const isCommentOwner = currentUser && (comment.uid === currentUser.uid);

            const commentEl = document.createElement('div');
            commentEl.id = `comment-item-${commentId}`;
            commentEl.className = "bg-yuditif-bg/50 rounded-lg p-2 text-xs space-y-0.5 relative group";
            commentEl.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="font-semibold text-[11px] text-yuditif-primary">${escapeHtml(comment.author || 'Anonim')}</div>
                    ${isCommentOwner ? `<button onclick="confirmDeleteComment('${postId}', '${commentId}', 'comment-item-${commentId}')" class="text-gray-500 hover:text-red-400 text-[10px] transition-all" title="Hapus Komentar"><i class="fa-solid fa-xmark"></i></button>` : ''}
                </div>
                <div class="text-gray-200">${escapeHtml(comment.content)}</div>
            `;
            commentsContainer.appendChild(commentEl);
        });
    } catch (error) {
        commentsContainer.innerHTML = '<span class="text-[10px] text-red-400">Gagal memuat komentar.</span>';
    }
}

export async function loadMyPosts(db, getCurrentUser) {
    const currentUser = getCurrentUser();
    const container = document.getElementById('my-posts-container');
    if (!container || !currentUser) return;
    container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Memuat postingan Anda...</p>';

    try {
        const q = query(collection(db, "posts"), where("uid", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        container.innerHTML = '';

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Anda belum pernah membuat postingan di Unimugo Space.</p>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const postData = docSnap.data();
            const postId = docSnap.id;

            const postEl = document.createElement('div');
            postEl.id = `my-post-item-${postId}`;
            postEl.className = "bg-yuditif-bg border border-yuditif-border rounded-xl p-3 space-y-2";
            postEl.innerHTML = `
                <p class="text-xs text-gray-200 leading-relaxed break-words">${escapeHtml(postData.content)}</p>
                <div class="flex justify-between items-center pt-1 border-t border-yuditif-border">
                    <span class="text-[10px] text-gray-500">Milik Anda</span>
                    <button onclick="confirmDeletePost('${postId}', 'my-post-item-${postId}')" class="text-red-400 hover:text-red-300 text-[11px] transition-all flex items-center gap-1"><i class="fa-solid fa-trash"></i> Hapus Postingan</button>
                </div>
            `;
            container.appendChild(postEl);
        });
    } catch (error) {
        container.innerHTML = `<p class="text-xs text-red-400 text-center py-4">Gagal memuat postingan Anda</p>`;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}