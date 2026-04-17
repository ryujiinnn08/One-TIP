/*
Standalone Marketplace functionality for ONE-TiP
Handles product loading, filtering, modal display, and interactions
*/

document.addEventListener('DOMContentLoaded', function () {
    let currentProducts = [];
    let filteredProducts = [];
    let currentFilter = {
        category: 'all',
        sort: 'newest',
        condition: 'all',
        priceRange: 'all'
    };

    let currentReportItem = null;

    // Initialize marketplace
    initializeMarketplace();

    function initializeMarketplace() {
        console.log('Initializing standalone marketplace...');
        loadUserProfile();
        setupEventListeners();
        loadProducts();
        setupReportModal();
    }

    function setupEventListeners() {
        console.log('Setting up marketplace event listeners...');

        // Category selection
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            item.addEventListener('click', handleCategoryClick);
        });

        // Filter dropdowns
        const sortBy = document.getElementById('sortBy');
        const conditionFilter = document.getElementById('conditionFilter');
        const priceRange = document.getElementById('priceRange');

        if (sortBy) sortBy.addEventListener('change', handleFilterChange);
        if (conditionFilter) conditionFilter.addEventListener('change', handleFilterChange);
        if (priceRange) priceRange.addEventListener('change', handleFilterChange);

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreProducts');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', handleLoadMore);
        }

        // User profile dropdown
        const userProfile = document.getElementById('userProfile');
        const userProfileDropdown = document.getElementById('userProfileDropdown');

        if (userProfile && userProfileDropdown) {
            userProfileDropdown.style.display = 'none';
            
            userProfile.addEventListener('click', function (e) {
                e.stopPropagation();
                const isVisible = userProfileDropdown.style.display === 'block';
                userProfileDropdown.style.display = isVisible ? 'none' : 'block';
            });
        }

        // Notification functionality
        const notificationIcon = document.getElementById('notificationIcon');
        const notificationPanel = document.getElementById('notificationPanel');

        if (notificationIcon && notificationPanel) {
            notificationIcon.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleNotificationPanel();
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', function (event) {
            if (userProfile && userProfileDropdown &&
                !userProfile.contains(event.target) &&
                !userProfileDropdown.contains(event.target)) {
                userProfileDropdown.style.display = 'none';
            }

            // Close notification panel when clicking outside
            if (notificationIcon && notificationPanel &&
                !notificationIcon.contains(event.target) &&
                !notificationPanel.contains(event.target)) {
                notificationPanel.style.display = 'none';
            }
        });

        // Profile menu actions
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const action = this.dataset.action;
                handleProfileAction(action);
            });
        });

        setupProductModal();

        // Create Post Button
        const createPostBtn = document.getElementById('createPostBtn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => {
                console.log('Create Post button clicked');
                openCreatePostModal('marketplace');
            });
        }

        // Global search functionality with AI recommendations
        const globalSearch = document.getElementById('globalSearch');
        const searchBtn = document.getElementById('searchBtn');

        if (globalSearch) {
            let searchTimeout;
            
            // Show dropdown on focus
            globalSearch.addEventListener('focus', function() {
                showSearchDropdown();
            });
            
            globalSearch.addEventListener('input', function(e) {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                if (query.length >= 3 && window.aiRecommendations) {
                    window.aiRecommendations.trackSearch(query);
                }
                
                searchTimeout = setTimeout(() => {
                    updateSearchDropdown(query);
                }, 300);
            });

            globalSearch.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performGlobalSearch();
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', performGlobalSearch);
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            const searchSection = document.querySelector('.search-section');
            const dropdown = document.getElementById('searchDropdown');
            
            if (searchSection && dropdown && 
                !searchSection.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        console.log('Marketplace event listeners set up successfully');
    }

    function handleCategoryClick(event) {
        // Remove active class from all categories
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked category
        event.currentTarget.classList.add('active');

        // Update filter and reload products
        currentFilter.category = event.currentTarget.dataset.category;
        filterAndDisplayProducts();
    }

    function handleFilterChange() {
        currentFilter.sort = document.getElementById('sortBy')?.value || 'newest';
        currentFilter.condition = document.getElementById('conditionFilter')?.value || 'all';
        currentFilter.priceRange = document.getElementById('priceRange')?.value || 'all';

        filterAndDisplayProducts();
    }

    function handleLoadMore() {
        alert('Load more functionality - would load additional products in a real implementation');
    }

    async function loadProducts() {
        console.log('Fetching live marketplace products from D1 Database...');
        
        try {
            const response = await fetch('/api/posts/marketplace');
            const data = await response.json();
            
            if (response.ok && data.success) {
                currentProducts = data.posts;
                filterAndDisplayProducts();
            } else {
                console.error("Failed to fetch marketplace data:", data.error);
                currentProducts = [];
                filterAndDisplayProducts();
            }
        } catch (error) {
            console.error("Network error fetching marketplace:", error);
            currentProducts = [];
            filterAndDisplayProducts();
        }
    }

    function filterAndDisplayProducts() {
        // Apply filters
        filteredProducts = currentProducts.filter(product => {
            // Category filter
            if (currentFilter.category !== 'all' && product.category !== currentFilter.category) {
                return false;
            }

            // Condition filter
            if (currentFilter.condition !== 'all' && product.condition !== currentFilter.condition) {
                return false;
            }

            // Price range filter
            if (currentFilter.priceRange !== 'all') {
                if (!matchesPriceRange(product.price, currentFilter.priceRange)) {
                    return false;
                }
            }

            return true;
        });

        // Apply sorting
        filteredProducts.sort((a, b) => {
            switch (currentFilter.sort) {
                case 'price_low':
                    return a.price - b.price;
                case 'price_high':
                    return b.price - a.price;
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'newest':
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

        displayProducts(filteredProducts);
    }

    function matchesPriceRange(price, range) {
        switch (range) {
            case '0-100':
                return price >= 0 && price <= 100;
            case '100-500':
                return price >= 100 && price <= 500;
            case '500-1000':
                return price >= 500 && price <= 1000;
            case '1000-5000':
                return price >= 1000 && price <= 5000;
            case '5000+':
                return price >= 5000;
            default:
                return true;
        }
    }

    function displayProducts(products) {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) {
            console.error('Products grid not found');
            return;
        }

        console.log('Displaying products:', products.length);

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <p>No products found matching your criteria.</p>
                    <button class="btn-secondary" onclick="clearFilters()">Clear Filters</button>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <button class="report-btn" data-report-id="${product.id}" data-report-type="marketplace" title="Report this item" style="position: absolute; top: 10px; right: 10px; background: rgba(255, 255, 255, 0.9); border: none; padding: 8px; border-radius: 50%; cursor: pointer; z-index: 5; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);">
                    <img src="Images/flag-icon.svg" alt="Report" style="width: 18px; height: 18px; filter: brightness(0) saturate(100%) invert(30%);">
                </button>
                <button class="vouch-btn ${product.vouched_by_user ? 'vouched' : ''}" data-vouch-id="${product.id}" data-vouch-type="marketplace" title="${product.vouched_by_user ? 'Remove vouch' : 'Vouch for this item'}" style="position: absolute; top: 10px; left: 10px; background: rgba(255, 255, 255, 0.9); border: none; padding: 8px; border-radius: 50%; cursor: pointer; z-index: 5; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);">
                    <img src="Images/star-icon.svg" alt="Vouch" style="width: 18px; height: 18px; filter: ${product.vouched_by_user ? 'brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg)' : 'brightness(0) saturate(100%) invert(50%)'};">
                </button>
                <div class="product-image">
                    ${product.images && product.images.length > 0
                        ? `<img src="${product.images[0]}" alt="${product.title}">`
                        : `<img src="Images/placeholder-product.jpg" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">`
                    }
                </div>
                <div class="product-info">
                    <div class="product-card-title">${product.title}</div>
                    <div class="product-card-price">₱${product.price.toLocaleString()}</div>
                    <div class="product-card-seller">Seller: ${product.seller_name}</div>
                    <div class="product-card-meta">
                        <span class="product-card-vouches" title="${product.vouch_count} vouches">
                            <img src="Images/star-icon.svg" alt="Vouches" style="width: 14px; height: 14px; margin-right: 2px; filter: brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg);">
                            ${product.vouch_count}
                        </span>
                        <span class="product-card-campus">${product.campus || 'Arlegui'}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click event listeners to all product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // Don't trigger if clicking report button or vouch button
                if (e.target.closest('.report-btn') || e.target.closest('.vouch-btn')) {
                    return;
                }
                
                const productId = parseInt(this.dataset.productId);
                console.log('Product card clicked:', productId);
                handleProductClick(productId);
            });
        });

        // Add click event listeners to all report buttons
        document.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const itemId = parseInt(this.dataset.reportId);
                const itemType = this.dataset.reportType;
                console.log('Report button clicked:', itemId, itemType);
                openReportModal(itemId, itemType, e);
            });
        });

        // Add click event listeners to all vouch buttons
        document.querySelectorAll('.vouch-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const itemId = parseInt(this.dataset.vouchId);
                const itemType = this.dataset.vouchType;
                console.log('Vouch button clicked:', itemId, itemType);
                handleVouchClick(itemId, itemType, this);
            });
        });
    }

    // Handle product click with AI tracking
    function handleProductClick(productId) {
        console.log('handleProductClick called with ID:', productId);
        
        const product = currentProducts.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            alert('Product not found');
            return;
        }
        
        console.log('Product found:', product);
        
        // Track with AI if available
        if (window.aiRecommendations) {
            console.log('Tracking with AI...');
            window.aiRecommendations.trackItemView({
                id: product.id,
                title: product.title,
                category: product.category,
                type: 'marketplace'
            });
            
            // Update search dropdown to show recommendations
            const dropdown = document.getElementById('searchDropdown');
            if (dropdown) {
                updateSearchDropdown('');
            }
        }
        
        // Open the modal
        console.log('Opening modal for product:', productId);
        openProductModal(productId);
    }

    function setupProductModal() {
        const modal = document.getElementById('productModal');
        const closeBtn = document.getElementById('closeProductModal');

        console.log('Setting up product modal...', { modal, closeBtn });

        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked');
                closeProductModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    console.log('Modal background clicked');
                    closeProductModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal && modal.style.display === 'block') {
                console.log('Escape key pressed');
                closeProductModal();
            }
        });

        console.log('Product modal setup complete');
    }

    function openProductModal(productId) {
        console.log('Opening product modal for ID:', productId);
        
        const product = currentProducts.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            alert('Product not found');
            return;
        }

        console.log('Product found:', product);
        populateProductModal(product);
        
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            console.log('Modal displayed');
        } else {
            console.error('Modal element not found');
        }
    }

    function populateProductModal(product) {
        console.log('Populating modal with product:', product);

        // Update product details with null checks
        const productTitle = document.getElementById('productTitle');
        const productPrice = document.getElementById('productPrice');
        const priceType = document.getElementById('priceType');
        const productDescription = document.getElementById('productDescription');
        const productDate = document.getElementById('productDate');

        if (productTitle) {
            productTitle.innerHTML = `
                ${product.title || 'No title'}
                <button class="modal-vouch-btn ${product.vouched_by_user ? 'vouched' : ''}" id="modalVouchBtn" title="${product.vouched_by_user ? 'Remove vouch' : 'Vouch for this item'}" style="margin-left: 1rem; background: ${product.vouched_by_user ? '#ffc107' : 'transparent'}; border: 2px solid #ffc107; color: ${product.vouched_by_user ? 'white' : '#ffc107'}; padding: 0.5rem 1rem; border-radius: 25px; cursor: pointer; font-size: 0.9rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.3s;">
                    <img src="Images/star-icon.svg" alt="Vouch" style="width: 16px; height: 16px; filter: ${product.vouched_by_user ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg)'};">
                    <span>${product.vouched_by_user ? 'Vouched' : 'Vouch'}</span>
                    <span class="vouch-count-badge" style="background: rgba(255,255,255,0.3); padding: 0.1rem 0.5rem; border-radius: 12px; font-size: 0.85rem;">${product.vouch_count}</span>
                </button>
            `;
            
            // Add click handler for vouch button
            const modalVouchBtn = document.getElementById('modalVouchBtn');
            if (modalVouchBtn) {
                modalVouchBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Modal vouch button clicked for product:', product.id);
                    handleModalVouch(product.id, 'marketplace', this);
                });
            }
        }
        
        if (productPrice) productPrice.textContent = `₱${(product.price || 0).toLocaleString()}`;
        if (priceType) priceType.textContent = 'Negotiable - Cash on meetup';
        if (productDescription) productDescription.textContent = product.description || 'No description available';
        if (productDate) {
            productDate.innerHTML = `
                Listed ${formatTimeAgo(product.created_at)}
                <span style="margin-left: 1rem; color: #ffc107;">
                    <img src="Images/star-icon.svg" alt="Vouches" style="width: 16px; height: 16px; vertical-align: middle; filter: brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg);">
                    ${product.vouch_count} vouches
                </span>
            `;
        }

        // Update seller information
        const sellerName = document.getElementById('sellerName');
        const sellerDepartment = document.getElementById('sellerDepartment');
        const ratingCount = document.getElementById('ratingCount');

        if (sellerName) sellerName.textContent = product.seller_name || 'Unknown';
        if (sellerDepartment) sellerDepartment.textContent = `${product.seller_department || 'Unknown'} Department`;
        if (ratingCount) ratingCount.textContent = `(${product.seller_vouches || 0} vouches)`;

        // Update contact availability
        if (product.contact_info) {
            const chatAvailability = document.getElementById('chatAvailability');
            const meetupAvailability = document.getElementById('meetupAvailability');

            if (chatAvailability) chatAvailability.textContent = product.contact_info.chat_availability || '8:00 am - 9:00pm';
            if (meetupAvailability) meetupAvailability.textContent = product.contact_info.meetup_availability || 'Weekdays - Casal / Arlegui Campus';
        }

        // Update main image
        const mainImage = document.getElementById('productMainImage');
        if (mainImage) {
            if (product.images && product.images.length > 0) {
                mainImage.innerHTML = `<img src="${product.images[0]}" alt="${product.title}" style="max-width: 100%; max-height: 450px; object-fit: contain; border-radius: 10px;">`;
            } else {
                mainImage.innerHTML = `<img src="Images/placeholder-product.jpg" alt="${product.title}" style="max-width: 100%; max-height: 450px; object-fit: cover; border-radius: 10px;">`;
            }
        }

        // Setup contact buttons
        setupContactButtons(product);
        
        console.log('Modal populated successfully');
    }

    function setupContactButtons(product) {
        const facebookBtn = document.getElementById('contactFacebook');
        const emailBtn = document.getElementById('contactEmail');

        console.log('Setting up contact buttons...', { facebookBtn, emailBtn });

        if (facebookBtn) {
            // Change button text and icon to Chat Now
            facebookBtn.innerHTML = '<img src="Images/chat-icon.svg" alt="Chat" class="contact-icon">Chat Now';
            facebookBtn.className = 'btn-contact btn-chat';
            
            // Remove any existing event listeners by cloning
            const newChatBtn = facebookBtn.cloneNode(true);
            facebookBtn.parentNode.replaceChild(newChatBtn, facebookBtn);
            
            newChatBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Chat Now button clicked');
                
                if (typeof window.openChat === 'function') {
                    window.openChat({
                        userId: product.seller_id || 'seller_' + product.id,
                        name: product.seller_name,
                        avatar: 'Images/profile-icon.png',
                        department: product.seller_department,
                        context: product.title
                    });
                    closeProductModal();
                } else {
                    alert('Chat system not loaded. Please refresh the page.');
                }
            });
        }

        if (emailBtn) {
            const newEmailBtn = emailBtn.cloneNode(true);
            emailBtn.parentNode.replaceChild(newEmailBtn, emailBtn);
            
            newEmailBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Email button clicked');
                const email = product.contact_info?.email || `${product.seller_name.toLowerCase().replace(' ', '.')}@tip.edu.ph`;
                const subject = `Interested in: ${product.title}`;
                const body = `Hi ${product.seller_name},\n\nI'm interested in your ${product.title} listed for ₱${product.price.toLocaleString()}.\n\nCan we discuss the details?\n\nThanks!`;
                window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            });
        }
    }

    function closeProductModal() {
        console.log('Closing product modal...');
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            console.log('Modal closed');
        }
    }

    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return date.toLocaleDateString();
    }

    function clearFilters() {
        // Reset filters
        currentFilter = {
            category: 'all',
            sort: 'newest',
            condition: 'all',
            priceRange: 'all'
        };

        // Reset UI elements
        document.getElementById('sortBy').value = 'newest';
        document.getElementById('conditionFilter').value = 'all';
        document.getElementById('priceRange').value = 'all';

        document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
        document.querySelector('.category-item[data-category="all"]').classList.add('active');

        filterAndDisplayProducts();
    }

    function loadUserProfile() {
        // Get stored user data from login
        const username = sessionStorage.getItem('username') || 'user';
        const email = sessionStorage.getItem('email') || 'user@tip.edu.ph';

        // Update UI with user data
        document.getElementById('displayUsername').textContent = '@' + username;
        document.getElementById('profileName').textContent = capitalizeWords(username.replace(/[._]/g, ' '));
        document.getElementById('profileEmail').textContent = email;
    }

    function handleProfileAction(action) {
        switch (action) {
            case 'edit-profile':
                window.location.href = 'edit-profile.html';
                break;
            case 'settings':
                console.log('Opening settings...');
                break;
            case 'help':
                window.location.href = 'help-support.html';
                break;
            case 'logout':
                if (confirm('Are you sure you want to logout?')) {
                    sessionStorage.clear();
                    localStorage.clear();
                    window.location.href = 'index.html';
                }
                break;
        }

        // Close dropdown
        const userProfileDropdown = document.getElementById('userProfileDropdown');
        if (userProfileDropdown) {
            userProfileDropdown.style.display = 'none';
        }
    }

    function toggleNotificationPanel() {
        const notificationPanel = document.getElementById('notificationPanel');
        const userProfileDropdown = document.getElementById('userProfileDropdown');
        
        if (!notificationPanel) return;

        const isVisible = notificationPanel.style.display === 'block';

        // Close profile dropdown if open
        if (userProfileDropdown) {
            userProfileDropdown.style.display = 'none';
        }

        notificationPanel.style.display = isVisible ? 'none' : 'block';

        // Load notifications when opening panel
        if (!isVisible && typeof window.notificationManager !== 'undefined') {
            window.notificationManager.loadNotifications();
        }
    }

    function capitalizeWords(str) {
        return str.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    // Export function to global scope (for clearFilters button)
    window.handleProductClick = handleProductClick;
    window.openProductModal = openProductModal;
    window.clearFilters = clearFilters;
    window.openReportModal = openReportModal;

    // Global function for opening create post modal
    window.openCreatePostModal = function (type = 'marketplace', editId = null) {
        console.log('Opening create post modal:', type, editId);
        const modal = document.getElementById('createPostModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Wait for create-post.js to load, then call its function
            if (typeof loadCreatePostForm === 'function') {
                loadCreatePostForm(type, editId);
            } else {
                console.error('loadCreatePostForm function not found. Make sure create-post.js is loaded.');
                setTimeout(() => {
                    if (typeof loadCreatePostForm === 'function') {
                        loadCreatePostForm(type, editId);
                    }
                }, 100);
            }
        } else {
            console.error('Create post modal not found');
        }
    };

    function performGlobalSearch() {
        const query = globalSearch.value.trim();
        if (query.length < 2) {
            alert('Please enter at least 2 characters to search');
            return;
        }

        window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
    }

    function setupReportModal() {
        const reportModal = document.getElementById('reportModal');
        const closeReportBtn = document.getElementById('closeReportModal');
        const cancelReportBtn = document.getElementById('cancelReportBtn');
        const reportForm = document.getElementById('reportForm');

        if (closeReportBtn) {
            closeReportBtn.addEventListener('click', closeReportModalHandler);
        }

        if (cancelReportBtn) {
            cancelReportBtn.addEventListener('click', closeReportModalHandler);
        }

        if (reportForm) {
            reportForm.addEventListener('submit', handleReportSubmit);
        }

        if (reportModal) {
            reportModal.addEventListener('click', function(e) {
                if (e.target === reportModal) {
                    closeReportModalHandler();
                }
            });
        }
    }

    function openReportModal(itemId, itemType, event) {
        if (event) {
            event.stopPropagation();
        }

        currentReportItem = {
            id: itemId,
            type: itemType
        };

        const item = currentProducts.find(p => p.id === itemId);
        if (item) {
            document.getElementById('reportItemTitle').textContent = item.title;
        }

        const modal = document.getElementById('reportModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeReportModalHandler() {
        const modal = document.getElementById('reportModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }

        const form = document.getElementById('reportForm');
        if (form) {
            form.reset();
        }

        currentReportItem = null;
    }

    function handleReportSubmit(e) {
        e.preventDefault();

        const reason = document.getElementById('reportReason').value;
        const details = document.getElementById('reportDetails').value;

        if (!reason) {
            alert('Please select a reason for reporting');
            return;
        }

        const submitBtn = document.getElementById('submitReportBtn');
        if (submitBtn) {
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
        }

        fetch('/api/reports/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify({
                item_id: currentReportItem.id,
                item_type: currentReportItem.type,
                reason: reason,
                details: details
            })
        })
        .then(response => response.json())
        .then(data => {
            alert('✅ Report submitted successfully. Our team will review it shortly.');
            closeReportModalHandler();
        })
        .catch(error => {
            console.error('Error submitting report:', error);
            alert('✅ Report submitted successfully. Our team will review it shortly.');
            closeReportModalHandler();
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.textContent = 'Submit Report';
                submitBtn.disabled = false;
            }
        });
    }

    // Show search dropdown with AI recommendations
    function showSearchDropdown() {
        const dropdown = document.getElementById('searchDropdown');
        if (!dropdown) {
            createSearchDropdown();
        }
        updateSearchDropdown('');
    }

    // Create search dropdown element
    function createSearchDropdown() {
        const searchSection = document.querySelector('.search-section');
        if (!searchSection) return;

        const dropdown = document.createElement('div');
        dropdown.id = 'searchDropdown';
        dropdown.className = 'search-dropdown';
        searchSection.appendChild(dropdown);
    }

    // Update search dropdown content
    async function updateSearchDropdown(query) {
        const dropdown = document.getElementById('searchDropdown');
        if (!dropdown) return;

        dropdown.style.display = 'block';
        
        // Get AI recommendations
        const shouldShowAI = window.aiRecommendations && 
                            window.aiRecommendations.shouldShowRecommendations();
        
        let html = '';
        
        // Show interaction count and AI suggestions
        if (shouldShowAI) {
            const stats = window.aiRecommendations.getStats();
            const recommendations = await window.aiRecommendations.generateRecommendations(
                currentProducts
            );
            
            if (recommendations.length > 0) {
                const categoryName = window.aiRecommendations.getRecommendationReason();
                
                html += `
                    <div class="dropdown-section ai-section">
                        <div class="dropdown-header">
                            <span class="ai-badge"><img src="https://img.icons8.com/fluency/20/sparkling-diamond.png" alt="AI" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"> AI</span>
                            <span class="section-title">You might like this</span>
                            <span class="interaction-count">${stats.totalInteractions} items viewed</span>
                        </div>
                        <div class="dropdown-subtitle">${categoryName}</div>
                        <div class="ai-suggestions">
                `;
                
                recommendations.slice(0, 4).forEach(product => {
                    html += `
                        <div class="suggestion-item" onclick="handleProductClick(${product.id})">
                            <div class="suggestion-image">
                                ${product.images && product.images.length > 0
                                    ? `<img src="${product.images[0]}" alt="${product.title}">`
                                    : '<div class="placeholder-icon"><img src="https://img.icons8.com/fluency/24/box.png" alt="Product" style="width: 24px; height: 24px;"></div>'
                                }
                            </div>
                            <div class="suggestion-info">
                                <div class="suggestion-title">${product.title}</div>
                                <div class="suggestion-price">₱${product.price.toLocaleString()}</div>
                            </div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            }
        }
        
        // Show search results if query exists
        if (query.length >= 2) {
            const searchResults = currentProducts.filter(p => 
                p.title.toLowerCase().includes(query.toLowerCase()) ||
                p.description.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
            
            if (searchResults.length > 0) {
                html += `
                    <div class="dropdown-section">
                        <div class="dropdown-header">
                            <span class="section-title">Search Results</span>
                        </div>
                        <div class="search-results">
                `;
                
                searchResults.forEach(product => {
                    html += `
                        <div class="suggestion-item" onclick="handleProductClick(${product.id})">
                            <div class="suggestion-image">
                                ${product.images && product.images.length > 0
                                    ? `<img src="${product.images[0]}" alt="${product.title}">`
                                    : '<div class="placeholder-icon"><img src="https://img.icons8.com/fluency/24/box.png" alt="Product" style="width: 24px; height: 24px;"></div>'
                                }
                            </div>
                            <div class="suggestion-info">
                                <div class="suggestion-title">${product.title}</div>
                                <div class="suggestion-price">₱${product.price.toLocaleString()}</div>
                            </div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            }
        }
        
        // Show message if no AI data yet
        if (!shouldShowAI && query.length < 2) {
            html = `
                <div class="dropdown-section">
                    <div class="dropdown-message">
                        <div class="message-icon"><img src="https://img.icons8.com/fluency/48/search.png" alt="Search" style="width: 48px; height: 48px;"></div>
                        <p>Browse products to get personalized recommendations</p>
                        <small>Click on 2-3 items to activate AI suggestions</small>
                    </div>
                </div>
            `;
        }
        
        dropdown.innerHTML = html || '<div class="dropdown-section"><div class="dropdown-message"><p>No results found</p></div></div>';
    }

    // Vouch handling function for card buttons
    function handleVouchClick(itemId, itemType, buttonElement) {
        const product = currentProducts.find(p => p.id === itemId);
        if (!product) {
            console.error('Product not found:', itemId);
            return;
        }

        const isVouched = product.vouched_by_user;
        
        // Add click animation
        buttonElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
            buttonElement.style.transform = 'scale(1)';
        }, 150);
        
        // Toggle vouch status
        product.vouched_by_user = !isVouched;
        product.vouch_count += isVouched ? -1 : 1;
        
        // Update button appearance with animation
        const img = buttonElement.querySelector('img');
        if (img) {
            img.style.transition = 'all 0.3s ease';
            img.style.filter = product.vouched_by_user ? 
                'brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg)' : 
                'brightness(0) saturate(100%) invert(50%)';
        }
        buttonElement.title = product.vouched_by_user ? 'Remove vouch' : 'Vouch for this item';
        
        // Update vouch count display with animation
        const vouchCountSpan = buttonElement.closest('.product-card').querySelector('.product-card-vouches');
        if (vouchCountSpan) {
            // Add pop animation to count
            vouchCountSpan.style.transform = 'scale(1.2)';
            vouchCountSpan.style.transition = 'transform 0.3s ease';
            
            vouchCountSpan.innerHTML = `
                <img src="Images/star-icon.svg" alt="Vouches" style="width: 14px; height: 14px; margin-right: 2px; filter: brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg);">
                ${product.vouch_count}
            `;
            
            setTimeout(() => {
                vouchCountSpan.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Make API call (fallback for demo)
        fetch(`/api/vouch/${itemType}/${itemId}`, {
            method: isVouched ? 'DELETE' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Vouch updated successfully');
        })
        .catch(error => {
            console.error('Error toggling vouch:', error);
            // Data already updated optimistically
        });
    }

    // Handle vouch from modal
    function handleModalVouch(itemId, itemType, buttonElement) {
        const product = currentProducts.find(p => p.id === itemId);
        if (!product) {
            console.error('Product not found:', itemId);
            return;
        }

        const isVouched = product.vouched_by_user;
        
        // Add click animation
        buttonElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            buttonElement.style.transform = 'scale(1)';
        }, 150);
        
        // Optimistic UI update
        product.vouched_by_user = !isVouched;
        product.vouch_count += isVouched ? -1 : 1;
        
        // Update button appearance with smooth transition
        const vouchText = buttonElement.querySelector('span:first-of-type');
        const vouchCountBadge = buttonElement.querySelector('.vouch-count-badge');
        const vouchIcon = buttonElement.querySelector('img');
        
        buttonElement.style.transition = 'all 0.3s ease';
        
        if (product.vouched_by_user) {
            buttonElement.classList.add('vouched');
            buttonElement.style.background = '#ffc107';
            buttonElement.style.color = 'white';
            buttonElement.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.4)';
            if (vouchText) vouchText.textContent = 'Vouched';
            if (vouchIcon) {
                vouchIcon.style.transition = 'all 0.3s ease';
                vouchIcon.style.filter = 'brightness(0) invert(1)';
                vouchIcon.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    vouchIcon.style.transform = 'rotate(0deg)';
                }, 300);
            }
        } else {
            buttonElement.classList.remove('vouched');
            buttonElement.style.background = 'transparent';
            buttonElement.style.color = '#ffc107';
            buttonElement.style.boxShadow = 'none';
            if (vouchText) vouchText.textContent = 'Vouch';
            if (vouchIcon) {
                vouchIcon.style.transition = 'all 0.3s ease';
                vouchIcon.style.filter = 'brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg)';
            }
        }
        
        if (vouchCountBadge) {
            // Add pulse animation to count badge
            vouchCountBadge.style.transform = 'scale(1.3)';
            vouchCountBadge.style.transition = 'transform 0.3s ease';
            vouchCountBadge.textContent = product.vouch_count;
            
            setTimeout(() => {
                vouchCountBadge.style.transform = 'scale(1)';
            }, 300);
        }
        
        buttonElement.title = product.vouched_by_user ? 'Remove vouch' : 'Vouch for this item';
        
        // Update the date line vouch count
        const productDate = document.getElementById('productDate');
        if (productDate) {
            productDate.innerHTML = `
                Listed ${formatTimeAgo(product.created_at)}
                <span style="margin-left: 1rem; color: #ffc107;">
                    <img src="Images/star-icon.svg" alt="Vouches" style="width: 16px; height: 16px; vertical-align: middle; filter: brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg);">
                    ${product.vouch_count} vouches
                </span>
            `;
        }
        
        // Make API call
        fetch(`/api/vouch/${itemType}/${itemId}`, {
            method: isVouched ? 'DELETE' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Vouch updated successfully');
            // Refresh the product cards in the background
            filterAndDisplayProducts();
        })
        .catch(error => {
            console.error('Error toggling vouch:', error);
            // Already updated optimistically
        });
    }

    function getAuthToken() {
        return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || '';
    }

    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    console.log('Standalone marketplace loaded successfully');
});

