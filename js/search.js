const searchInput = document.getElementById('search-input');

searchInput?.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const posts = document.querySelectorAll('#post-list li');
    
    posts.forEach(post => {
        const text = post.innerText.toLowerCase();
        post.style.display = text.includes(keyword) ? '' : 'none';
    });
});
