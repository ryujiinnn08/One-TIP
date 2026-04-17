/*
Shared authentication utilities
Used across multiple pages
*/

document.addEventListener('DOMContentLoaded', function () {
    // Check authentication on page load
    if (!isUserAuthenticated()) {
        const currentPage = window.location.pathname.split('/').pop();
        const publicPages = ['index.html', 'register.html', 'forgot-password.html', 'setup-complete.html', 'email-verification.html', 'username-selection.html', ''];

        if (!publicPages.includes(currentPage) && currentPage !== 'marketplace.html') {
            console.warn('User not authenticated, redirecting to login');
            window.location.href = 'index.html';
        }
    }
});

function isUserAuthenticated() {
    const authToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
    const userId = sessionStorage.getItem('user_id') || localStorage.getItem('user_id');

    return !!(authToken && userId);
}

function getAuthToken() {
    return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || '';
}

function getCurrentUserId() {
    return sessionStorage.getItem('user_id') || localStorage.getItem('user_id');
}

function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

