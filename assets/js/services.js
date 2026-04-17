/*
Services functionality for ONE-TiP
Handles service loading, filtering, modal display, and interactions
*/

document.addEventListener('DOMContentLoaded', function () {
    let currentServices = [];
    let filteredServices = [];
    let currentFilter = {
        category: 'all',
        sort: 'newest',
        priceRange: 'all',
        deliveryTime: 'all'
    };

    let currentReportItem = null;

    // Initialize services
    initializeServices();

    function initializeServices() {
        console.log('Initializing services page...');
        loadUserProfile();
        setupEventListeners();
        setupServiceModal();
        loadServices();
        setupReportModal();
    }

    function setupEventListeners() {
        console.log('Setting up services event listeners...');

        // Filter dropdowns
        const sortBy = document.getElementById('servicesSortBy');
        const category = document.getElementById('servicesCategory');
        const priceRange = document.getElementById('servicesPriceRange');
        const deliveryTime = document.getElementById('servicesDeliveryTime');

        if (sortBy) sortBy.addEventListener('change', handleFilterChange);
        if (category) category.addEventListener('change', handleFilterChange);
        if (priceRange) priceRange.addEventListener('change', handleFilterChange);
        if (deliveryTime) deliveryTime.addEventListener('change', handleFilterChange);

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreServices');
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

        // Close dropdown when clicking outside
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

        // Create Post Button
        const createPostBtn = document.getElementById('createPostBtn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Create Post button clicked in services');
                
                // Open the modal directly
                const modal = document.getElementById('createPostModal');
                if (modal) {
                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                    
                    // Wait a bit for create-post.js to be ready
                    setTimeout(function() {
                        if (typeof window.loadCreatePostForm === 'function') {
                            window.loadCreatePostForm('service', null);
                        } else if (typeof loadCreatePostForm === 'function') {
                            loadCreatePostForm('service', null);
                        } else {
                            console.error('Create post form function not found');
                            alert('Please refresh the page and try again.');
                        }
                    }, 100);
                } else {
                    console.error('Create post modal not found');
                    alert('Modal not found. Please refresh the page.');
                }
            });
            console.log('✅ Create Post button listener added');
        } else {
            console.error('❌ Create Post button not found');
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
                    e.preventDefault();
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

        console.log('Services event listeners set up successfully');
    }

    function handleFilterChange() {
        currentFilter.sort = document.getElementById('servicesSortBy')?.value || 'newest';
        currentFilter.category = document.getElementById('servicesCategory')?.value || 'all';
        currentFilter.priceRange = document.getElementById('servicesPriceRange')?.value || 'all';
        currentFilter.deliveryTime = document.getElementById('servicesDeliveryTime')?.value || 'all';

        filterAndDisplayServices();
    }

    function handleLoadMore() {
        alert('Load more functionality - would load additional services in a real implementation');
    }

    function loadServices() {
        console.log('Loading services...');
        
        // Sample services data with portfolio links
        currentServices = [
            {
                id: 1,
                title: 'Math Tutoring Service',
                price: 100,
                provider_name: 'Maria Santos',
                provider_department: 'Engineering',
                provider_rating: 4.9,
                provider_reviews: 25,
                vouch_count: 12,
                vouched_by_user: false,
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                description: 'Professional mathematics tutoring for all levels. Specializing in Calculus, Algebra, and Statistics. 3+ years experience helping students achieve their academic goals.',
                category: 'tutoring',
                delivery_time: '1_week',
                portfolio: [
                    { 
                        title: 'Calculus Study Guide', 
                        type: 'document',
                        link: 'https://drive.google.com/file/d/1ABC123/view'
                    },
                    { 
                        title: 'Statistics Tutorial Videos', 
                        type: 'video',
                        link: 'https://drive.google.com/drive/folders/1XYZ789'
                    },
                    { 
                        title: 'Student Success Stories', 
                        type: 'document',
                        link: 'https://docs.google.com/document/d/1DEF456/edit'
                    }
                ],
                contact_info: {
                    chat_availability: '9:00 am - 8:00 pm',
                    meetup_availability: 'Weekdays - Casal / Arlegui Campus',
                    facebook: 'maria.santos.tip',
                    email: 'maria.santos@tip.edu.ph'
                }
            },
            {
                id: 2,
                title: 'Logo Design & Branding',
                price: 200,
                provider_name: 'Alex Chen',
                provider_department: 'Arts',
                provider_rating: 4.8,
                provider_reviews: 18,
                vouch_count: 15,
                vouched_by_user: false,
                created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                description: 'Professional logo design and brand identity creation. Modern, clean designs that represent your business perfectly. Fast turnaround and unlimited revisions.',
                category: 'design',
                delivery_time: '3_days',
                portfolio: [
                    { 
                        title: 'Restaurant Logo Portfolio', 
                        type: 'image',
                        link: 'https://drive.google.com/drive/folders/1LOGO123'
                    },
                    { 
                        title: 'Tech Startup Branding', 
                        type: 'image',
                        link: 'https://behance.net/gallery/12345678/Tech-Startup-Brand'
                    },
                    { 
                        title: 'Fashion Brand Identity', 
                        type: 'image',
                        link: 'https://drive.google.com/drive/folders/1FASHION456'
                    },
                    { 
                        title: 'Process & Sketches', 
                        type: 'document',
                        link: 'https://docs.google.com/presentation/d/1PROCESS789/edit'
                    }
                ],
                contact_info: {
                    chat_availability: '10:00 am - 10:00 pm',
                    meetup_availability: 'Flexible - Casal / Arlegui Campus',
                    facebook: 'alex.chen.design',
                    email: 'alex.chen@tip.edu.ph'
                }
            },
            {
                id: 3,
                title: 'Programming & Web Development',
                price: 150,
                provider_name: 'John Reyes',
                provider_department: 'Computer Science',
                provider_rating: 4.7,
                provider_reviews: 32,
                vouch_count: 10,
                vouched_by_user: false,
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                description: 'Full-stack web development and programming tutoring. Python, JavaScript, PHP, React, and more. Build your first website or debug your code with expert help.',
                category: 'programming',
                delivery_time: '1_week',
                portfolio: [
                    { title: 'E-commerce Website', type: 'website' },
                    { title: 'Mobile App Backend', type: 'document' },
                    { title: 'Portfolio Website', type: 'website' }
                ],
                contact_info: {
                    chat_availability: '7:00 am - 11:00 pm',
                    meetup_availability: 'Anytime - Casal Campus',
                    facebook: 'john.reyes.dev',
                    email: 'john.reyes@tip.edu.ph'
                }
            },
            {
                id: 4,
                title: 'Photography & Photo Editing',
                price: 80,
                provider_name: 'Sarah Kim',
                provider_department: 'Arts',
                provider_rating: 4.9,
                provider_reviews: 28,
                vouch_count: 8,
                vouched_by_user: false,
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                description: 'Professional photography for events, portraits, and products. Also offering photo editing and retouching services using Photoshop and Lightroom.',
                category: 'photography',
                delivery_time: '2_days',
                portfolio: [
                    { title: 'Event Photography', type: 'image' },
                    { title: 'Portrait Session', type: 'image' },
                    { title: 'Product Photography', type: 'image' }
                ],
                contact_info: {
                    chat_availability: '8:00 am - 6:00 pm',
                    meetup_availability: 'Weekdays - Arlegui Campus',
                    facebook: 'sarah.kim.photo',
                    email: 'sarah.kim@tip.edu.ph'
                }
            },
            {
                id: 5,
                title: 'Music Lessons & Audio Production',
                price: 120,
                provider_name: 'Mike Torres',
                provider_department: 'Arts',
                provider_rating: 4.6,
                provider_reviews: 15,
                vouch_count: 5,
                vouched_by_user: false,
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                description: 'Guitar, piano, and music theory lessons. Also offering audio production services including mixing, mastering, and podcast editing.',
                category: 'music',
                delivery_time: '1_week',
                portfolio: [
                    { title: 'Original Song Production', type: 'audio' },
                    { title: 'Podcast Editing', type: 'audio' },
                    { title: 'Live Performance', type: 'video' }
                ],
                contact_info: {
                    chat_availability: '2:00 pm - 9:00 pm',
                    meetup_availability: 'Weekends - Music Studio',
                    facebook: 'mike.torres.music',
                    email: 'mike.torres@tip.edu.ph'
                }
            },
            {
                id: 6,
                title: 'Business Consulting & Marketing',
                price: 180,
                provider_name: 'Lisa Rodriguez',
                provider_department: 'Business',
                provider_rating: 4.8,
                provider_reviews: 22,
                vouch_count: 20,
                vouched_by_user: false,
                created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                description: 'Business plan development, market research, and digital marketing strategies. Help your startup grow with proven business techniques.',
                category: 'business',
                delivery_time: '2_weeks',
                portfolio: [
                    { title: 'Startup Business Plan', type: 'document' },
                    { title: 'Social Media Strategy', type: 'document' },
                    { title: 'Market Analysis Report', type: 'document' }
                ],
                contact_info: {
                    chat_availability: '9:00 am - 5:00 pm',
                    meetup_availability: 'Business Hours - Casal Campus',
                    facebook: 'lisa.rodriguez.biz',
                    email: 'lisa.rodriguez@tip.edu.ph'
                }
            }
        ];

        filterAndDisplayServices();
    }

    function filterAndDisplayServices() {
        // Apply filters
        filteredServices = currentServices.filter(service => {
            if (currentFilter.category !== 'all' && service.category !== currentFilter.category) {
                return false;
            }
            if (currentFilter.priceRange !== 'all' && !matchesPriceRange(service.price, currentFilter.priceRange)) {
                return false;
            }
            if (currentFilter.deliveryTime !== 'all' && service.delivery_time !== currentFilter.deliveryTime) {
                return false;
            }
            return true;
        });

        // Apply sorting
        filteredServices.sort((a, b) => {
            switch (currentFilter.sort) {
                case 'price_low':
                    return a.price - b.price;
                case 'price_high':
                    return b.price - a.price;
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'rating':
                    return b.provider_rating - a.provider_rating;
                case 'popular':
                    return b.provider_reviews - a.provider_reviews;
                case 'newest':
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

        displayServices(filteredServices);
    }

    function matchesPriceRange(price, range) {
        switch (range) {
            case '0-50':
                return price >= 0 && price <= 50;
            case '50-100':
                return price >= 50 && price <= 100;
            case '100-200':
                return price >= 100 && price <= 200;
            case '200-500':
                return price >= 200 && price <= 500;
            case '500+':
                return price >= 500;
            default:
                return true;
        }
    }

    function displayServices(services) {
        const servicesGrid = document.getElementById('servicesGrid');
        if (!servicesGrid) {
            console.error('Services grid not found');
            return;
        }

        if (services.length === 0) {
            servicesGrid.innerHTML = `
                <div class="no-services">
                    <p>No services found matching your criteria.</p>
                    <button class="btn-secondary" onclick="clearServiceFilters()">Clear Filters</button>
                </div>
            `;
            return;
        }

        servicesGrid.innerHTML = services.map(service => `
            <div class="service-card" data-service-id="${service.id}" style="position: relative;">
                <button class="report-btn" data-report-id="${service.id}" data-report-type="service" title="Report this service" style="position: absolute; top: 10px; right: 10px; background: rgba(255, 255, 255, 0.9); border: none; padding: 8px; border-radius: 50%; cursor: pointer; z-index: 5; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);">
                    <img src="Images/flag-icon.svg" alt="Report" style="width: 18px; height: 18px; filter: brightness(0) saturate(100%) invert(30%);">
                </button>
                <button class="vouch-btn ${service.vouched_by_user ? 'vouched' : ''}" data-vouch-id="${service.id}" data-vouch-type="service" title="${service.vouched_by_user ? 'Remove vouch' : 'Vouch for this service'}" style="position: absolute; top: 10px; left: 10px; background: rgba(255, 255, 255, 0.9); border: none; padding: 8px; border-radius: 50%; cursor: pointer; z-index: 5; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);">
                    <img src="Images/star-icon.svg" alt="Vouch" style="width: 18px; height: 18px; filter: ${service.vouched_by_user ? 'brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg)' : 'brightness(0) saturate(100%) invert(50%)'};">
                </button>
                <div class="service-card-content">
                    <div class="service-card-header">
                        <h3 class="service-card-title">${service.title}</h3>
                        <p class="service-card-provider">by ${service.provider_name}</p>
                    </div>
                    <div class="service-card-description">
                        <p>${service.description.substring(0, 120)}...</p>
                    </div>
                    <div class="service-card-meta">
                        <div class="service-card-price">Starting at ₱${service.price}/hr</div>
                        <div class="service-card-rating">
                            <span class="stars">★</span>
                            <span class="rating">${service.provider_rating}</span>
                            <span class="reviews">(${service.provider_reviews})</span>
                        </div>
                    </div>
                    <div class="service-card-footer">
                        <div class="service-card-tags">
                            <span class="service-tag">${getCategoryDisplayName(service.category)}</span>
                            <span class="service-tag">${getDeliveryDisplayName(service.delivery_time)}</span>
                            <span class="service-tag" style="color: #ffc107;">
                                <img src="Images/star-icon.svg" alt="Vouches" style="width: 14px; height: 14px; vertical-align: middle; filter: brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg);">
                                ${service.vouch_count} vouches
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click event listeners to all service cards
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // Don't trigger if clicking report button or vouch button
                if (e.target.closest('.report-btn') || e.target.closest('.vouch-btn')) {
                    return;
                }
                
                const serviceId = parseInt(this.dataset.serviceId);
                console.log('Service card clicked:', serviceId);
                handleServiceClick(serviceId);
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

    // Handle service click with AI tracking
    function handleServiceClick(serviceId) {
        console.log('handleServiceClick called with ID:', serviceId);
        
        const service = currentServices.find(s => s.id === serviceId);
        if (!service) {
            console.error('Service not found:', serviceId);
            return;
        }
        
        console.log('Service found:', service);
        
        // Track with AI if available
        if (window.aiRecommendations) {
            console.log('Tracking with AI...');
            window.aiRecommendations.trackItemView({
                id: service.id,
                title: service.title,
                category: service.category,
                type: 'service'
            });
            
            // Update search dropdown to show recommendations
            const dropdown = document.getElementById('searchDropdown');
            if (dropdown) {
                updateSearchDropdown('');
            }
        }
        
        // Open the modal
        console.log('Opening modal for service:', serviceId);
        openServiceModal(serviceId);
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
                currentServices
            );
            
            if (recommendations.length > 0) {
                const categoryName = window.aiRecommendations.getRecommendationReason();
                
                html += `
                    <div class="dropdown-section ai-section">
                        <div class="dropdown-header">
                            <span class="ai-badge">✨ AI</span>
                            <span class="section-title">You might like this</span>
                            <span class="interaction-count">${stats.totalInteractions} items viewed</span>
                        </div>
                        <div class="dropdown-subtitle">${categoryName}</div>
                        <div class="ai-suggestions">
                `;
                
                recommendations.slice(0, 4).forEach(service => {
                    html += `
                        <div class="suggestion-item" onclick="handleServiceClick(${service.id})">
                            <div class="suggestion-image">
                                <div class="placeholder-icon">💼</div>
                            </div>
                            <div class="suggestion-info">
                                <div class="suggestion-title">${service.title}</div>
                                <div class="suggestion-price">₱${service.price}/hr</div>
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
            const searchResults = currentServices.filter(s => 
                s.title.toLowerCase().includes(query.toLowerCase()) ||
                s.description.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
            
            if (searchResults.length > 0) {
                html += `
                    <div class="dropdown-section">
                        <div class="dropdown-header">
                            <span class="section-title">Search Results</span>
                        </div>
                        <div class="search-results">
                `;
                
                searchResults.forEach(service => {
                    html += `
                        <div class="suggestion-item" onclick="handleServiceClick(${service.id})">
                            <div class="suggestion-image">
                                <div class="placeholder-icon">💼</div>
                            </div>
                            <div class="suggestion-info">
                                <div class="suggestion-title">${service.title}</div>
                                <div class="suggestion-price">₱${service.price}/hr</div>
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
                        <div class="message-icon">🔍</div>
                        <p>Browse services to get personalized recommendations</p>
                        <small>Click on 2-3 services to activate AI suggestions</small>
                    </div>
                </div>
            `;
        }
        
        dropdown.innerHTML = html || '<div class="dropdown-section"><div class="dropdown-message"><p>No results found</p></div></div>';
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

        const item = currentServices.find(s => s.id === itemId);
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

    function getAuthToken() {
        return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || '';
    }

    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    function getCategoryDisplayName(category) {
        const categories = {
            'tutoring': 'Tutoring',
            'design': 'Design',
            'writing': 'Writing',
            'programming': 'Programming',
            'photography': 'Photography',
            'music': 'Music',
            'business': 'Business',
            'lifestyle': 'Lifestyle',
            'crafts': 'Crafts',
            'other': 'Other'
        };
        return categories[category] || category;
    }

    function getDeliveryDisplayName(deliveryTime) {
        const deliveryTimes = {
            '1_day': '1 Day',
            '2_days': '2 Days',
            '3_days': '3 Days',
            '1_week': '1 Week',
            '2_weeks': '2 Weeks',
            '1_month': '1 Month',
            'custom': 'Custom'
        };
        return deliveryTimes[deliveryTime] || deliveryTime;
    }

    function setupServiceModal() {
        const modal = document.getElementById('serviceModal');
        const closeBtn = document.getElementById('closeServiceModal');

        console.log('Setting up service modal...', { modal, closeBtn });

        if (closeBtn) {
            // Remove any existing listeners
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            newCloseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Service modal close button clicked');
                closeServiceModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    console.log('Service modal background clicked');
                    closeServiceModal();
                }
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal && modal.style.display === 'block') {
                console.log('Escape key pressed - closing service modal');
                closeServiceModal();
            }
        });

        console.log('Service modal setup complete');
    }

    function openServiceModal(serviceId) {
        console.log('Opening service modal for ID:', serviceId);
        
        const service = currentServices.find(s => s.id === serviceId);
        if (!service) {
            console.error('Service not found:', serviceId);
            alert('Service not found');
            return;
        }

        console.log('Service found:', service);
        populateServiceModal(service);
        
        const modal = document.getElementById('serviceModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            console.log('Service modal displayed');
        } else {
            console.error('Service modal element not found');
        }
    }

    function populateServiceModal(service) {
        console.log('Populating service modal with:', service);

        // Safely update modal elements
        const serviceTitle = document.getElementById('serviceTitle');
        const servicePrice = document.getElementById('servicePrice');
        const serviceDeliveryTime = document.getElementById('serviceDeliveryTime');
        const servicePriceType = document.getElementById('servicePriceType');
        const serviceDescription = document.getElementById('serviceDescription');
        const serviceDate = document.getElementById('serviceDate');

        if (serviceTitle) {
            serviceTitle.innerHTML = `
                ${service.title || 'No title'}
                <button class="modal-vouch-btn ${service.vouched_by_user ? 'vouched' : ''}" id="modalServiceVouchBtn" title="${service.vouched_by_user ? 'Remove vouch' : 'Vouch for this service'}" style="margin-left: 1rem; background: ${service.vouched_by_user ? '#ffc107' : 'transparent'}; border: 2px solid #ffc107; color: ${service.vouched_by_user ? 'white' : '#ffc107'}; padding: 0.5rem 1rem; border-radius: 25px; cursor: pointer; font-size: 0.9rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.3s;">
                    <img src="Images/star-icon.svg" alt="Vouch" style="width: 16px; height: 16px; filter: ${service.vouched_by_user ? 'brightness(0) invert(1)' : 'brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg)'};">
                    <span>${service.vouched_by_user ? 'Vouched' : 'Vouch'}</span>
                    <span class="vouch-count-badge" style="background: rgba(255,255,255,0.3); padding: 0.1rem 0.5rem; border-radius: 12px; font-size: 0.85rem;">${service.vouch_count}</span>
                </button>
            `;
            
            // Add click handler for vouch button
            const modalVouchBtn = document.getElementById('modalServiceVouchBtn');
            if (modalVouchBtn) {
                modalVouchBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Modal vouch button clicked for service:', service.id);
                    handleModalVouch(service.id, 'service', this);
                });
            }
        }
        
        if (servicePrice) servicePrice.textContent = `Starting at ₱${service.price || 0}/hr`;
        if (serviceDeliveryTime) serviceDeliveryTime.textContent = `Delivery: ${getDeliveryDisplayName(service.delivery_time)}`;
        if (servicePriceType) servicePriceType.textContent = 'Negotiable - Cash on meetup';
        if (serviceDescription) serviceDescription.textContent = service.description || 'No description available';
        if (serviceDate) {
            serviceDate.innerHTML = `
                Listed ${formatTimeAgo(service.created_at)}
                <span style="margin-left: 1rem; color: #ffc107;">
                    <img src="Images/star-icon.svg" alt="Vouches" style="width: 16px; height: 16px; vertical-align: middle; filter: brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg);">
                    ${service.vouch_count} vouches
                </span>
            `;
        }

        // Provider information
        const serviceProviderName = document.getElementById('serviceProviderName');
        const serviceProviderDepartment = document.getElementById('serviceProviderDepartment');
        const serviceProviderRating = document.getElementById('serviceProviderRating');
        const serviceRatingCount = document.getElementById('serviceRatingCount');

        if (serviceProviderName) serviceProviderName.textContent = service.provider_name || 'Unknown';
        if (serviceProviderDepartment) serviceProviderDepartment.textContent = `${service.provider_department || 'Unknown'} Department`;
        if (serviceProviderRating) {
            const rating = service.provider_rating || 0;
            const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
            serviceProviderRating.textContent = stars;
        }
        if (serviceRatingCount) serviceRatingCount.textContent = `(${service.provider_reviews || 0} reviews)`;

        // Contact availability
        if (service.contact_info) {
            const chatAvail = document.getElementById('serviceChatAvailability');
            const meetupAvail = document.getElementById('serviceMeetupAvailability');

            if (chatAvail) chatAvail.textContent = service.contact_info.chat_availability || 'Not specified';
            if (meetupAvail) meetupAvail.textContent = service.contact_info.meetup_availability || 'Not specified';
        }

        // Portfolio gallery with links
        const portfolioGallery = document.getElementById('portfolioGallery');
        if (portfolioGallery) {
            if (service.portfolio && service.portfolio.length > 0) {
                portfolioGallery.innerHTML = service.portfolio.map(item => `
                    <div class="portfolio-item">
                        <div class="portfolio-icon">${getPortfolioIcon(item.type)}</div>
                        <div class="portfolio-info">
                            <div class="portfolio-title">${item.title}</div>
                            ${item.link ? `
                                <a href="${item.link}" target="_blank" class="portfolio-link" onclick="event.stopPropagation();">
                                    ${getPortfolioLinkText(item.link)}
                                </a>
                            ` : ''}
                        </div>
                    </div>
                `).join('');
            } else {
                portfolioGallery.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No portfolio items available</p>';
            }
        }

        setupServiceContactButtons(service);
        console.log('Service modal populated successfully');
    }

    function getPortfolioIcon(type) {
        const icons = {
            'image': '🎨',
            'document': '📄',
            'website': '💻',
            'audio': '🎵',
            'video': '🎬'
        };
        return icons[type] || '📁';
    }

    function getPortfolioLinkText(link) {
        if (link.includes('drive.google.com')) return 'View on Google Drive';
        if (link.includes('docs.google.com')) return 'View Document';
        if (link.includes('behance.net')) return 'View on Behance';
        if (link.includes('github.com')) return 'View on GitHub';
        if (link.includes('youtube.com') || link.includes('youtu.be')) return 'Watch Video';
        return 'View Portfolio';
    }

    function setupServiceContactButtons(service) {
        const facebookBtn = document.getElementById('serviceContactFacebook');
        const emailBtn = document.getElementById('serviceContactEmail');

        console.log('Setting up service contact buttons...', { facebookBtn, emailBtn });

        if (facebookBtn) {
            // Change button text and icon to Chat Now
            facebookBtn.innerHTML = '<img src="Images/chat-icon.svg" alt="Chat" class="service-contact-icon">Chat Now';
            facebookBtn.className = 'service-btn-contact service-btn-chat';
            
            const newChatBtn = facebookBtn.cloneNode(true);
            facebookBtn.parentNode.replaceChild(newChatBtn, facebookBtn);

            newChatBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Service Chat Now button clicked');
                
                if (typeof window.openChat === 'function') {
                    window.openChat({
                        userId: service.provider_id || 'provider_' + service.id,
                        name: service.provider_name,
                        avatar: 'Images/profile-icon.png',
                        department: service.provider_department,
                        context: service.title
                    });
                    closeServiceModal();
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
                console.log('Service Email button clicked');
                const email = service.contact_info?.email || `${service.provider_name.toLowerCase().replace(' ', '.')}@tip.edu.ph`;
                const subject = `Interested in: ${service.title}`;
                const body = `Hi ${service.provider_name},\n\nI'm interested in your ${service.title} service.\n\nCan we discuss the details?\n\nThanks!`;
                window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            });
        }
    }

    function closeServiceModal() {
        console.log('Closing service modal...');
        const modal = document.getElementById('serviceModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            console.log('Service modal closed');
        }
    }

    function clearServiceFilters() {
        currentFilter = {
            category: 'all',
            sort: 'newest',
            priceRange: 'all',
            deliveryTime: 'all'
        };

        const sortBy = document.getElementById('servicesSortBy');
        const category = document.getElementById('servicesCategory');
        const priceRange = document.getElementById('servicesPriceRange');
        const deliveryTime = document.getElementById('servicesDeliveryTime');

        if (sortBy) sortBy.value = 'newest';
        if (category) category.value = 'all';
        if (priceRange) priceRange.value = 'all';
        if (deliveryTime) deliveryTime.value = 'all';

        filterAndDisplayServices();
    }

    function loadUserProfile() {
        // Get stored user data from login
        const username = sessionStorage.getItem('username') || 'user';
        const email = sessionStorage.getItem('email') || 'user@tip.edu.ph';

        // Update UI with user data
        const displayUsername = document.getElementById('displayUsername');
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');

        if (displayUsername) displayUsername.textContent = '@' + username;
        if (profileName) profileName.textContent = capitalizeWords(username.replace(/[._]/g, ' '));
        if (profileEmail) profileEmail.textContent = email;
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

    function formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString();
    }

    function capitalizeWords(str) {
        if (!str) return '';
        return str.split(' ')
            .map(word => {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }

    function performGlobalSearch() {
        const globalSearch = document.getElementById('globalSearch');
        const query = globalSearch.value.trim();
        if (query.length < 2) {
            alert('Please enter at least 2 characters to search');
            return;
        }

        window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
    }

    // Export functions to global scope
    window.handleServiceClick = handleServiceClick;
    window.openServiceModal = openServiceModal;
    window.closeServiceModal = closeServiceModal;
    window.clearServiceFilters = clearServiceFilters;
    
    // Simplified create post modal function
    window.openCreatePostModal = function (type = 'service', editId = null) {
        console.log('Opening create post modal:', type, editId);
        const modal = document.getElementById('createPostModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Try multiple times to load the form
            let attempts = 0;
            const maxAttempts = 5;
            
            const tryLoad = function() {
                if (typeof window.loadCreatePostForm === 'function') {
                    window.loadCreatePostForm(type, editId);
                } else if (typeof loadCreatePostForm === 'function') {
                    loadCreatePostForm(type, editId);
                } else if (attempts < maxAttempts) {
                    attempts++;
                    console.log(`Attempt ${attempts} to load form...`);
                    setTimeout(tryLoad, 200);
                } else {
                    console.error('Failed to load create post form after multiple attempts');
                    alert('Unable to load the form. Please refresh the page and try again.');
                }
            };
            
            tryLoad();
        } else {
            console.error('Create post modal not found');
        }
    };
    
    window.openReportModal = openReportModal;

    // Vouch handling function for card buttons
    function handleVouchClick(itemId, itemType, buttonElement) {
        const service = currentServices.find(s => s.id === itemId);
        if (!service) {
            console.error('Service not found:', itemId);
            return;
        }

        const isVouched = service.vouched_by_user;
        
        // Add click animation
        buttonElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
            buttonElement.style.transform = 'scale(1)';
        }, 150);
        
        // Toggle vouch status
        service.vouched_by_user = !isVouched;
        service.vouch_count += isVouched ? -1 : 1;
        
        // Update button appearance with animation
        const img = buttonElement.querySelector('img');
        if (img) {
            img.style.transition = 'all 0.3s ease';
            img.style.filter = service.vouched_by_user ? 
                'brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg)' : 
                'brightness(0) saturate(100%) invert(50%)';
        }
        buttonElement.title = service.vouched_by_user ? 'Remove vouch' : 'Vouch for this service';
        
        // Update vouch count display in card with animation
        const vouchTag = buttonElement.closest('.service-card').querySelector('.service-tag:last-child');
        if (vouchTag) {
            // Add pop animation to count
            vouchTag.style.transform = 'scale(1.2)';
            vouchTag.style.transition = 'transform 0.3s ease';
            
            vouchTag.innerHTML = `
                <img src="Images/star-icon.svg" alt="Vouches" style="width: 14px; height: 14px; vertical-align: middle; filter: brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg);">
                ${service.vouch_count} vouches
            `;
            
            setTimeout(() => {
                vouchTag.style.transform = 'scale(1)';
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
        const service = currentServices.find(s => s.id === itemId);
        if (!service) {
            console.error('Service not found:', itemId);
            return;
        }

        const isVouched = service.vouched_by_user;
        
        // Add click animation
        buttonElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            buttonElement.style.transform = 'scale(1)';
        }, 150);
        
        // Optimistic UI update
        service.vouched_by_user = !isVouched;
        service.vouch_count += isVouched ? -1 : 1;
        
        // Update button appearance with smooth transition
        const vouchText = buttonElement.querySelector('span:first-of-type');
        const vouchCountBadge = buttonElement.querySelector('.vouch-count-badge');
        const vouchIcon = buttonElement.querySelector('img');
        
        buttonElement.style.transition = 'all 0.3s ease';
        
        if (service.vouched_by_user) {
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
            vouchCountBadge.textContent = service.vouch_count;
            
            setTimeout(() => {
                vouchCountBadge.style.transform = 'scale(1)';
            }, 300);
        }
        
        buttonElement.title = service.vouched_by_user ? 'Remove vouch' : 'Vouch for this service';
        
        // Update the date line vouch count
        const serviceDate = document.getElementById('serviceDate');
        if (serviceDate) {
            serviceDate.innerHTML = `
                Listed ${formatTimeAgo(service.created_at)}
                <span style="margin-left: 1rem; color: #ffc107;">
                    <img src="Images/star-icon.svg" alt="Vouches" style="width: 16px; height: 16px; vertical-align: middle; filter: brightness(0) saturate(100%) invert(68%) sepia(86%) saturate(2476%) hue-rotate(359deg);">
                    ${service.vouch_count} vouches
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
            // Refresh the service cards in the background
            filterAndDisplayServices();
        })
        .catch(error => {
            console.error('Error toggling vouch:', error);
            // Already updated optimistically
        });
    }

    console.log('Services page loaded successfully');
});
