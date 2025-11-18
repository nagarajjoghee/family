let currentPage = 'home';

function navigateToPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
    });
    
    // Show selected page
    const pageElement = document.getElementById(`${page}Page`);
    if (pageElement) {
        pageElement.style.display = 'block';
        currentPage = page;
        
        // Load page-specific content
        loadPageContent(page);
    }
}

function loadPageContent(page) {
    switch(page) {
        case 'photos':
            loadPhotosPage();
            break;
        case 'blog':
            loadBlogPage();
            break;
        case 'calendar':
            loadCalendarPage();
            break;
        case 'profiles':
            loadProfilesPage();
            break;
        case 'messages':
            loadMessagesPage();
            break;
    }
}

// Navigation event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Handle nav links
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Handle buttons with data-page
    document.querySelectorAll('[data-page]').forEach(btn => {
        if (btn.tagName !== 'A') {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = btn.getAttribute('data-page');
                navigateToPage(page);
            });
        }
    });
    
    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});

