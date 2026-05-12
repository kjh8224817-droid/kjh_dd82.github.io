// 게시글 목록 로딩
async function loadPosts() {
    try {
        const response = await fetch('posts.json');
        if (!response.ok) throw new Error('posts.json을 찾을 수 없습니다.');
        const posts = await response.json();
        
        const postList = document.getElementById('post-list');
        postList.innerHTML = '';
        
        posts.forEach(post => {
            const li = document.createElement('li');
            li.className = 'post-card';
            li.innerHTML = `
                <div class="post-card-image">
                    <img src="${post.thumbnail || 'images/default-thumbnail.png'}" alt="${post.title}">
                </div>
                <div class="post-card-content">
                    <div class="post-meta">
                        <span class="post-category">${post.category}</span>
                        <span class="post-date">${post.date}</span>
                    </div>
                    <h2 class="post-title"><a href="post.html?slug=${post.slug}">${post.title}</a></h2>
                    <p class="post-summary">${post.summary}</p>
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}
                    </div>
                </div>
            `;
            postList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('post-list').innerHTML = '<li>게시글이 아직 없거나 불러오는데 실패했습니다.</li>';
    }
}

document.addEventListener('DOMContentLoaded', loadPosts);
