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
    
    emailForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const code = verificationCodeInput.value.trim();
        if (code.length !== 6) {
            alert('Please enter a valid 6-digit code');
            return;
        }
        
        verifyEmailBtn.textContent = 'Verifying...';
        verifyEmailBtn.disabled = true;
        
        // Simulate verification
        setTimeout(() => {
            window.location.href = 'username-selection.html';
        }, 1500);
    });
    
    resendCodeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resendCode();
    });
    
    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `Code expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerElement.textContent = 'Code expired';
                resendCodeBtn.style.display = 'block';
            }
        }, 1000);
    }
    
    function resendCode() {
        // Reset timer
        timeLeft = 300;
        startTimer();
        
        // Show resending message
        resendCodeBtn.textContent = 'Sending...';
        resendCodeBtn.disabled = true;
        
        setTimeout(() => {
            resendCodeBtn.textContent = 'Resend Code';
            resendCodeBtn.disabled = false;
        }, 2000);
    }
    
    function displayUserEmail() {
        const userEmail = sessionStorage.getItem('temp_user_email') || 'user@tip.edu.ph';
        const emailElement = document.getElementById('userEmail');
        if (emailElement) {
            emailElement.textContent = userEmail;
        }
    }
});
