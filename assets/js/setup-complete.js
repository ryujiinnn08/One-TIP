document.addEventListener('DOMContentLoaded', function() {
    const getStartedBtn = document.getElementById('getStartedBtn');
    
    // Personalize the page with registration data
    personalizeWelcomePage();
    
    getStartedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        getStartedBtn.textContent = 'Starting...';
        
        setTimeout(() => {
            window.location.href = 'email-verification.html';
        }, 1000);
    });
    
    function personalizeWelcomePage() {
        // Get stored registration data
        const userEmail = sessionStorage.getItem('temp_user_email');
        const userName = sessionStorage.getItem('temp_user_name');
        
        // Update email display
        const emailElement = document.getElementById('registeredEmail');
        if (emailElement && userEmail) {
            emailElement.textContent = userEmail;
        }
        
        // Update welcome message with user's name
        if (userName) {
            const titleElement = document.querySelector('h2');
            if (titleElement) {
                titleElement.textContent = `Thank you for registering, ${userName}!`;
            }
        }
    }
});
