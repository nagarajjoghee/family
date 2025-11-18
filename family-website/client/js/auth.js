let currentUser = null;

async function checkAuth() {
    try {
        currentUser = await API.getCurrentUser();
        updateAuthUI();
        return true;
    } catch (error) {
        currentUser = null;
        updateAuthUI();
        return false;
    }
}

function updateAuthUI() {
    const authSection = document.getElementById('authSection');
    const userSection = document.getElementById('userSection');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        authSection.style.display = 'none';
        userSection.style.display = 'inline';
        userName.textContent = currentUser.fullName || currentUser.username;
        
        // Show authenticated-only buttons
        document.querySelectorAll('[style*="display: none"]').forEach(el => {
            if (el.id && (el.id.includes('Btn') || el.id.includes('create'))) {
                el.style.display = 'inline-block';
            }
        });
    } else {
        authSection.style.display = 'inline';
        userSection.style.display = 'none';
        
        // Hide authenticated-only buttons
        document.querySelectorAll('#createAlbumBtn, #uploadPhotoBtn, #createPostBtn, #createEventBtn, #composeMessageBtn').forEach(el => {
            el.style.display = 'none';
        });
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const result = await API.login(username, password);
        currentUser = result.user;
        updateAuthUI();
        showNotification('Login successful!', 'success');
        navigateToPage('home');
    } catch (error) {
        showNotification(error.message || 'Login failed', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const userData = {
        username: document.getElementById('regUsername').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        fullName: document.getElementById('regFullName').value,
        bio: document.getElementById('regBio').value,
        relationship: document.getElementById('regRelationship').value
    };
    
    try {
        const result = await API.register(userData);
        showNotification('Registration successful! Please login.', 'success');
        navigateToPage('login');
    } catch (error) {
        showNotification(error.message || 'Registration failed', 'error');
    }
}

async function handleLogout() {
    try {
        await API.logout();
        currentUser = null;
        updateAuthUI();
        showNotification('Logged out successfully', 'success');
        navigateToPage('home');
    } catch (error) {
        showNotification('Logout failed', 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getCurrentUser() {
    return currentUser;
}

// Make functions globally available
window.getCurrentUser = getCurrentUser;
window.showNotification = showNotification;

// Initialize auth on load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutLink = document.getElementById('logoutLink');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
});

