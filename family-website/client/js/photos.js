let currentAlbumId = null;

async function loadPhotosPage() {
    await loadAlbums();
    await loadPhotos(currentAlbumId);
}

async function loadAlbums() {
    try {
        const albums = await API.getAlbums();
        const container = document.getElementById('albumsContainer');
        
        if (albums.length === 0) {
            container.innerHTML = '<p>No albums yet. Create one to get started!</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="albums-grid">
                ${albums.map(album => `
                    <div class="album-card" data-album-id="${album.id}">
                        <h3>${album.name}</h3>
                        <p>${album.description || ''}</p>
                        <p class="album-meta">${album.photo_count || 0} photos</p>
                        <button class="btn btn-sm" onclick="viewAlbum(${album.id})">View</button>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading albums:', error);
    }
}

async function loadPhotos(albumId = null) {
    try {
        const photos = await API.getPhotos(albumId);
        const container = document.getElementById('photosContainer');
        
        console.log('Loaded photos:', photos.length, photos);
        
        if (photos.length === 0) {
            container.innerHTML = '<p>No photos yet.</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="photos-grid">
                ${photos.map(photo => {
                    const imageUrl = API.getPhotoImage(photo.id);
                    console.log(`Photo ${photo.id} image URL:`, imageUrl);
                    // Add timestamp to prevent caching issues
                    const cacheBuster = `?t=${Date.now()}`;
                    return `
                    <div class="photo-card" data-photo-id="${photo.id}">
                        <img src="${imageUrl}${cacheBuster}" 
                             alt="${photo.title || 'Photo'}" 
                             onclick="viewPhoto(${photo.id})"
                             onerror="console.error('Image load error for photo ${photo.id}, URL: ${imageUrl}'); this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect width=\'200\' height=\'200\' fill=\'%23ddd\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\'%3EImage not found%3C/text%3E%3C/svg%3E';"
                             onload="console.log('Image loaded successfully for photo ${photo.id}');"
                             loading="lazy">
                        <div class="photo-info">
                            <h4>${photo.title || 'Untitled'}</h4>
                            <p>${photo.description || ''}</p>
                            <p class="photo-meta">By ${photo.full_name || photo.username}</p>
                            ${getCurrentUser() && (getCurrentUser().id === photo.uploaded_by || getCurrentUser().username === 'admin') ? `
                                <button class="btn btn-danger btn-sm" onclick="deletePhoto(${photo.id}, event)" style="margin-top: 0.5rem;">Delete</button>
                            ` : ''}
                        </div>
                    </div>
                `;
                }).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading photos:', error);
        showNotification('Failed to load photos: ' + error.message, 'error');
    }
}

function viewAlbum(albumId) {
    currentAlbumId = albumId;
    loadPhotos(albumId);
}

async function viewPhoto(photoId) {
    try {
        const photo = await API.getPhoto(photoId);
        const comments = await API.getComments('photo', photoId);
        
        const imageUrl = API.getPhotoImage(photoId);
        const cacheBuster = `?t=${Date.now()}`;
        showModal(`
            <div class="photo-viewer">
                <img src="${imageUrl}${cacheBuster}" 
                     alt="${photo.title || 'Photo'}"
                     onerror="console.error('Image load error in modal for photo ${photoId}, URL: ${imageUrl}'); this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\'%3E%3Crect width=\'400\' height=\'400\' fill=\'%23ddd\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\'%3EImage not found%3C/text%3E%3C/svg%3E';"
                     onload="console.log('Image loaded in modal for photo ${photoId}');">
                <div class="photo-details">
                    <h2>${photo.title || 'Untitled'}</h2>
                    <p>${photo.description || ''}</p>
                    <p class="meta">By ${photo.full_name || photo.username} on ${new Date(photo.created_at).toLocaleDateString()}</p>
                    <div class="comments-section">
                        <h3>Comments</h3>
                        <div id="photoComments">
                            ${comments.map(c => `
                                <div class="comment">
                                    <strong>${c.full_name || c.username}</strong>
                                    <p>${c.content}</p>
                                    <small>${new Date(c.created_at).toLocaleString()}</small>
                                </div>
                            `).join('')}
                        </div>
                        ${getCurrentUser() ? `
                            <form id="photoCommentForm" onsubmit="addPhotoComment(event, ${photoId})">
                                <textarea placeholder="Add a comment..." required></textarea>
                                <button type="submit" class="btn btn-sm">Post Comment</button>
                            </form>
                        ` : '<p>Login to comment</p>'}
                    </div>
                    ${getCurrentUser() && (getCurrentUser().id === photo.uploaded_by || getCurrentUser().username === 'admin') ? `
                        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
                            <button class="btn btn-danger" onclick="deletePhoto(${photoId}, event)">Delete Photo</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `);
    } catch (error) {
        console.error('Error loading photo:', error);
    }
}

async function addPhotoComment(event, photoId) {
    event.preventDefault();
    const form = event.target;
    const content = form.querySelector('textarea').value;
    
    try {
        await API.createComment({
            contentType: 'photo',
            contentId: photoId,
            content
        });
        form.querySelector('textarea').value = '';
        viewPhoto(photoId);
    } catch (error) {
        showNotification(error.message || 'Failed to add comment', 'error');
    }
}

function showCreateAlbumModal() {
    showModal(`
        <h2>Create Album</h2>
        <form id="createAlbumForm" onsubmit="createAlbum(event)">
            <div class="form-group">
                <label>Album Name</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Create</button>
        </form>
    `);
}

async function createAlbum(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        await API.createAlbum({
            name: formData.get('name'),
            description: formData.get('description')
        });
        closeModal();
        loadAlbums();
        showNotification('Album created!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to create album', 'error');
    }
}

function showUploadPhotoModal() {
    showModal(`
        <h2>Upload Photo</h2>
        <form id="uploadPhotoForm" onsubmit="uploadPhoto(event)">
            <div class="form-group">
                <label>Select Album</label>
                <select name="albumId" id="albumSelect"></select>
            </div>
            <div class="form-group">
                <label>Title</label>
                <input type="text" name="title">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Photo</label>
                <input type="file" name="photo" accept="image/*" required>
            </div>
            <button type="submit" class="btn btn-primary">Upload</button>
        </form>
    `);
    
    // Load albums for select
    API.getAlbums().then(albums => {
        const select = document.getElementById('albumSelect');
        select.innerHTML = '<option value="">No Album</option>' + 
            albums.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    });
}

async function uploadPhoto(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const file = formData.get('photo');
    
    if (!file) {
        showNotification('Please select a photo', 'error');
        return;
    }
    
    try {
        const albumId = formData.get('albumId');
        await API.uploadPhoto({
            title: formData.get('title') || null,
            description: formData.get('description') || null,
            albumId: albumId ? parseInt(albumId) : null
        }, file);
        
        closeModal();
        await loadPhotos(currentAlbumId);
        showNotification('Photo uploaded!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to upload photo', 'error');
    }
}

async function deletePhoto(photoId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
        return;
    }
    
    try {
        await API.deletePhoto(photoId);
        closeModal();
        await loadPhotos(currentAlbumId);
        showNotification('Photo deleted successfully', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to delete photo', 'error');
    }
}

// Make functions globally available
window.viewAlbum = viewAlbum;
window.viewPhoto = viewPhoto;
window.addPhotoComment = addPhotoComment;
window.createAlbum = createAlbum;
window.uploadPhoto = uploadPhoto;
window.deletePhoto = deletePhoto;
window.showCreateAlbumModal = showCreateAlbumModal;
window.showUploadPhotoModal = showUploadPhotoModal;

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const createAlbumBtn = document.getElementById('createAlbumBtn');
    if (createAlbumBtn) {
        createAlbumBtn.addEventListener('click', showCreateAlbumModal);
    }
    
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    if (uploadPhotoBtn) {
        uploadPhotoBtn.addEventListener('click', showUploadPhotoModal);
    }
});

