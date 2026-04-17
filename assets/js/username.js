document.addEventListener('DOMContentLoaded', function() {
    const usernameForm = document.getElementById('usernameForm');
    const usernameInput = document.getElementById('username');
    const usernameStatus = document.getElementById('usernameStatus');
    const completeSetupBtn = document.getElementById('completeSetupBtn');
    
    let debounceTimer;
    
    usernameInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            validateUsername(this.value);
        }, 500);
    });
    
    usernameForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        if (!isValidUsername(username)) {
            return;
        }
        
        completeSetupBtn.textContent = 'Setting up...';
        completeSetupBtn.disabled = true;
        
        // Redirect to dashboard after username setup
        setTimeout(() => {
            // Store user session data (this would normally come from backend)
            sessionStorage.setItem('auth_token', 'demo_token_' + Date.now());
            sessionStorage.setItem('user_id', 'demo_user_1');
            sessionStorage.setItem('username', username);
            
            window.location.href = 'dashboard.html';
        }, 1500);
    });
    
    function validateUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        
        if (!username) {
            usernameStatus.textContent = '';
            usernameStatus.className = 'status-message';
            return;
        }
        
        if (!usernameRegex.test(username)) {
            usernameStatus.textContent = 'Username must be 3-20 characters, letters, numbers, and underscores only';
            usernameStatus.className = 'status-message error';
            return false;
        }
        
        // Simulate username availability check
        setTimeout(() => {
            usernameStatus.textContent = '✓ Username is available';
            usernameStatus.className = 'status-message success';
            completeSetupBtn.textContent = `Complete setup with @${username}`;
        }, 500);
        
        return true;
    }
    
    function isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }
});
