async function loadProfilesPage() {
    try {
        const profiles = await API.getProfiles();
        const container = document.getElementById('profilesContainer');
        
        if (profiles.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No family members yet</h3><p>Register to join the family!</p></div>';
            return;
        }
        
        container.innerHTML = `
            <div class="profiles-container">
                ${profiles.map(profile => `
                    <div class="profile-card" onclick="viewProfile(${profile.id})">
                        ${profile.profile_photo ? 
                            `<img src="${profile.profile_photo}" alt="${profile.full_name || profile.username}" class="profile-photo">` :
                            `<div class="profile-photo" style="background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">
                                ${(profile.full_name || profile.username).charAt(0).toUpperCase()}
                            </div>`
                        }
                        <h3>${profile.full_name || profile.username}</h3>
                        ${profile.relationship ? `<p class="profile-relationship">${profile.relationship}</p>` : ''}
                        ${profile.bio ? `<p class="profile-bio">${profile.bio.substring(0, 100)}${profile.bio.length > 100 ? '...' : ''}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading profiles:', error);
        showNotification('Failed to load profiles', 'error');
    }
}

async function viewProfile(userId) {
    try {
        const profile = await API.getProfile(userId);
        const currentUser = getCurrentUser();
        const isOwnProfile = currentUser && currentUser.id === userId;
        
        showModal(`
            <div class="profile-detail">
                <div class="profile-detail-header">
                    ${profile.profile_photo ? 
                        `<img src="${profile.profile_photo}" alt="${profile.full_name || profile.username}">` :
                        `<div style="width: 150px; height: 150px; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
                            ${(profile.full_name || profile.username).charAt(0).toUpperCase()}
                        </div>`
                    }
                    <div class="profile-detail-info">
                        <h2>${profile.full_name || profile.username}</h2>
                        ${profile.relationship ? `<p class="profile-relationship">${profile.relationship}</p>` : ''}
                        ${profile.email ? `<p style="color: var(--text-light);">${profile.email}</p>` : ''}
                        ${profile.bio ? `<p class="profile-bio">${profile.bio}</p>` : ''}
                        <div class="profile-stats">
                            <div class="profile-stat">
                                <span class="stat-number">${profile.stats?.photos || 0}</span>
                                <span class="stat-label">Photos</span>
                            </div>
                            <div class="profile-stat">
                                <span class="stat-number">${profile.stats?.posts || 0}</span>
                                <span class="stat-label">Posts</span>
                            </div>
                            <div class="profile-stat">
                                <span class="stat-number">${profile.stats?.events || 0}</span>
                                <span class="stat-label">Events</span>
                            </div>
                        </div>
                    </div>
                </div>
                ${isOwnProfile ? `
                    <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
                        <button class="btn btn-primary" onclick="editProfile(${userId})">Edit Profile</button>
                    </div>
                ` : ''}
            </div>
        `);
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile', 'error');
    }
}

async function editProfile(userId) {
    try {
        const profile = await API.getProfile(userId);
        
        showModal(`
            <h2>Edit Profile</h2>
            <form id="editProfileForm" onsubmit="updateProfile(event, ${userId})">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" name="fullName" value="${profile.full_name || ''}">
                </div>
                <div class="form-group">
                    <label>Bio</label>
                    <textarea name="bio" rows="5">${profile.bio || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Relationship</label>
                    <input type="text" name="relationship" value="${profile.relationship || ''}" placeholder="e.g., Mother, Father, Son, Daughter">
                </div>
                <div class="form-group">
                    <label>Profile Photo URL</label>
                    <input type="url" name="profilePhoto" value="${profile.profile_photo || ''}" placeholder="https://example.com/photo.jpg">
                </div>
                <button type="submit" class="btn btn-primary">Update Profile</button>
            </form>
        `);
    } catch (error) {
        showNotification('Failed to load profile for editing', 'error');
    }
}

async function updateProfile(event, userId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        await API.updateProfile(userId, {
            fullName: formData.get('fullName') || null,
            bio: formData.get('bio') || null,
            relationship: formData.get('relationship') || null,
            profilePhoto: formData.get('profilePhoto') || null
        });
        closeModal();
        loadProfilesPage();
        showNotification('Profile updated!', 'success');
        
        // Refresh current user data
        if (getCurrentUser() && getCurrentUser().id === userId) {
            await checkAuth();
        }
    } catch (error) {
        showNotification(error.message || 'Failed to update profile', 'error');
    }
}

// Make functions globally available
window.viewProfile = viewProfile;
window.editProfile = editProfile;
window.updateProfile = updateProfile;

