document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const tipEmailInput = document.getElementById('tipEmail');
    const signupBtn = document.getElementById('signupBtn');

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        signupBtn.textContent = 'Creating account...';
        signupBtn.disabled = true;
        
        // Convert FormData to JSON payload
        const formData = new FormData(registerForm);
        const payload = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Success: store temporary data for setup-complete page
                sessionStorage.setItem('temp_user_email', payload.tip_email);
                sessionStorage.setItem('temp_user_name', payload.first_name);
                
                // Redirect
                window.location.href = 'setup-complete.html';
            } else {
                // Handle API error messages mapping
                if (data.error && data.error.includes('exists')) {
                    showError(tipEmailInput, data.error);
                } else {
                    alert('Registration failed: ' + (data.error || 'Unknown error'));
                }
                signupBtn.textContent = 'Sign up now';
                signupBtn.disabled = false;
            }
        } catch (error) {
            console.error('Registration API error:', error);
            alert('Unable to connect to the server. Please check your internet connection and try again. If the problem persists, contact support.');
            signupBtn.textContent = 'Sign up now';
            signupBtn.disabled = false;
        }
    });
    
    // Real-time email validation
    tipEmailInput.addEventListener('blur', function() {
        validateTipEmail(this.value);
    });
    
    // Real-time password confirmation
    confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch();
    });
    
    function validateForm() {
        const formData = new FormData(registerForm);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm_password');
        const tipEmail = formData.get('tip_email');
        const termsAgreement = formData.get('terms_agreement');
        
        if (!validateTipEmail(tipEmail)) {
            return false;
        }
        
        if (password !== confirmPassword) {
            showError(confirmPasswordInput, 'Passwords do not match');
            return false;
        }
        
        if (password.length < 8) {
            showError(passwordInput, 'Password must be at least 8 characters long');
            return false;
        }
        
        if (!termsAgreement) {
            alert('Please agree to the Terms of Service and Privacy Policy');
            return false;
        }
        
        return true;
    }
    
    function validateTipEmail(email) {
        if (!email.endsWith('@tip.edu.ph')) {
            showError(tipEmailInput, 'Please use your TiP email address (@tip.edu.ph)');
            return false;
        }
        clearError(tipEmailInput);
        return true;
    }
    
    function validatePasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
            showError(confirmPasswordInput, 'Passwords do not match');
        } else if (confirmPassword) {
            clearError(confirmPasswordInput);
        }
    }
    
    function showError(input, message) {
        input.classList.add('error');
        input.classList.remove('success');
        
        let errorDiv = input.parentNode.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            input.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }
    
    function clearError(input) {
        input.classList.remove('error');
        input.classList.add('success');
        
        const errorDiv = input.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
});
