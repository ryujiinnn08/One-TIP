/*
    edit-post.js
    Handles loading, rendering, and submitting existing post modifications.
*/

document.addEventListener('DOMContentLoaded', function() {
    const editModal = document.getElementById('editPostModal');
    const closeEditModal = document.getElementById('closeEditModal');
    const editFormContainer = document.getElementById('editPostFormContainer');
    
    let currentEditType = 'marketplace';
    let currentEditId = null;

    if (!editModal || !closeEditModal || !editFormContainer) {
        console.log('Edit post modal not found on this page');
        return;
    }

    closeEditModal.addEventListener('click', closeEditPostModal);
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditPostModal();
        }
    });

    // Global function to open the edit modal
    window.openEditPostModal = function(type, id) {
        if (!type || !id) return;
        currentEditType = type;
        currentEditId = id;
        
        editModal.style.display = 'block';
        
        if (type === 'service') {
            loadEditServiceForm(id);
        } else if (type === 'announcement') {
            loadEditAnnouncementForm(id);
        } else {
            loadEditMarketplaceForm(id);
        }
    };

    function loadEditMarketplaceForm(id) {
        editFormContainer.innerHTML = `
            <form id="editMarketplaceForm" class="create-post-form" action="backend/create-post.php" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="action" value="update_post">
                <input type="hidden" name="post_type" value="marketplace">
                <input type="hidden" name="post_id" value="${id}">
                <input type="hidden" name="csrf_token" value="">
                
                <div class="input-group">
                    <label for="editProductName">Product Name *</label>
                    <input type="text" id="editProductName" name="product_name" required maxlength="100">
                </div>
                
                <div class="form-row">
                    <div class="input-group half">
                        <label for="editPrice">Price (₱) *</label>
                        <input type="number" id="editPrice" name="price" min="0" step="0.01" required>
                    </div>
                    <div class="input-group half">
                        <label for="editCondition">Condition *</label>
                        <select id="editCondition" name="condition" required>
                            <option value="">Select condition</option>
                            <option value="new">Brand New</option>
                            <option value="like_new">Like New</option>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                        </select>
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="editCategory">Category *</label>
                    <select id="editCategory" name="category" required>
                        <option value="">Select category</option>
                        <option value="electronics">Electronics</option>
                        <option value="books">Books & Textbooks</option>
                        <option value="clothing">Clothing & Accessories</option>
                        <option value="furniture">Furniture</option>
                        <option value="sports">Sports & Recreation</option>
                        <option value="musical_instruments">Musical Instruments</option>
                        <option value="automotive">Automotive</option>
                        <option value="home_garden">Home & Garden</option>
                        <option value="art_crafts">Art & Crafts</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label for="editDescription">Description *</label>
                    <textarea id="editDescription" name="description" required rows="4" maxlength="1000"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancelEditMarketplaceBtn">Cancel</button>
                    <button type="submit" class="btn-primary" id="updateMarketplaceBtn">Update Post</button>
                </div>
            </form>
        `;

        const form = document.getElementById('editMarketplaceForm');
        form.addEventListener('submit', handleUpdateSubmit);
        const cancelBtn = document.getElementById('cancelEditMarketplaceBtn');
        if (cancelBtn) cancelBtn.addEventListener('click', closeEditPostModal);

        loadExistingPostData(id);
    }

    function loadEditServiceForm(id) {
        editFormContainer.innerHTML = `
            <form id="editServiceForm" class="create-post-form">
                <input type="hidden" name="action" value="update_post">
                <input type="hidden" name="post_type" value="service">
                <input type="hidden" name="post_id" value="${id}">
                
                <div class="input-group">
                    <label for="editServiceTitle">Service Title *</label>
                    <input type="text" id="editServiceTitle" name="service_title" required maxlength="100">
                </div>
                
                <div class="form-row">
                    <div class="input-group half">
                        <label for="editStartingPrice">Starting Price (₱) *</label>
                        <input type="number" id="editStartingPrice" name="starting_price" min="0" step="0.01" required>
                    </div>
                    <div class="input-group half">
                        <label for="editServiceCategory">Category *</label>
                        <select id="editServiceCategory" name="service_category" required>
                            <option value="">Select category</option>
                            <option value="tutoring">Tutoring & Education</option>
                            <option value="design">Graphic Design</option>
                            <option value="writing">Writing & Translation</option>
                            <option value="programming">Programming & Tech</option>
                            <option value="photography">Photography & Video</option>
                            <option value="music">Music & Audio</option>
                            <option value="business">Business & Marketing</option>
                            <option value="lifestyle">Lifestyle Services</option>
                            <option value="crafts">Arts & Crafts</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="editDeliveryTime">Delivery Time *</label>
                    <select id="editDeliveryTime" name="delivery_time" required>
                        <option value="">Select delivery time</option>
                        <option value="1_day">1 Day</option>
                        <option value="2_days">2 Days</option>
                        <option value="3_days">3 Days</option>
                        <option value="1_week">1 Week</option>
                        <option value="2_weeks">2 Weeks</option>
                        <option value="1_month">1 Month</option>
                        <option value="custom">Custom Timeline</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label for="editServiceDescription">Description *</label>
                    <textarea id="editServiceDescription" name="service_description" required rows="5" maxlength="1000"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancelEditServiceBtn">Cancel</button>
                    <button type="submit" class="btn-primary" id="updateServiceBtn">Update Post</button>
                </div>
            </form>
        `;

        const form = document.getElementById('editServiceForm');
        form.addEventListener('submit', handleUpdateSubmit);
        const cancelBtn = document.getElementById('cancelEditServiceBtn');
        if (cancelBtn) cancelBtn.addEventListener('click', closeEditPostModal);

        loadExistingPostData(id);
    }

    function loadEditAnnouncementForm(id) {
        editFormContainer.innerHTML = `
            <form id="editAnnouncementForm" class="create-post-form">
                <input type="hidden" name="action" value="update_post">
                <input type="hidden" name="post_type" value="announcement">
                <input type="hidden" name="post_id" value="${id}">

                <div class="input-group">
                    <label for="editAnnouncementTitle">Announcement Title *</label>
                    <input type="text" id="editAnnouncementTitle" name="title" required maxlength="100">
                </div>
                
                <div class="input-group">
                    <label for="editAnnouncementCategory">Category *</label>
                    <select id="editAnnouncementCategory" name="category" required>
                        <option value="">Select category...</option>
                        <option value="general">General Announcement</option>
                        <option value="urgent">Urgent Notice</option>
                        <option value="event">Event</option>
                        <option value="academic">Academic</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="holiday">Holiday/No Classes</option>
                        <option value="reminder">Reminder</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label for="editAnnouncementDescription">Announcement Details *</label>
                    <textarea id="editAnnouncementDescription" name="description" rows="6" required maxlength="1000"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancelEditAnnouncementBtn">Cancel</button>
                    <button type="submit" class="btn-primary" id="updateAnnouncementBtn">Update Announcement</button>
                </div>
            </form>
        `;

        const form = document.getElementById('editAnnouncementForm');
        form.addEventListener('submit', handleUpdateSubmit);
        const cancelBtn = document.getElementById('cancelEditAnnouncementBtn');
        if (cancelBtn) cancelBtn.addEventListener('click', closeEditPostModal);

        loadExistingPostData(id);
    }

    function loadExistingPostData(postId) {
        fetch('/api/posts/' + postId, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + (sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || ''),
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateFormWithData(data.post);
            }
        })
        .catch(error => {
            console.error('Error loading post data:', error);
        });
    }

    function populateFormWithData(postData) {
        if (currentEditType === 'marketplace') {
            const fields = {
                'productName': 'editProductName', 
                'price': 'editPrice', 
                'condition': 'editCondition', 
                'category': 'editCategory', 
                'description': 'editDescription'
            };
            for (let source in fields) {
                const el = document.getElementById(fields[source]);
                if (el && postData[source]) el.value = postData[source];
            }
        } else if (currentEditType === 'service') {
            const fields = {
                'serviceTitle': 'editServiceTitle', 
                'startingPrice': 'editStartingPrice', 
                'serviceCategory': 'editServiceCategory', 
                'deliveryTime': 'editDeliveryTime', 
                'serviceDescription': 'editServiceDescription'
            };
            for (let source in fields) {
                const el = document.getElementById(fields[source]);
                if (el && postData[source]) el.value = postData[source];
            }
        } else if (currentEditType === 'announcement') {
            const fields = {
                'announcementTitle': 'editAnnouncementTitle', 
                'announcementCategory': 'editAnnouncementCategory', 
                'announcementDescription': 'editAnnouncementDescription'
            };
            for (let source in fields) {
                const el = document.getElementById(fields[source]);
                if (el && postData[source]) el.value = postData[source];
            }
        }
    }

    async function handleUpdateSubmit(e) {
        e.preventDefault();
        
        const userId = sessionStorage.getItem('user_id');
        if (!userId) return;

        let title, category, description, price, condition_status;
        
        if (currentEditType === 'marketplace') {
            title = document.getElementById('editProductName').value;
            price = document.getElementById('editPrice').value;
            condition_status = document.getElementById('editCondition').value;
            category = document.getElementById('editCategory').value;
            description = document.getElementById('editDescription').value;
        } else if (currentEditType === 'service') {
            title = document.getElementById('editServiceTitle').value;
            price = document.getElementById('editStartingPrice').value;
            condition_status = null;
            category = document.getElementById('editServiceCategory').value;
            description = document.getElementById('editServiceDescription').value;
        } else if (currentEditType === 'announcement') {
            title = document.getElementById('editAnnouncementTitle').value;
            price = null;
            condition_status = null;
            category = document.getElementById('editAnnouncementCategory').value;
            description = document.getElementById('editAnnouncementDescription').value;
        }

        const formData = {
            post_id: currentEditId,
            user_id: userId,
            type: currentEditType,
            title: title,
            category: category,
            description: description,
            price: price,
            condition_status: condition_status
        };

        const submitBtn = document.querySelector('#editPostModal .btn-primary');
        if (submitBtn) submitBtn.textContent = 'Updating...';
        
        try {
            // Edit post handles NO new images right now as a simplification 
            // since the main concern was UI stacking.
            const response = await fetch('/api/posts/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (response.ok && data.success) {
                alert('✅ Post Successfully Updated!');
                closeEditPostModal();
                window.location.reload();
            } else {
                alert('Update failed: ' + data.error);
                if (submitBtn) submitBtn.textContent = 'Update Post';
            }
        } catch (error) {
            console.error(error);
            alert('Server disconnected.');
            if (submitBtn) submitBtn.textContent = 'Update Post';
        }
    }

    function closeEditPostModal() {
        if (editModal) editModal.style.display = 'none';
        currentEditId = null;
        if (editFormContainer) editFormContainer.innerHTML = '';
    }
});
