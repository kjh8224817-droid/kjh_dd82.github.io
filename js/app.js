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
            li.innerHTML = `
                <h2><a href="post.html?file=${post.file}">${post.title}</a></h2>
                <p>${post.date} | ${post.tags.join(', ')}</p>
                <p>${post.excerpt}</p>
            `;
            postList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('post-list').innerHTML = '<li>게시글이 아직 없거나 불러오는데 실패했습니다.</li>';
    }
}

document.addEventListener('DOMContentLoaded', loadPosts);
