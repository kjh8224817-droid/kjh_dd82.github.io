async function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get('file');
    
    if (!fileName) {
        document.getElementById('post-content').innerHTML = '<p>게시글을 찾을 수 없습니다.</p>';
        return;
    }

    try {
        const response = await fetch(`pages/${fileName}`);
        if (!response.ok) throw new Error('게시글 로딩 실패');
        
        let content = await response.text();
        
        // Front Matter 제거
        const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        if (frontMatterMatch) {
            content = frontMatterMatch[2];
        }

        // marked.js로 변환 후 렌더링
        document.getElementById('post-content').innerHTML = marked.parse(content);
        
        // Prism.js 하이라이팅 적용
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('post-content').innerHTML = '<p>게시글을 불러오는데 실패했습니다.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadPost);
