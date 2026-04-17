document.addEventListener('DOMContentLoaded', function() {
    const editProfileForm = document.getElementById('editProfileForm');
    const profilePhotoInput = document.getElementById('profilePhoto');
    const currentProfilePhoto = document.getElementById('currentProfilePhoto');
    const bioTextarea = document.getElementById('editBio');
    const bioCount = document.getElementById('bioCount');
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    // Load current user data
    loadCurrentProfile();
    
    // Photo upload preview
    profilePhotoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('Image must be smaller than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                currentProfilePhoto.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Bio character counter
    bioTextarea.addEventListener('input', function() {
        const count = this.value.length;
        bioCount.textContent = `${count}/500 characters`;
        
        if (count > 450) {
            bioCount.style.color = '#dc3545';
        } else {
            bioCount.style.color = '#666';
        }
    });
    
    // Form submission
    editProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        saveProfileBtn.textContent = 'Saving...';
        saveProfileBtn.disabled = true;
        
        // Simulate saving profile
        setTimeout(() => {
            alert('Profile updated successfully!');
            window.location.href = 'dashboard.html';
        }, 1500);
    });
    
    function loadCurrentProfile() {
        // Load user data from session storage or make API call
        const username = sessionStorage.getItem('username') || 'user';
        const email = sessionStorage.getItem('email') || 'user@tip.edu.ph';
        
        // Populate form with current data
        document.getElementById('editUsername').value = username;
        document.getElementById('editEmail').value = email;
        
        // Set default values (in real app, these would come from API)
        document.getElementById('editFirstName').value = 'John';
        document.getElementById('editLastName').value = 'Doe';
        document.getElementById('editDepartment').value = 'college_of_computer_science';
        document.getElementById('editCampus').value = 'arlegui';
        document.getElementById('editBio').value = '';
        
        // Trigger bio counter
        bioTextarea.dispatchEvent(new Event('input'));
    }
});
