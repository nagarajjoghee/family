const API_BASE = '/api';

class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (options.body && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        } else if (options.body) {
            delete config.headers['Content-Type'];
            config.body = options.body;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    static async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { username, password }
        });
    }

    static async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
    }

    static async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    static async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Photos
    static async getPhotos(albumId = null) {
        const endpoint = albumId ? `/photos?albumId=${albumId}` : '/photos';
        return this.request(endpoint);
    }

    static async getPhoto(id) {
        return this.request(`/photos/${id}`);
    }

    static getPhotoImage(id) {
        // Return full URL for image - not async since it's just string concatenation
        return `${API_BASE}/photos/${id}/image`;
    }

    static async uploadPhoto(photoData, file) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Create a custom request for file upload
        const url = `${API_BASE}/photos`;
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'X-Photo-Data': JSON.stringify(photoData)
            },
            body: file
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }
        
        return data;
    }

    static async deletePhoto(id) {
        return this.request(`/photos/${id}`, {
            method: 'DELETE'
        });
    }

    // Albums
    static async getAlbums() {
        return this.request('/albums');
    }

    static async getAlbum(id) {
        return this.request(`/albums/${id}`);
    }

    static async createAlbum(data) {
        return this.request('/albums', {
            method: 'POST',
            body: data
        });
    }

    static async updateAlbum(id, data) {
        return this.request(`/albums/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    static async deleteAlbum(id) {
        return this.request(`/albums/${id}`, {
            method: 'DELETE'
        });
    }

    // Blog
    static async getBlogPosts(category = null, featured = null) {
        let endpoint = '/blog';
        const params = [];
        if (category) params.push(`category=${category}`);
        if (featured) params.push(`featured=true`);
        if (params.length) endpoint += '?' + params.join('&');
        return this.request(endpoint);
    }

    static async getBlogPost(id) {
        return this.request(`/blog/${id}`);
    }

    static async createBlogPost(data) {
        return this.request('/blog', {
            method: 'POST',
            body: data
        });
    }

    static async updateBlogPost(id, data) {
        return this.request(`/blog/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    static async deleteBlogPost(id) {
        return this.request(`/blog/${id}`, {
            method: 'DELETE'
        });
    }

    // Calendar
    static async getEvents(startDate = null, endDate = null) {
        let endpoint = '/calendar';
        const params = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (params.length) endpoint += '?' + params.join('&');
        return this.request(endpoint);
    }

    static async getEvent(id) {
        return this.request(`/calendar/${id}`);
    }

    static async createEvent(data) {
        return this.request('/calendar', {
            method: 'POST',
            body: data
        });
    }

    static async updateEvent(id, data) {
        return this.request(`/calendar/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    static async deleteEvent(id) {
        return this.request(`/calendar/${id}`, {
            method: 'DELETE'
        });
    }

    static async rsvpToEvent(eventId, status) {
        return this.request(`/calendar/${eventId}/rsvp`, {
            method: 'POST',
            body: { status }
        });
    }

    // Profiles
    static async getProfiles() {
        return this.request('/profiles');
    }

    static async getProfile(id) {
        return this.request(`/profiles/${id}`);
    }

    static async updateProfile(id, data) {
        return this.request(`/profiles/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    // Messages
    static async getInbox() {
        return this.request('/messages/inbox');
    }

    static async getSent() {
        return this.request('/messages/sent');
    }

    static async getMessage(id) {
        return this.request(`/messages/${id}`);
    }

    static async sendMessage(data) {
        return this.request('/messages', {
            method: 'POST',
            body: data
        });
    }

    static async getUnreadCount() {
        return this.request('/messages/unread/count');
    }

    static async deleteMessage(id) {
        return this.request(`/messages/${id}`, {
            method: 'DELETE'
        });
    }

    // Comments
    static async getComments(contentType, contentId) {
        return this.request(`/comments?contentType=${contentType}&contentId=${contentId}`);
    }

    static async createComment(data) {
        return this.request('/comments', {
            method: 'POST',
            body: data
        });
    }

    static async deleteComment(id) {
        return this.request(`/comments/${id}`, {
            method: 'DELETE'
        });
    }
}

