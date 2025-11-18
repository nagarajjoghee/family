async function loadBlogPage() {
    try {
        const posts = await API.getBlogPosts();
        const container = document.getElementById('blogContainer');
        
        if (posts.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No blog posts yet</h3><p>Be the first to share family news!</p></div>';
            return;
        }
        
        container.innerHTML = `
            <div class="blog-container">
                ${posts.map(post => `
                    <div class="blog-post ${post.featured ? 'featured' : ''}" onclick="viewBlogPost(${post.id})">
                        <h3>${post.title}</h3>
                        <div class="post-meta">
                            <span>By ${post.full_name || post.username}</span>
                            <span>${new Date(post.published_date).toLocaleDateString()}</span>
                            ${post.category ? `<span>${post.category}</span>` : ''}
                        </div>
                        <div class="post-content">${post.content}</div>
                        ${post.tags ? `
                            <div class="post-tags">
                                ${post.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading blog:', error);
        showNotification('Failed to load blog posts', 'error');
    }
}

async function viewBlogPost(postId) {
    try {
        const post = await API.getBlogPost(postId);
        const comments = await API.getComments('blog', postId);
        const currentUser = getCurrentUser();
        
        showModal(`
            <div class="blog-post-detail">
                <h1>${post.title}</h1>
                <div class="post-meta">
                    <span>By ${post.full_name || post.username}</span>
                    <span>${new Date(post.published_date).toLocaleDateString()}</span>
                    ${post.category ? `<span>${post.category}</span>` : ''}
                </div>
                ${post.tags ? `
                    <div class="post-tags">
                        ${post.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="post-content">${post.content}</div>
                <div class="comments-section">
                    <h3>Comments</h3>
                    <div id="blogComments">
                        ${comments.map(c => `
                            <div class="comment">
                                <strong>${c.full_name || c.username}</strong>
                                <p>${c.content}</p>
                                <small>${new Date(c.created_at).toLocaleString()}</small>
                            </div>
                        `).join('')}
                    </div>
                    ${currentUser ? `
                        <form id="blogCommentForm" onsubmit="addBlogComment(event, ${postId})">
                            <div class="form-group">
                                <textarea placeholder="Add a comment..." required></textarea>
                            </div>
                            <button type="submit" class="btn btn-sm">Post Comment</button>
                        </form>
                    ` : '<p>Login to comment</p>'}
                </div>
                ${currentUser && currentUser.id === post.author_id ? `
                    <div class="blog-actions">
                        <button class="btn btn-secondary" onclick="editBlogPost(${postId})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteBlogPost(${postId})">Delete</button>
                    </div>
                ` : ''}
            </div>
        `);
    } catch (error) {
        console.error('Error loading blog post:', error);
        showNotification('Failed to load blog post', 'error');
    }
}

async function addBlogComment(event, postId) {
    event.preventDefault();
    const form = event.target;
    const content = form.querySelector('textarea').value;
    
    try {
        await API.createComment({
            contentType: 'blog',
            contentId: postId,
            content
        });
        form.querySelector('textarea').value = '';
        viewBlogPost(postId);
        showNotification('Comment added!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to add comment', 'error');
    }
}

function showCreatePostModal() {
    showModal(`
        <h2>Create Blog Post</h2>
        <form id="createPostForm" onsubmit="createBlogPost(event)">
            <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" required>
            </div>
            <div class="form-group">
                <label>Content</label>
                <textarea name="content" rows="10" required></textarea>
            </div>
            <div class="form-group">
                <label>Category</label>
                <input type="text" name="category" placeholder="e.g., News, Update, Story">
            </div>
            <div class="form-group">
                <label>Tags (comma-separated)</label>
                <input type="text" name="tags" placeholder="e.g., family, vacation, birthday">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="featured"> Featured Post
                </label>
            </div>
            <button type="submit" class="btn btn-primary">Publish</button>
        </form>
    `);
}

async function createBlogPost(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        await API.createBlogPost({
            title: formData.get('title'),
            content: formData.get('content'),
            category: formData.get('category') || null,
            tags: formData.get('tags') || null,
            featured: formData.has('featured')
        });
        closeModal();
        loadBlogPage();
        showNotification('Post created!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to create post', 'error');
    }
}

async function editBlogPost(postId) {
    try {
        const post = await API.getBlogPost(postId);
        showModal(`
            <h2>Edit Blog Post</h2>
            <form id="editPostForm" onsubmit="updateBlogPost(event, ${postId})">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" value="${post.title}" required>
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea name="content" rows="10" required>${post.content}</textarea>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <input type="text" name="category" value="${post.category || ''}" placeholder="e.g., News, Update, Story">
                </div>
                <div class="form-group">
                    <label>Tags (comma-separated)</label>
                    <input type="text" name="tags" value="${post.tags || ''}" placeholder="e.g., family, vacation, birthday">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="featured" ${post.featured ? 'checked' : ''}> Featured Post
                    </label>
                </div>
                <button type="submit" class="btn btn-primary">Update</button>
            </form>
        `);
    } catch (error) {
        showNotification('Failed to load post for editing', 'error');
    }
}

async function updateBlogPost(event, postId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        await API.updateBlogPost(postId, {
            title: formData.get('title'),
            content: formData.get('content'),
            category: formData.get('category') || null,
            tags: formData.get('tags') || null,
            featured: formData.has('featured')
        });
        closeModal();
        loadBlogPage();
        showNotification('Post updated!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to update post', 'error');
    }
}

async function deleteBlogPost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    try {
        await API.deleteBlogPost(postId);
        closeModal();
        loadBlogPage();
        showNotification('Post deleted', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to delete post', 'error');
    }
}

// Make functions globally available
window.viewBlogPost = viewBlogPost;
window.addBlogComment = addBlogComment;
window.createBlogPost = createBlogPost;
window.editBlogPost = editBlogPost;
window.updateBlogPost = updateBlogPost;
window.deleteBlogPost = deleteBlogPost;
window.showCreatePostModal = showCreatePostModal;

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const createPostBtn = document.getElementById('createPostBtn');
    if (createPostBtn) {
        createPostBtn.addEventListener('click', showCreatePostModal);
    }
});

