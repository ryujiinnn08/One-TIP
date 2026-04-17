document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const tipEmailInput = document.getElementById('tipEmail');
    const signupBtn = document.getElementById('signupBtn');

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        signupBtn.textContent = 'Creating account...';
        signupBtn.disabled = true;
        
        /*
        Backend Integration:
        POST /api/auth/register
        
        PHP Example:
        $sql = "INSERT INTO users (first_name, last_name, email, student_number, department, password_hash, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())";
        
        After successful registration:
        - Send email verification code
        - Store temporary user data in session
        - Redirect to setup-complete.html
        */
        
        // For now, go directly to setup-complete (skipping security verification)
        setTimeout(() => {
            // Store registration data temporarily
            sessionStorage.setItem('temp_user_email', tipEmailInput.value);
            sessionStorage.setItem('temp_user_name', document.getElementById('firstName').value);
            
            window.location.href = 'setup-complete.html';
        }, 1500);
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
