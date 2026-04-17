document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    // Form validation
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Show loading state
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store auth facts locally
                sessionStorage.setItem('auth_token', data.token || 'real_token_stub');
                sessionStorage.setItem('user_id', data.user.id);
                sessionStorage.setItem('username', data.user.username);
                sessionStorage.setItem('email', data.user.email);
                sessionStorage.setItem('first_name', data.user.first_name);

                // Send them to dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert(data.error || 'Invalid email or password');
                loginBtn.textContent = 'Login now';
                loginBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login API error:', error);
            alert('Unable to connect to the server. Please check your internet connection and try again. If the problem persists, contact support.');
            loginBtn.textContent = 'Login now';
            loginBtn.disabled = false;
        }
    });

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }
});
