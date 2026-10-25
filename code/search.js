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