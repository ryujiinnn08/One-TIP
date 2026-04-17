/*
Backend Integration Notes:
- POST /api/posts/create for creating new posts
- POST /api/posts/{id}/update for editing existing posts
- POST /api/upload/image for image uploads
- GET /api/posts/{id} for loading existing post data
*/

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('createPostModal');
    const closeModal = document.getElementById('closeModal');
    const postTypeButtons = document.querySelectorAll('.post-type-btn');
    const formContainer = document.getElementById('createPostForm');
    
    let currentPostType = 'marketplace';
    let editingPostId = null;
    let portfolioItems = [];

    // Only set up handlers if modal exists
    if (!modal || !closeModal || !formContainer) {
        console.log('Create post modal not found on this page');
        return;
    }

    // Modal controls
    closeModal.addEventListener('click', closeCreatePostModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCreatePostModal();
        }
    });

    // Post type selection
    postTypeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            postTypeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPostType = this.dataset.type;
            loadCreatePostForm(currentPostType, editingPostId);
        });
    });

    // Global function to load create post form
    window.loadCreatePostForm = function(type = 'marketplace', editId = null) {
        currentPostType = type;
        editingPostId = editId;
        
        // Update active button
        postTypeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        if (type === 'service') {
            loadServiceForm(editId);
        } else if (type === 'announcement') {
            loadAnnouncementForm(editId);
        } else {
            loadMarketplaceForm(editId);
        }
    };

    function loadMarketplaceForm(editId = null) {
        const isEditing = editId !== null;
        
        formContainer.innerHTML = `
            <form id="marketplaceForm" class="create-post-form" action="backend/create-post.php" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="action" value="${isEditing ? 'update_post' : 'create_post'}">
                <input type="hidden" name="post_type" value="marketplace">
                <input type="hidden" name="post_id" value="${editId || ''}">
                <input type="hidden" name="csrf_token" id="csrfTokenMarketplace" value="">
                
                <div class="input-group">
                    <label for="productName">Product Name *</label>
                    <input type="text" id="productName" name="product_name" placeholder="Enter product name" required maxlength="100">
                </div>
                
                <div class="form-row">
                    <div class="input-group half">
                        <label for="price">Price (₱) *</label>
                        <input type="number" id="price" name="price" placeholder="0.00" min="0" step="0.01" required>
                    </div>
                    <div class="input-group half">
                        <label for="condition">Condition *</label>
                        <select id="condition" name="condition" required>
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
                    <label for="category">Category *</label>
                    <select id="category" name="category" required>
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
                    <label for="description">Description *</label>
                    <textarea id="description" name="description" placeholder="Describe your item or service in detail" required rows="4" maxlength="1000"></textarea>
                </div>
                
                <div class="input-group">
                    <label for="images">Upload Images</label>
                    <div class="upload-area" id="uploadArea">
                        <div class="upload-icon">
                            <img src="Images/folder-icon.svg" alt="Upload" style="width: 48px; height: 48px; filter: brightness(0) saturate(100%) invert(50%);">
                        </div>
                        <p>Click to upload or drag and drop</p>
                        <small>PNG, JPG, GIF up to 10MB (Max 5 images)</small>
                        <input type="file" id="images" name="images[]" multiple accept="image/*" style="display: none;">
                    </div>
                    <div class="image-preview" id="imagePreview"></div>
                </div>
                
                <div class="contact-section">
                    <h4>Contact Information</h4>
                    
                    <div class="input-group">
                        <label for="contactBio">Your Bio</label>
                        <textarea id="contactBio" name="contact_bio" placeholder="Tell buyers/clients about yourself" rows="3" maxlength="200"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="input-group half">
                            <label for="emailAddress">Email Address</label>
                            <input type="email" id="emailAddress" name="email_address" placeholder="your.email@tip.edu.ph" value="">
                        </div>
                       
                    </div>
                    
                    <div class="form-row">
                        <div class="input-group half">
                            <label for="chatAvailability">Chat Availability</label>
                            <input type="text" id="chatAvailability" name="chat_availability" placeholder="e.g., 9 AM - 6 PM">
                        </div>
                        <div class="input-group half">
                            <label for="meetupAvailability">Meetup Availability</label>
                            <input type="text" id="meetupAvailability" name="meetup_availability" placeholder="e.g., Weekends only">
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancelBtn">Cancel</button>
                    <button type="submit" class="btn-primary" id="createMarketplaceBtn">
                        ${isEditing ? 'Update' : 'Create'} Post
                    </button>
                </div>
            </form>
        `;

        setupMarketplaceFormHandlers();
        
        if (isEditing) {
            loadExistingPostData(editId);
        }
    }

    function loadServiceForm(editId = null) {
        const isEditing = editId !== null;
        
        formContainer.innerHTML = `
            <form id="serviceForm" class="create-post-form" action="backend/create-post.php" method="POST" enctype="multipart/form-data">
                <input type="hidden" name="action" value="${isEditing ? 'update_post' : 'create_post'}">
                <input type="hidden" name="post_type" value="service">
                <input type="hidden" name="post_id" value="${editId || ''}">
                <input type="hidden" name="csrf_token" id="csrfTokenService" value="">
                
                <div class="input-group">
                    <label for="serviceTitle">Service Title *</label>
                    <input type="text" id="serviceTitle" name="service_title" placeholder="Enter service title" required maxlength="100">
                </div>
                
                <div class="form-row">
                    <div class="input-group half">
                        <label for="startingPrice">Starting Price (₱) *</label>
                        <input type="number" id="startingPrice" name="starting_price" placeholder="0.00" min="0" step="0.01" required>
                    </div>
                    <div class="input-group half">
                        <label for="serviceCategory">Category *</label>
                        <select id="serviceCategory" name="service_category" required>
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
                    <label for="deliveryTime">Delivery Time *</label>
                    <select id="deliveryTime" name="delivery_time" required>
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
                
                <div class="portfolio-section">
                    <h4>Portfolio <button type="button" class="btn-add-item" id="addPortfolioItem">+ Add Item</button></h4>
                    <p>Showcase your previous work to attract more clients</p>
                    
                    <div class="portfolio-items" id="portfolioItems">
                        <!-- Portfolio items will be added here -->
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="serviceDescription">Description *</label>
                    <textarea id="serviceDescription" name="service_description" placeholder="Describe your item or service in detail" required rows="5" maxlength="1000"></textarea>
                </div>
                
                <div class="input-group">
                    <label for="serviceImages">Upload Images</label>
                    <div class="upload-area" id="serviceUploadArea">
                        <div class="upload-icon">
                            <img src="Images/folder-icon.svg" alt="Upload" style="width: 48px; height: 48px; filter: brightness(0) saturate(100%) invert(50%);">
                        </div>
                        <p>Click to upload or drag and drop</p>
                        <small>PNG, JPG, GIF up to 10MB (Max 5 images)</small>
                        <input type="file" id="serviceImages" name="service_images[]" multiple accept="image/*" style="display: none;">
                    </div>
                    <div class="image-preview" id="serviceImagePreview"></div>
                </div>
                
                <div class="contact-section">
                    <h4>Contact Information</h4>
                    
                    <div class="input-group">
                        <label for="serviceBio">Your Bio</label>
                        <textarea id="serviceBio" name="service_bio" placeholder="Tell buyers/clients about yourself" rows="3" maxlength="200"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="input-group half">
                            <label for="serviceEmail">Email Address</label>
                            <input type="email" id="serviceEmail" name="service_email" placeholder="your.email@tip.edu.ph">
                        </div>
                     
                    </div>
                    
                    <div class="form-row">
                        <div class="input-group half">
                            <label for="serviceChatAvailability">Chat Availability</label>
                            <input type="text" id="serviceChatAvailability" name="service_chat_availability" placeholder="e.g., 9 AM - 6 PM">
                        </div>
                        <div class="input-group half">
                            <label for="serviceMeetupAvailability">Meetup Availability</label>
                            <input type="text" id="serviceMeetupAvailability" name="service_meetup_availability" placeholder="e.g., Weekends only">
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" id="cancelServiceBtn">Cancel</button>
                    <button type="submit" class="btn-primary" id="createServiceBtn">
                        ${isEditing ? 'Update' : 'Create'} Post
                    </button>
                </div>
            </form>
        `;

        setupServiceFormHandlers();
        
        if (isEditing) {
            loadExistingPostData(editId);
        }
    }

    function loadAnnouncementForm(editId = null) {
        const isEditing = editId !== null;
        
        formContainer.innerHTML = `
            <form id="announcementForm" class="create-post-form">
                <div class="input-group">
                    <label for="announcementTitle">Announcement Title *</label>
                    <input type="text" id="announcementTitle" name="title" placeholder="Enter announcement title" required maxlength="100">
                </div>
                
                <div class="input-group">
                    <label for="announcementCategory">Category *</label>
                    <select id="announcementCategory" name="category" required>
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
                    <label for="announcementAudience">Target Audience/Department *</label>
                    <select id="announcementAudience" name="audience" required>
                        <option value="">Select target audience...</option>
                        <option value="all">All Students</option>
                        <option value="ccs">College of Computer Studies</option>
                        <option value="engineering">College of Engineering</option>
                        <option value="architecture">College of Architecture</option>
                        <option value="business">College of Business</option>
                        <option value="arts">College of Arts & Sciences</option>
                        <option value="education">College of Education</option>
                        <option value="specific">Specific Users (Enter IDs)</option>
                    </select>
                </div>
                
                <div class="input-group" id="specificUsersGroup" style="display: none;">
                    <label for="specificUsers">Specific User IDs (comma-separated)</label>
                    <input type="text" id="specificUsers" name="specific_users" placeholder="e.g., user123, user456, user789">
                    <small>Enter user IDs separated by commas</small>
                </div>
                
                <div class="form-row">
                    <div class="input-group half">
                        <label for="announcementDate">Date *</label>
                        <input type="date" id="announcementDate" name="date" required>
                    </div>
                    <div class="input-group half">
                        <label for="announcementTime">Time *</label>
                        <input type="time" id="announcementTime" name="time" required>
                    </div>
                </div>
                
                <div class="input-group">
                    <label for="announcementDescription">Announcement Details *</label>
                    <textarea id="announcementDescription" name="description" rows="6" placeholder="Enter full announcement details..." required maxlength="1000"></textarea>
                    <small>Characters: <span id="announcementCharCount">0</span>/1000</small>
                </div>
                
                <div class="input-group">
                    <label>
                        <input type="checkbox" id="announcementPriority" name="priority">
                        Mark as High Priority (will be shown at top)
                    </label>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeCreatePostModal()">Cancel</button>
                    <button type="submit" class="btn-primary">
                        ${isEditing ? 'Update' : 'Create'} Announcement
                    </button>
                </div>
            </form>
        `;

        setupAnnouncementFormHandlers();
    }

    function setupMarketplaceFormHandlers() {
        const form = document.getElementById('marketplaceForm');
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('images');
        const cancelBtn = document.getElementById('cancelBtn');

        if (!form) return;

        form.addEventListener('submit', handleMarketplaceSubmit);
        if (cancelBtn) cancelBtn.addEventListener('click', closeCreatePostModal);
        if (uploadArea && fileInput) setupFileUpload(uploadArea, fileInput, 'imagePreview');
    }

    function setupServiceFormHandlers() {
        const form = document.getElementById('serviceForm');
        const uploadArea = document.getElementById('serviceUploadArea');
        const fileInput = document.getElementById('serviceImages');
        const cancelBtn = document.getElementById('cancelServiceBtn');
        const addPortfolioBtn = document.getElementById('addPortfolioItem');

        if (!form) return;

        form.addEventListener('submit', handleServiceSubmit);
        if (cancelBtn) cancelBtn.addEventListener('click', closeCreatePostModal);
        if (uploadArea && fileInput) setupFileUpload(uploadArea, fileInput, 'serviceImagePreview');
        if (addPortfolioBtn) addPortfolioBtn.addEventListener('click', addPortfolioItem);
    }

    function setupAnnouncementFormHandlers() {
        const form = document.getElementById('announcementForm');
        const cancelBtn = document.getElementById('cancelAnnouncementBtn');
        const textarea = document.getElementById('announcementDescription');
        const charCount = document.getElementById('announcementCharCount');

        if (!form) return;

        if (textarea && charCount) {
            textarea.addEventListener('input', function() {
                const count = this.value.length;
                charCount.textContent = `${count}/1000 characters`;
                charCount.style.color = count > 900 ? '#dc3545' : '#666';
            });
        }

        form.addEventListener('submit', handleAnnouncementSubmit);
        if (cancelBtn) cancelBtn.addEventListener('click', closeCreatePostModal);
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

    function addPortfolioItem() {
        const portfolioContainer = document.getElementById('portfolioItems');
        if (!portfolioContainer) return;

        const itemCount = portfolioContainer.children.length;
        
        if (itemCount >= 5) {
            alert('You can add up to 5 portfolio items');
            return;
        }
        
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        portfolioItem.innerHTML = `
            <div class="portfolio-header">
                <h5>Portfolio Item ${itemCount + 1}</h5>
                <button type="button" class="remove-portfolio-item">Remove</button>
            </div>
            
            <div class="input-group">
                <label for="portfolioTitle${itemCount}">Project Title</label>
                <input type="text" id="portfolioTitle${itemCount}" name="portfolio_title[]" placeholder="e.g., Logo Design for Local Business" maxlength="100">
            </div>
            
            <div class="input-group">
                <label for="portfolioDescription${itemCount}">Project Description</label>
                <textarea id="portfolioDescription${itemCount}" name="portfolio_description[]" placeholder="Brief description of the project and your role" rows="3" maxlength="300"></textarea>
            </div>
            
            <div class="input-group">
                <label for="portfolioImage${itemCount}">Image URL (Optional)</label>
                <input type="url" id="portfolioImage${itemCount}" name="portfolio_image[]" placeholder="https://example.com/image.jpg">
                <small>Paste a link to showcase your work (from Google Drive, Imgur, etc.)</small>
            </div>
        `;
        
        portfolioContainer.appendChild(portfolioItem);
        
        portfolioItem.querySelector('.remove-portfolio-item').addEventListener('click', () => {
            portfolioItem.remove();
        });
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    async function handleMarketplaceSubmit(e) {
        e.preventDefault();
        
        const userId = sessionStorage.getItem('user_id');
        if (!userId) {
            alert('You must be logged in to create a post');
            return;
        }

        const formData = {
            user_id: userId,
            type: 'marketplace',
            title: document.getElementById('productName').value,
            price: document.getElementById('price').value,
            condition_status: document.getElementById('condition').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value
        };

        const imageInput = document.getElementById('images');
        if (imageInput && imageInput.files.length > 0) {
            const base64Images = [];
            for (let i = 0; i < Math.min(imageInput.files.length, 5); i++) {
                base64Images.push(await toBase64(imageInput.files[i]));
            }
            formData.images = base64Images;
        }

        if (editingPostId) {
            formData.post_id = editingPostId;
        }

        const endpoint = editingPostId ? '/api/posts/update' : '/api/posts/create';

        const submitBtn = document.getElementById('createMarketplaceBtn');
        if (submitBtn) submitBtn.textContent = editingPostId ? 'Updating...' : 'Creating...';
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (response.ok && data.success) {
                alert(`✅ Marketplace Listing Created!\n\nTitle: ${formData.title}\nPrice: ₱${formData.price}`);
                closeCreatePostModal();
                window.location.reload();
            } else {
                alert('Creation failed: ' + data.error);
                if (submitBtn) submitBtn.textContent = 'Create Post';
            }
        } catch (error) {
            console.error(error);
            alert('Server disconnected.');
            if (submitBtn) submitBtn.textContent = 'Create Post';
        }
    }

    async function handleServiceSubmit(e) {
        e.preventDefault();
        
        const userId = sessionStorage.getItem('user_id');
        if (!userId) {
            alert('You must be logged in to create a service');
            return;
        }

        const formData = {
            user_id: userId,
            type: 'service',
            title: document.getElementById('serviceTitle').value,
            price: document.getElementById('startingPrice').value,
            category: document.getElementById('serviceCategory').value,
            description: document.getElementById('serviceDescription').value
        };

        const serviceImageInput = document.getElementById('serviceImages');
        if (serviceImageInput && serviceImageInput.files.length > 0) {
            const base64Images = [];
            for (let i = 0; i < Math.min(serviceImageInput.files.length, 5); i++) {
                base64Images.push(await toBase64(serviceImageInput.files[i]));
            }
            formData.images = base64Images;
        }

        if (editingPostId) {
            formData.post_id = editingPostId;
        }

        const endpoint = editingPostId ? '/api/posts/update' : '/api/posts/create';

        const submitBtn = document.getElementById('createServiceBtn');
        if (submitBtn) submitBtn.textContent = editingPostId ? 'Updating...' : 'Creating...';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (response.ok && data.success) {
                alert(`✅ Service Listing Created!\n\nTitle: ${formData.title}\nStarting at: ₱${formData.price}`);
                closeCreatePostModal();
                window.location.reload();
            } else {
                alert('Creation failed: ' + data.error);
                if (submitBtn) submitBtn.textContent = 'Create Service';
            }
        } catch (error) {
            console.error(error);
            alert('Server disconnected.');
            if (submitBtn) submitBtn.textContent = 'Create Service';
        }
    }

    async function handleAnnouncementSubmit(e) {
        e.preventDefault();
        
        const userId = sessionStorage.getItem('user_id');
        if (!userId) {
            alert('You must be logged in to create an announcement');
            return;
        }

        const formData = {
            user_id: userId,
            type: 'announcement',
            title: document.getElementById('announcementTitle').value,
            category: document.getElementById('announcementCategory').value,
            description: document.getElementById('announcementDescription').value
        };

        if (editingPostId) {
            formData.post_id = editingPostId;
        }

        const endpoint = editingPostId ? '/api/posts/update' : '/api/posts/create';

        const submitBtn = document.querySelector('#announcementForm .btn-primary');
        if (submitBtn) submitBtn.textContent = editingPostId ? 'Updating...' : 'Publishing...';
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (response.ok && data.success) {
                alert(`✅ Announcement Pending Review!\n\n📢 ${formData.title}`);
                closeCreatePostModal();
                window.location.reload();
            } else {
                alert('Creation failed: ' + data.error);
                if (submitBtn) submitBtn.textContent = 'Create Announcement';
            }
        } catch (error) {
            console.error(error);
            alert('Server disconnected.');
            if (submitBtn) submitBtn.textContent = 'Create Announcement';
        }
    }

    function loadExistingPostData(postId) {
        fetch(`/api/posts/${postId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
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
        if (currentPostType === 'marketplace') {
            const fields = ['productName', 'price', 'condition', 'category', 'description'];
            fields.forEach(field => {
                const el = document.getElementById(field);
                if (el && postData[field]) el.value = postData[field];
            });
        } else if (currentPostType === 'service') {
            const fields = ['serviceTitle', 'startingPrice', 'serviceCategory', 'deliveryTime', 'serviceDescription'];
            fields.forEach(field => {
                const el = document.getElementById(field);
                if (el && postData[field]) el.value = postData[field];
            });
        } else if (currentPostType === 'announcement') {
            const fields = ['announcementTitle', 'announcementCategory', 'announcementDescription'];
            fields.forEach(field => {
                const el = document.getElementById(field);
                if (el && postData[field]) el.value = postData[field];
            });
        }
    }

    function closeCreatePostModal() {
        if (modal) modal.style.display = 'none';
        editingPostId = null;
        if (formContainer) formContainer.innerHTML = '';
        
        const submitBtn = document.querySelector('.btn-primary');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.textContent.replace('Creating...', 'Create Post').replace('Updating...', 'Update Post').replace('Publishing...', 'Create Announcement');
        }
    }

    function getAuthToken() {
        return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || '';
    }

    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    console.log('✅ Create post module loaded successfully');
});
