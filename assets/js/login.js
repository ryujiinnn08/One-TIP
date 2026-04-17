document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    // Form validation
    loginForm.addEventListener('submit', function(e) {
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
        
        /*
        Backend Integration:
        POST /api/auth/login
        
        PHP Example:
        $sql = "SELECT id, username, first_name, last_name, email, password_hash 
                FROM users WHERE email = ? AND status = 'active'";
        if (password_verify($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            echo json_encode(['success' => true, 'redirect' => 'dashboard.html']);
        }
        */
        
        // Simulate login API call
        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store authentication data
                sessionStorage.setItem('auth_token', data.token);
                sessionStorage.setItem('user_id', data.user_id);
                sessionStorage.setItem('username', data.username);
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Show error message
                alert(data.message || 'Invalid email or password');
                loginBtn.textContent = 'Login now';
                loginBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            // For demo purposes, simulate successful login
            simulateSuccessfulLogin(email);
        });
    });
    
    function simulateSuccessfulLogin(email) {
        // Demo: Extract username from email for display
        const username = email.split('@')[0];
        
        // Store demo authentication data
        sessionStorage.setItem('auth_token', 'demo_token_' + Date.now());
        sessionStorage.setItem('user_id', 'demo_user_' + Math.floor(Math.random() * 1000));
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('email', email);
        
        console.log('Login: Stored username:', username);
        console.log('Login: Stored email:', email);
        
        // Redirect to dashboard after delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }
});
