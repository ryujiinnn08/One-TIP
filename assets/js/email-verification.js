document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('emailVerificationForm');
    const verificationCodeInput = document.getElementById('verificationCode');
    const verifyEmailBtn = document.getElementById('verifyEmailBtn');
    const resendCodeBtn = document.getElementById('resendCodeBtn');
    const timerElement = document.getElementById('timer');
    
    let timeLeft = 300; // 5 minutes in seconds
    let timerInterval;
    
    // Start countdown timer
    startTimer();
    
    // Load user email from session
    displayUserEmail();
    
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const code = verificationCodeInput.value.trim();
        if (code.length !== 6) {
            showMessage('Please enter a valid 6-digit code', 'error');
            return;
        }
        
        const email = sessionStorage.getItem('temp_user_email');
        if (!email) {
            showMessage('Session expired. Please register again.', 'error');
            setTimeout(() => { window.location.href = 'register.html'; }, 2000);
            return;
        }
        
        verifyEmailBtn.textContent = 'Verifying...';
        verifyEmailBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showMessage('Email verified successfully!', 'success');
                clearInterval(timerInterval);
                
                // Clean up temp data
                sessionStorage.removeItem('temp_user_id');
                
                // Redirect to username selection
                setTimeout(() => {
                    window.location.href = 'username-selection.html';
                }, 1500);
            } else {
                showMessage(data.error || 'Verification failed. Please try again.', 'error');
                verifyEmailBtn.textContent = 'Verify Email';
                verifyEmailBtn.disabled = false;
            }
        } catch (error) {
            console.error('Verification error:', error);
            showMessage('Unable to connect to server. Please try again.', 'error');
            verifyEmailBtn.textContent = 'Verify Email';
            verifyEmailBtn.disabled = false;
        }
    });
    
    resendCodeBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        await resendCode();
    });
    
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `Code expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerElement.textContent = 'Code expired — please resend';
                timerElement.style.color = '#e74c3c';
            }
        }, 1000);
    }
    
    async function resendCode() {
        const email = sessionStorage.getItem('temp_user_email');
        const userId = sessionStorage.getItem('temp_user_id');
        
        if (!email || !userId) {
            showMessage('Session expired. Please register again.', 'error');
            setTimeout(() => { window.location.href = 'register.html'; }, 2000);
            return;
        }
        
        resendCodeBtn.textContent = 'Sending...';
        resendCodeBtn.disabled = true;
        
        try {
            const response = await fetch('/api/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, user_id: userId })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('New verification code sent!', 'success');
                // Reset timer
                timeLeft = 300;
                timerElement.style.color = '';
                startTimer();
            } else {
                showMessage(data.error || 'Failed to resend code. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Resend error:', error);
            showMessage('Unable to connect to server.', 'error');
        }
        
        resendCodeBtn.textContent = 'Resend Code';
        resendCodeBtn.disabled = false;
    }
    
    function displayUserEmail() {
        const userEmail = sessionStorage.getItem('temp_user_email') || 'user@tip.edu.ph';
        const emailElement = document.getElementById('userEmail');
        if (emailElement) {
            emailElement.textContent = userEmail;
        }
    }
    
    function showMessage(text, type) {
        // Remove existing message
        const existing = document.querySelector('.verification-message');
        if (existing) existing.remove();
        
        const msg = document.createElement('div');
        msg.className = `verification-message ${type}`;
        msg.style.cssText = `
            padding: 12px 16px;
            border-radius: 8px;
            margin: 12px 0;
            font-size: 14px;
            text-align: center;
            ${type === 'error' 
                ? 'background: rgba(231, 76, 60, 0.15); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3);' 
                : 'background: rgba(46, 213, 115, 0.15); color: #2ed573; border: 1px solid rgba(46, 213, 115, 0.3);'
            }
        `;
        msg.textContent = text;
        
        emailForm.insertBefore(msg, emailForm.firstChild);
        
        // Auto-remove after 5s
        setTimeout(() => { if (msg.parentNode) msg.remove(); }, 5000);
    }
});
