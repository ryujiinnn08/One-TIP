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
                            <option value="Brand New">Brand New</option>
                            <option value="Like New">Like New</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                        </select>
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="editCategory">Category *</label>
                    <select id="editCategory" name="category" required>
                        <option value="">Select category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Books & Notes">Books & Notes</option>
                        <option value="Clothing">Clothing</option>
                        <option value="School Supplies">School Supplies</option>
                        <option value="Food & Beverages">Food & Beverages</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label for="editDescription">Description *</label>
                    <textarea id="editDescription" name="description" required rows="4" maxlength="1000"></textarea>
                </div>
                
                <div class="input-group">
                    <label for="editImages">Upload New Images (Optional - Replaces Old)</label>
                    <div class="upload-area" id="editUploadArea">
                        <div class="upload-icon">
                            <img src="Images/folder-icon.svg" alt="Upload" style="width: 48px; height: 48px; filter: brightness(0) saturate(100%) invert(50%);">
                        </div>
                        <p>Click to upload or drag and drop</p>
                        <small>PNG, JPG, GIF up to 10MB (Max 5 images)</small>
                        <input type="file" id="editImages" name="images[]" multiple accept="image/*" style="display: none;">
                    </div>
                    <div class="image-preview" id="editImagePreview"></div>
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
        
        const uploadArea = document.getElementById('editUploadArea');
        const fileInput = document.getElementById('editImages');
        if (uploadArea && fileInput) setupFileUpload(uploadArea, fileInput, 'editImagePreview');

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
                            <option value="Tutoring">Tutoring</option>
                            <option value="Design & Creative">Design & Creative</option>
                            <option value="Tech & Programming">Tech & Programming</option>
                            <option value="Writing & Editing">Writing & Editing</option>
                            <option value="Errands & Delivery">Errands & Delivery</option>
                            <option value="Others">Others</option>
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
                
                <div class="input-group">
                    <label for="editServiceImages">Upload New Images (Optional - Replaces Old)</label>
                    <div class="upload-area" id="editServiceUploadArea">
                        <div class="upload-icon">
                            <img src="Images/folder-icon.svg" alt="Upload" style="width: 48px; height: 48px; filter: brightness(0) saturate(100%) invert(50%);">
                        </div>
                        <p>Click to upload or drag and drop</p>
                        <small>PNG, JPG, GIF up to 10MB (Max 5 images)</small>
                        <input type="file" id="editServiceImages" name="service_images[]" multiple accept="image/*" style="display: none;">
                    </div>
                    <div class="image-preview" id="editServiceImagePreview"></div>
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

        const uploadArea = document.getElementById('editServiceUploadArea');
        const fileInput = document.getElementById('editServiceImages');
        if (uploadArea && fileInput) setupFileUpload(uploadArea, fileInput, 'editServiceImagePreview');

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
        // Pass the type so the backend queries the correct table
        fetch(`/api/posts/${postId}?type=${currentEditType}`, {
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
            // API returns: title, price, condition, category_name, description
            const titleEl = document.getElementById('editProductName');
            const priceEl = document.getElementById('editPrice');
            const conditionEl = document.getElementById('editCondition');
            const categoryEl = document.getElementById('editCategory');
            const descEl = document.getElementById('editDescription');

            if (titleEl && postData.title) titleEl.value = postData.title;
            if (priceEl && postData.price != null) priceEl.value = postData.price;
            if (conditionEl && postData.condition) conditionEl.value = postData.condition;
            if (categoryEl && postData.category_name) categoryEl.value = postData.category_name;
            if (descEl && postData.description) descEl.value = postData.description;

        } else if (currentEditType === 'service') {
            // API returns: title, starting_price, category_name, delivery_time, description
            const titleEl = document.getElementById('editServiceTitle');
            const priceEl = document.getElementById('editStartingPrice');
            const categoryEl = document.getElementById('editServiceCategory');
            const deliveryEl = document.getElementById('editDeliveryTime');
            const descEl = document.getElementById('editServiceDescription');

            if (titleEl && postData.title) titleEl.value = postData.title;
            if (priceEl && postData.starting_price != null) priceEl.value = postData.starting_price;
            if (categoryEl && postData.category_name) categoryEl.value = postData.category_name;
            if (deliveryEl && postData.delivery_time) deliveryEl.value = postData.delivery_time;
            if (descEl && postData.description) descEl.value = postData.description;

        } else if (currentEditType === 'announcement') {
            const titleEl = document.getElementById('editAnnouncementTitle');
            const categoryEl = document.getElementById('editAnnouncementCategory');
            const descEl = document.getElementById('editAnnouncementDescription');

            if (titleEl && postData.title) titleEl.value = postData.title;
            if (categoryEl && postData.category) categoryEl.value = postData.category;
            if (descEl && postData.description) descEl.value = postData.description;
        }
    }

    function setupFileUpload(uploadArea, fileInput, previewContainerId) {
        uploadArea.addEventListener('click', () => fileInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            handleFileSelection(e.dataTransfer.files, previewContainerId);
        });
        
        fileInput.addEventListener('change', (e) => {
            handleFileSelection(e.target.files, previewContainerId);
        });
    }

    function handleFileSelection(files, previewContainerId) {
        const previewContainer = document.getElementById(previewContainerId);
        if (!previewContainer) return;

        const maxFiles = 5;
        
        if (files.length > maxFiles) {
            alert(`You can only upload up to ${maxFiles} images`);
            return;
        }
        
        previewContainer.innerHTML = '';
        
        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('image/')) {
                alert(`File ${file.name} is not an image`);
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) {
                alert(`File ${file.name} is larger than 10MB`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'image-preview-item';
                imageDiv.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <button type="button" class="remove-image" data-index="${index}">×</button>
                `;
                previewContainer.appendChild(imageDiv);
            };
            reader.readAsDataURL(file);
        });
        
        previewContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-image')) {
                e.target.parentElement.remove();
            }
        });
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    async function handleUpdateSubmit(e) {
        e.preventDefault();
        
        const userId = sessionStorage.getItem('user_id');
        if (!userId) return;

        let title, category, description, price, condition;
        
        if (currentEditType === 'marketplace') {
            title = document.getElementById('editProductName').value;
            price = document.getElementById('editPrice').value;
            condition = document.getElementById('editCondition').value;
            category = document.getElementById('editCategory').value;
            description = document.getElementById('editDescription').value;
        } else if (currentEditType === 'service') {
            title = document.getElementById('editServiceTitle').value;
            price = document.getElementById('editStartingPrice').value;
            condition = null;
            category = document.getElementById('editServiceCategory').value;
            description = document.getElementById('editServiceDescription').value;
        } else if (currentEditType === 'announcement') {
            title = document.getElementById('editAnnouncementTitle').value;
            price = null;
            condition = null;
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
            condition: condition
        };
        
        // Add delivery_time for services
        if (currentEditType === 'service') {
            formData.delivery_time = document.getElementById('editDeliveryTime').value;
        }

        let imageInput = null;
        if (currentEditType === 'marketplace') {
            imageInput = document.getElementById('editImages');
        } else if (currentEditType === 'service') {
            imageInput = document.getElementById('editServiceImages');
        }
        
        if (imageInput && imageInput.files.length > 0) {
            const base64Images = [];
            for (let i = 0; i < Math.min(imageInput.files.length, 5); i++) {
                base64Images.push(await toBase64(imageInput.files[i]));
            }
            formData.images = base64Images;
        }

        const submitBtn = document.querySelector('#editPostModal .btn-primary');
        if (submitBtn) submitBtn.textContent = 'Updating...';
        
        try {
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
