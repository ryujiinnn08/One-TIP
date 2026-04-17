/*
Backend Integration Notes:
- All AJAX requests should include CSRF token
- User authentication required for all endpoints
- Error handling for network failures
- Loading states for better UX
*/

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.section-content');
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationPanel = document.getElementById('notificationPanel');
    const userProfile = document.getElementById('userProfile');
    const userProfileDropdown = document.getElementById('userProfileDropdown');
    const createPostBtn = document.getElementById('createPostBtn');
    const globalSearch = document.getElementById('globalSearch');
    const searchBtn = document.getElementById('searchBtn');

    // Initialize Dashboard
    initializeDashboard();
    setupEventListeners();

    function initializeDashboard() {
        // Check user authentication
        if (!isUserAuthenticated()) {
            alert('Please log in to access the dashboard');
            window.location.href = 'index.html';
            return;
        }

        // Load user profile data
        loadUserProfile();

        // Load initial dashboard stats
        loadDashboardStats();

        // Load user listings
        loadUserListings();

        // Load recent activity - Make sure this is called
        loadRecentActivity();

        // Load notifications
        loadNotifications();

        // Load announcements
        loadAnnouncements();
    }

    function setupEventListeners() {
        // Navigation tabs
        navTabs.forEach(tab => {
            tab.addEventListener('click', handleTabClick);
        });

        // Only set up notification and profile handlers if elements exist
        if (notificationIcon) {
            notificationIcon.addEventListener('click', toggleNotificationPanel);
        }

        if (userProfile) {
            userProfile.addEventListener('click', toggleProfileDropdown);
        }

        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => openCreatePostModal());
        }

        // Global search functionality - FIXED
        if (globalSearch && searchBtn) {
            console.log('Setting up search functionality...');

            globalSearch.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('Enter pressed in search');
                    performSearch();
                }
            });

            searchBtn.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('Search button clicked');
                performSearch();
            });

            console.log('Search event listeners added successfully');
        } else {
            console.error('Search elements not found:', { globalSearch, searchBtn });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', handleOutsideClicks);

        // Mark all notifications as read
        const markAllReadBtn = document.getElementById('markAllRead');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
        }

        // Profile menu actions
        setupProfileMenuActions();
    }

    function handleTabClick(event) {
        // Only handle button elements, not links
        if (event.target.tagName === 'BUTTON') {
            const targetSection = event.target.dataset.section;

            // Remove active class from all tabs and sections
            navTabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked tab and corresponding section
            event.target.classList.add('active');
            const sectionElement = document.getElementById(targetSection);
            if (sectionElement) {
                sectionElement.classList.add('active');
            }

            // Load section-specific data
            loadSectionData(targetSection);
        }
    }

    function loadSectionData(section) {
        switch (section) {
            case 'services':
                console.log('Loading services data...');
                break;
            case 'dashboard':
                loadDashboardStats();
                break;
        }
    }

    // Dashboard Statistics Loading
    function loadDashboardStats() {
        const userId = sessionStorage.getItem('user_id');
        if (!userId) return;

        fetch(`/api/dashboard/stats?user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
            .then(response => response.json())
            .then(data => {
                updateStatsDisplay(data);
            })
            .catch(error => {
                console.error('Error loading dashboard stats:', error);
                // Show fallback zero data instead of fake numbers
                updateStatsDisplay({
                    marketplace_count: 0,
                    service_count: 0,
                    total_vouches: 0,
                    total_likes: 0,
                    vouches_this_month: 0,
                    likes_this_week: 0
                });
            });
    }

    function updateStatsDisplay(stats) {
        const activeListings = document.getElementById('activeListings');
        const totalVouches = document.getElementById('totalVouches');
        const totalLikes = document.getElementById('totalLikes');
        const servicesActive = document.getElementById('servicesActive');
        const listingsBreakdown = document.getElementById('listingsBreakdown');
        const vouchesThisMonth = document.getElementById('vouchesThisMonth');
        const likesThisWeek = document.getElementById('likesThisWeek');

        if (activeListings) activeListings.textContent = stats.marketplace_count + stats.service_count;
        if (totalVouches) totalVouches.textContent = stats.total_vouches;
        if (totalLikes) totalLikes.textContent = stats.total_likes;
        if (servicesActive) servicesActive.textContent = stats.service_count;

        // Update sublabels
        if (listingsBreakdown) {
            listingsBreakdown.textContent = `${stats.marketplace_count} marketplace | ${stats.service_count} service`;
        }
        if (vouchesThisMonth) {
            vouchesThisMonth.textContent = `+${stats.vouches_this_month || 0} this month`;
        }
        if (likesThisWeek) {
            likesThisWeek.textContent = `+${stats.likes_this_week || 0} this week`;
        }
    }

    // User Listings Loading
    function loadUserListings() {
        const userId = sessionStorage.getItem('user_id');
        if (!userId) return;

        fetch(`/api/user/listings?user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
            .then(response => response.json())
            .then(data => {
                displayUserListings(data.marketplace, data.services);
            })
            .catch(error => {
                console.error('Error loading user listings:', error);
                displayUserListings([], []); // Display empty instead of samples
            });
    }

    function displayUserListings(marketplaceListings, serviceListings) {
        const marketplaceContainer = document.getElementById('marketplaceListings');
        const serviceContainer = document.getElementById('serviceListings');
        const noMarketplace = document.getElementById('noMarketplaceListings');
        const noServices = document.getElementById('noServiceListings');

        // Display marketplace listings
        if (marketplaceContainer) {
            if (marketplaceListings && marketplaceListings.length > 0) {
                marketplaceContainer.innerHTML = marketplaceListings.map(listing => `
                    <div class="listing-card" data-listing-id="${listing.id}">
                        <img src="${listing.image_url || 'Images/placeholder-product.jpg'}" 
                             alt="${listing.title}" class="listing-image">
                        <div class="listing-info">
                            <h4>${listing.title}</h4>
                            <p>${listing.description.substring(0, 100)}...</p>
                            <div class="listing-meta">
                                <span class="listing-price">₱${listing.price}</span>
                                <span class="listing-views">
                                    <img src="Images/eye-icon.svg" alt="Views" style="width: 16px; height: 16px; margin-right: 4px;">
                                    ${listing.view_count} views
                                </span>
                                <span class="listing-likes">
                                    <img src="Images/heart-icon.svg" alt="Likes" style="width: 16px; height: 16px; margin-right: 4px;">
                                    ${listing.like_count} likes
                                </span>
                            </div>
                        </div>
                        <div class="listing-actions">
                            <button class="btn-edit" data-action="edit" data-id="${listing.id}">
                                <img src="Images/pencil-icon.png" alt="Edit" class="action-icon">
                            </button>
                            <button class="btn-delete" data-action="delete" data-id="${listing.id}">
                                <img src="Images/trash-can-icon.png" alt="Delete" class="action-icon">
                            </button>
                        </div>
                    </div>
                `).join('');
                if (noMarketplace) noMarketplace.style.display = 'none';
            } else {
                marketplaceContainer.innerHTML = '';
                if (noMarketplace) noMarketplace.style.display = 'block';
            }
        }

        // Display service listings
        if (serviceContainer) {
            if (serviceListings && serviceListings.length > 0) {
                serviceContainer.innerHTML = serviceListings.map(service => `
                    <div class="service-card" data-service-id="${service.id}">
                        <div class="service-icon">${service.icon || '<img src="https://img.icons8.com/fluency/24/briefcase.png" alt="Service" style="width: 24px; height: 24px;">'}</div>
                        <div class="service-info">
                            <h4>${service.title}</h4>
                            <p>${service.description.substring(0, 100)}...</p>
                            <div class="service-meta">
                                <span class="service-price">₱${service.price}/hr</span>
                                <span class="service-orders">
                                    <img src="Images/calendar-icon.svg" alt="Orders" style="width: 16px; height: 16px; margin-right: 4px;">
                                    ${service.order_count} orders
                                </span>
                                <span class="service-rating">
                                    <img src="Images/star-icon.svg" alt="Rating" style="width: 16px; height: 16px; margin-right: 4px;">
                                    ${service.rating} (${service.review_count} reviews)
                                </span>
                            </div>
                        </div>
                        <div class="service-actions">
                            <button class="btn-edit" data-action="edit" data-id="${service.id}">
                                <img src="Images/pencil-icon.png" alt="Edit" class="action-icon">
                            </button>
                            <button class="btn-delete" data-action="delete" data-id="${service.id}">
                                <img src="Images/trash-can-icon.png" alt="Delete" class="action-icon">
                            </button>
                        </div>
                    </div>
                `).join('');
                if (noServices) noServices.style.display = 'none';
            } else {
                serviceContainer.innerHTML = '';
                if (noServices) noServices.style.display = 'block';
            }
        }

        // Setup action button listeners
        setupListingActionListeners();
    }

    function displaySampleListings() {
        const sampleMarketplace = [{
            id: 1,
            title: 'MacBook M4 Chip H1 2023',
            description: 'Barely used MacBook with M4 chip. Perfect for programming and design work.',
            price: '33000',
            view_count: 24,
            like_count: 5,
            image_url: 'Images/placeholder-product.jpg'
        }];

        const sampleServices = [{
            id: 1,
            title: 'Math Tutoring & Logo Design',
            description: 'Advanced mathematics tutoring and professional logo design. 3 years experience, helped 50+ students.',
            price: '100',
            order_count: 12,
            rating: '4.9',
            review_count: 25,
            icon: '<img src="https://img.icons8.com/fluency/24/money.png" alt="Money" style="width: 24px; height: 24px;">'
        }];

        displayUserListings(sampleMarketplace, sampleServices);
    }

    function setupListingActionListeners() {
        // Edit buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.dataset.id;
                const postType = this.closest('.listing-card') ? 'marketplace' : 'service';
                handleEditListing(id, postType);
            });
        });

        // Delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.dataset.id;
                const postType = this.closest('.listing-card') ? 'marketplace' : 'service';
                handleDeleteListing(id, postType);
            });
        });
    }

    function handleEditListing(id, type) {
        console.log(`Editing ${type} listing with ID: ${id}`);
        openCreatePostModal(type, id);
    }

    function handleDeleteListing(id, type) {
        if (confirm('Are you sure you want to delete this listing?')) {
            fetch(`/api/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + getAuthToken(),
                    'X-CSRF-Token': getCsrfToken()
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const element = document.querySelector(`[data-listing-id="${id}"], [data-service-id="${id}"]`);
                        if (element) {
                            element.remove();
                        }
                        loadDashboardStats();
                    } else {
                        alert('Error deleting listing: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error deleting listing:', error);
                    alert('Error deleting listing. Please try again.');
                });
        }
    }

    // Recent Activity Loading
    function loadRecentActivity() {
        console.log('Loading recent activity...');

        fetch('/api/user/activity', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log('Activity API response:', data);
                displayRecentActivity(data.activities);
            })
            .catch(error => {
                console.error('Error loading recent activity:', error);
                // Always show sample activity for demo
                console.log('Loading sample activity data...');
                displaySampleActivity();
            });
    }

    function displayRecentActivity(activities) {
        const activityList = document.getElementById('recentActivity');

        console.log('Displaying activity for element:', activityList);
        console.log('Activity data:', activities);

        if (!activityList) {
            console.error('Activity list element not found!');
            return;
        }

        if (activities && activities.length > 0) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item" data-activity-id="${activity.id}">
                    <div class="activity-content">
                        <div class="activity-text">${activity.message}</div>
                        <div class="activity-detail">${activity.detail || ''}</div>
                    </div>
                    <div class="activity-action">${activity.action_text}</div>
                    <div class="activity-time">${formatTimeAgo(activity.created_at)}</div>
                </div>
            `).join('');
        } else {
            activityList.innerHTML = '<div class="no-activity">No recent activity found.</div>';
        }
    }

    function displaySampleActivity() {
        console.log('Displaying sample activities...');

        const sampleActivities = [];

        console.log('Sample activities created:', sampleActivities);
        displayRecentActivity(sampleActivities);
    }

    // Notification Functions
    function toggleNotificationPanel() {
        if (!notificationPanel) return;

        const isVisible = notificationPanel.style.display === 'block';

        // Close profile dropdown if open
        if (userProfileDropdown) {
            userProfileDropdown.style.display = 'none';
        }

        notificationPanel.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            loadNotifications();
        }
    }

    function loadNotifications() {
        fetch('/api/notifications', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
            .then(response => response.json())
            .then(data => {
                displayNotifications(data.notifications);
                updateNotificationBadge(data.unread_count);
            })
            .catch(error => {
                console.error('Error loading notifications:', error);
                displaySampleNotifications();
            });
    }

    function displayNotifications(notifications) {
        const notificationList = document.getElementById('notificationList');
        const notificationCount = document.getElementById('notificationCount');

        if (notificationList) {
            if (notifications && notifications.length > 0) {
                notificationList.innerHTML = notifications.map(notification => `
                    <div class="notification-item ${notification.is_read ? '' : 'unread'}" 
                         data-notification-id="${notification.id}">
                        <div class="notification-icon">${notification.icon}</div>
                        <div class="notification-content">
                            <div class="notification-title">${notification.title}</div>
                            <div class="notification-message">${notification.message}</div>
                            <div class="notification-meta">
                                ${notification.sender_username ? `<span class="notification-sender">from @${notification.sender_username}</span>` : ''}
                                <span class="notification-time">${formatTimeAgo(notification.created_at)}</span>
                            </div>
                        </div>
                        <div class="notification-actions">
                            ${!notification.is_read ? '<button class="mark-read-btn" title="Mark as read">✓</button>' : ''}
                            <button class="delete-notification-btn" title="Delete">×</button>
                        </div>
                    </div>
                `).join('');

                const unreadCount = notifications.filter(n => !n.is_read).length;
                if (notificationCount) {
                    notificationCount.textContent = `${unreadCount} unread notifications`;
                }
            } else {
                notificationList.innerHTML = '<div class="no-notifications">No notifications found.</div>';
                if (notificationCount) {
                    notificationCount.textContent = '0 unread notifications';
                }
            }

            setupNotificationClickHandlers();
        }
    }

    function displaySampleNotifications() {
        const sampleNotifications = [];

        displayNotifications(sampleNotifications);
    }

    function setupNotificationClickHandlers() {
        // Click on notification item
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function (e) {
                // Don't trigger if clicking on action buttons
                if (e.target.classList.contains('mark-read-btn') || e.target.classList.contains('delete-notification-btn')) {
                    return;
                }

                const notificationId = this.dataset.notificationId;
                markNotificationAsRead(notificationId);
                this.classList.remove('unread');
            });
        });

        // Mark as read buttons
        document.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const notificationId = parseInt(this.closest('.notification-item').dataset.notificationId);
                markNotificationAsRead(notificationId);
                this.closest('.notification-item').classList.remove('unread');
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-notification-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (confirm('Delete this notification?')) {
                    this.closest('.notification-item').remove();
                }
            });
        });
    }

    function markNotificationAsRead(notificationId) {
        fetch(`/api/notifications/${notificationId}/read`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
            .catch(error => console.error('Error marking notification as read:', error));
    }

    function markAllNotificationsAsRead() {
        fetch('/api/notifications/mark-all-read', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.querySelectorAll('.notification-item.unread').forEach(item => {
                        item.classList.remove('unread');
                    });
                    updateNotificationBadge(0);
                    const notificationCount = document.getElementById('notificationCount');
                    if (notificationCount) {
                        notificationCount.textContent = '0 unread notifications';
                    }
                }
            })
            .catch(error => console.error('Error marking all notifications as read:', error));
    }

    function updateNotificationBadge(count) {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // Profile Functions
    function toggleProfileDropdown() {
        if (!userProfileDropdown) return;

        const isVisible = userProfileDropdown.style.display === 'block';

        // Close notification panel if open
        if (notificationPanel) {
            notificationPanel.style.display = 'none';
        }

        userProfileDropdown.style.display = isVisible ? 'none' : 'block';
    }

    function loadUserProfile() {
        const username = sessionStorage.getItem('username') || 'user';
        const email = sessionStorage.getItem('email') || 'user@tip.edu.ph';

        console.log('Loading profile with username:', username); // Debug log

        // Update UI with user data
        const displayUsername = document.getElementById('displayUsername');
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');

        if (displayUsername) {
            displayUsername.textContent = '@' + username;
            console.log('Updated displayUsername to:', '@' + username);
        }
        if (profileName) {
            profileName.textContent = capitalizeWords(username.replace(/[._]/g, ' '));
        }
        if (profileEmail) {
            profileEmail.textContent = email;
        }

        // Update avatar
        const avatarElements = document.querySelectorAll('.profile-img, .dropdown-avatar');
        avatarElements.forEach(avatar => {
            avatar.src = 'Images/profile-icon.png';
            avatar.alt = username;
        });
    }

    function setupProfileMenuActions() {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const action = this.dataset.action;
                handleProfileAction(action);
            });
        });
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
                handleLogout();
                break;
        }

        // Close dropdown
        if (userProfileDropdown) {
            userProfileDropdown.style.display = 'none';
        }
    }

    function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + getAuthToken(),
                    'X-CSRF-Token': getCsrfToken()
                }
            })
                .then(() => {
                    performLogout();
                })
                .catch(error => {
                    console.error('Error logging out:', error);
                    // Force logout anyway
                    performLogout();
                });
        }
    }

    function performLogout() {
        // Clear all stored authentication data
        sessionStorage.clear();
        localStorage.clear();

        // Show logout message
        alert('You have been logged out successfully');

        // Redirect to login
        window.location.href = 'index.html';
    }

    // Search Functions - FIXED
    function performSearch(query = null) {
        const searchQuery = query || (globalSearch ? globalSearch.value.trim() : '');

        console.log('Dashboard search - Query:', searchQuery);
        console.log('Dashboard search - Input element:', globalSearch);

        if (!searchQuery || searchQuery.length < 2) {
            alert('Please enter at least 2 characters to search');
            return;
        }

        console.log('Dashboard: Performing search for:', searchQuery);

        // Clear the search input
        if (globalSearch) {
            globalSearch.value = '';
        }

        // Redirect to search results
        window.location.href = `search-results.html?q=${encodeURIComponent(searchQuery)}`;
    }

    // Remove the problematic handleGlobalSearch function that was causing issues

    // Announcement Functions
    function loadAnnouncements() {
        const announcementsList = document.getElementById('announcementsList');
        const announcementCount = document.getElementById('announcementCount');

        if (!announcementsList) return;

        const announcements = [];

        if (announcements.length === 0) {
            announcementsList.innerHTML = `
                <div class="no-announcements">
                    <p>No announcements at this time.</p>
                </div>
            `;
            announcementCount.textContent = '0 new';
            return;
        }

        announcementCount.textContent = `${announcements.length} new`;

        announcementsList.innerHTML = announcements.map(announcement => {
            const categoryClass = announcement.priority === 'high' ? 'urgent' : 'info';
            const categoryBadgeClass = announcement.category === 'event' ? 'event' : announcement.priority === 'high' ? 'urgent' : '';

            return `
                <div class="announcement-item ${categoryClass}" data-announcement-id="${announcement.id}">
                    <div class="announcement-header-row">
                        <h4 class="announcement-title">${announcement.title}</h4>
                        <span class="announcement-category ${categoryBadgeClass}">${getCategoryDisplayName(announcement.category)}</span>
                    </div>
                    <p class="announcement-description">${announcement.description}</p>
                    <div class="announcement-footer">
                        <div class="announcement-meta">
                            <span><img src="https://img.icons8.com/fluency/16/conference-call.png" alt="Target" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px;"> ${announcement.target}</span>
                            <span><img src="https://img.icons8.com/fluency/16/calendar.png" alt="Date" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 4px; margin-left: 10px;"> ${formatAnnouncementDate(announcement.date)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers
        document.querySelectorAll('.announcement-item').forEach(item => {
            item.addEventListener('click', function () {
                const id = this.dataset.announcementId;
                const announcement = announcements.find(a => a.id == id);
                if (announcement) {
                    showAnnouncementDetail(announcement);
                }
            });
        });
    }

    function getCategoryDisplayName(category) {
        const categories = {
            'general': 'General',
            'urgent': 'Urgent',
            'event': 'Event',
            'academic': 'Academic',
            'maintenance': 'Maintenance',
            'holiday': 'Holiday',
            'reminder': 'Reminder'
        };
        return categories[category] || category;
    }

    function formatAnnouncementDate(date) {
        const now = new Date();
        const diff = date - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        if (days > 0 && days < 7) return `In ${days} days`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function showAnnouncementDetail(announcement) {
        alert(`📢 ${announcement.title}\n\n${announcement.description}\n\nTarget: ${announcement.target}\nDate: ${formatAnnouncementDate(announcement.date)}\nPosted by: ${announcement.created_by}`);
    }

    // Utility Functions
    function handleOutsideClicks(event) {
        if (notificationIcon && notificationPanel &&
            !notificationIcon.contains(event.target) &&
            !notificationPanel.contains(event.target)) {
            notificationPanel.style.display = 'none';
        }

        if (userProfile && userProfileDropdown &&
            !userProfile.contains(event.target) &&
            !userProfileDropdown.contains(event.target)) {
            userProfileDropdown.style.display = 'none';
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

    function isUserAuthenticated() {
        const authToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
        const userId = sessionStorage.getItem('user_id') || localStorage.getItem('user_id');

        return authToken && userId;
    }

    function getAuthToken() {
        return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || '';
    }

    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    // Global function for opening create post modal
    window.openCreatePostModal = function (type = 'marketplace', editId = null) {
        const modal = document.getElementById('createPostModal');
        if (modal) {
            modal.style.display = 'block';
            if (typeof loadCreatePostForm === 'function') {
                loadCreatePostForm(type, editId);
            }
        }
    };

    // Utility function to capitalize words
    function capitalizeWords(str) {
        return str.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
});
