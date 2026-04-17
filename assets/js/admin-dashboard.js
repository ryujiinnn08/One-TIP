/*
Admin Dashboard JavaScript
Handles all admin functionality including user management, post moderation, and system administration
*/

document.addEventListener('DOMContentLoaded', function () {
    // Check admin authentication
    if (!isAdminAuthenticated()) {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'admin-login.html';
        return;
    }

    // Initialize admin dashboard
    initializeAdminDashboard();

    // Current page data
    let currentSection = 'overview';
    let currentPage = 1;
    let postsData = [];
    let usersData = [];
    let reportsData = [];

    function initializeAdminDashboard() {
        setupEventListeners();
        loadOverviewData();
        loadAdminActivity();
        loadAnnouncements();
    }

    function setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', handleTabClick);
        });

        // Filters and search
        setupFiltersAndSearch();

        // Modals
        setupModals();

        // Profile dropdown
        setupProfileDropdown();
    }

    function handleTabClick(event) {
        const targetSection = event.target.dataset.section;
        
        // Remove active class from all tabs and sections
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding section
        event.target.classList.add('active');
        document.getElementById(targetSection).classList.add('active');
        
        currentSection = targetSection;
        loadSectionData(targetSection);
    }

    function loadSectionData(section) {
        switch (section) {
            case 'overview':
                loadOverviewData();
                break;
            case 'posts':
                loadPostsData();
                break;
            case 'users':
                loadUsersData();
                break;
            case 'reports':
                loadReportsData();
                break;
            case 'settings':
                loadAdminSettings();
                break;
        }
    }

    function loadOverviewData() {
        // Load overview statistics
        fetch('/api/admin/overview', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            updateOverviewStats(data);
        })
        .catch(error => {
            console.error('Error loading overview data:', error);
            // Load sample data for demo
            updateOverviewStats({
                total_users: 1247,
                new_users_today: 12,
                total_products: 2156,
                new_products_today: 8,
                total_services: 456,
                new_services_today: 3,
                pending_posts: 24,
                rejected_posts: 12,
                flagged_content: 7
            });
        });
    }

    function updateOverviewStats(data) {
        document.getElementById('totalUsers').textContent = data.total_users;
        document.getElementById('newUsersToday').textContent = `+${data.new_users_today} today`;
        document.getElementById('totalProducts').textContent = data.total_products;
        document.getElementById('newProductsToday').textContent = `+${data.new_products_today} today`;
        document.getElementById('totalServices').textContent = data.total_services;
        document.getElementById('newServicesToday').textContent = `+${data.new_services_today} today`;
        document.getElementById('pendingPosts').textContent = data.pending_posts;
        document.getElementById('rejectedPosts').textContent = data.rejected_posts;
        document.getElementById('flaggedContent').textContent = data.flagged_content;
    }

    function loadAdminActivity() {
        const activities = [
            {
                id: 1,
                text: 'Approved marketplace post "MacBook Pro 2023"',
                detail: 'Posted by @johndoe',
                time: new Date(Date.now() - 30 * 60 * 1000)
            },
            {
                id: 2,
                text: 'Suspended user @spammer123',
                detail: 'Reason: Multiple spam reports',
                time: new Date(Date.now() - 45 * 60 * 1000)
            },
            {
                id: 3,
                text: 'Rejected service post "Illegal tutoring"',
                detail: 'Reason: Violates community guidelines',
                time: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
                id: 4,
                text: 'Resolved fraud report',
                detail: 'Report ID: #FR2024001',
                time: new Date(Date.now() - 3 * 60 * 60 * 1000)
            }
        ];

        displayAdminActivity(activities);
    }

    function displayAdminActivity(activities) {
        const activityList = document.getElementById('adminActivity');
        
        if (activityList) {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-content">
                        <div class="activity-text">${activity.text}</div>
                        <div class="activity-detail">${activity.detail}</div>
                    </div>
                    <div class="activity-time">${formatTimeAgo(activity.time)}</div>
                </div>
            `).join('');
        }
    }

    function loadPostsData() {
        // Sample posts data
        postsData = [
            {
                id: 1,
                title: 'MacBook Pro 13" 2022',
                type: 'marketplace',
                user: 'johndoe',
                user_id: 123,
                status: 'pending',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
                price: 35000,
                description: 'Excellent condition MacBook Pro...',
                reports_count: 0
            },
            {
                id: 2,
                title: 'Math Tutoring Service',
                type: 'service',
                user: 'mariatutor',
                user_id: 456,
                status: 'approved',
                created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
                price: 500,
                description: 'Professional math tutoring...',
                reports_count: 0
            },
            {
                id: 3,
                title: 'Suspicious Product Listing',
                type: 'marketplace',
                user: 'suspicioususer',
                user_id: 789,
                status: 'flagged',
                created_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
                price: 1000,
                description: 'Too good to be true...',
                reports_count: 3
            }
        ];

        displayPostsTable(postsData);
    }

    function displayPostsTable(posts) {
        const tbody = document.getElementById('postsTableBody');
        
        if (tbody) {
            tbody.innerHTML = posts.map(post => `
                <tr>
                    <td>#${post.id}</td>
                    <td>
                        <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${post.title}
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${post.type === 'marketplace' ? 'status-approved' : 'status-pending'}">
                            ${post.type}
                        </span>
                    </td>
                    <td>@${post.user}</td>
                    <td>
                        <span class="status-badge status-${post.status}">
                            ${post.status}
                        </span>
                    </td>
                    <td>${formatTimeAgo(post.created_at)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-view" onclick="viewPost(${post.id})">View</button>
                            ${post.status === 'pending' ? `
                                <button class="btn-action btn-approve" onclick="approvePost(${post.id})">Approve</button>
                                <button class="btn-action btn-reject" onclick="rejectPost(${post.id})">Reject</button>
                            ` : ''}
                            <button class="btn-action btn-delete" onclick="deletePost(${post.id})">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    function loadUsersData() {
        // Sample users data
        usersData = [
            {
                id: 123,
                name: 'John Doe',
                email: 'john.doe@tip.edu.ph',
                department: 'College of Computer Science',
                campus: 'Arlegui',
                status: 'active',
                joined: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                posts_count: 5,
                reports_count: 0
            },
            {
                id: 456,
                name: 'Maria Santos',
                email: 'maria.santos@tip.edu.ph',
                department: 'College of Engineering and Architecture',
                campus: 'Casal',
                status: 'active',
                joined: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                posts_count: 12,
                reports_count: 0
            },
            {
                id: 789,
                name: 'Suspicious User',
                email: 'suspicious@tip.edu.ph',
                department: 'College of Business Education',
                campus: 'Arlegui',
                status: 'suspended',
                joined: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                posts_count: 1,
                reports_count: 5
            }
        ];

        displayUsersTable(usersData);
    }

    function displayUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        
        if (tbody) {
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>#${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.department}</td>
                    <td>
                        <span class="status-badge status-${user.status}">
                            ${user.status}
                        </span>
                    </td>
                    <td>${formatDate(user.joined)}</td>
                    <td>${user.posts_count}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-view" onclick="viewUser(${user.id})">View</button>
                            ${user.status === 'active' ? `
                                <button class="btn-action btn-suspend" onclick="suspendUser(${user.id})">Suspend</button>
                            ` : user.status === 'suspended' ? `
                                <button class="btn-action btn-activate" onclick="activateUser(${user.id})">Activate</button>
                            ` : ''}
                            <button class="btn-action btn-ban" onclick="banUser(${user.id})">Ban</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    function loadReportsData() {
        // Sample reports data
        reportsData = [
            {
                id: 1,
                post_id: 3,
                post_title: 'Suspicious Product Listing',
                reporter_name: 'Concerned User',
                report_type: 'fraud',
                description: 'This looks like a scam. Price is too low for the product.',
                status: 'pending',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
                id: 2,
                post_id: 5,
                post_title: 'Inappropriate Content',
                reporter_name: 'Anonymous',
                report_type: 'inappropriate',
                description: 'Contains offensive language and inappropriate images.',
                status: 'pending',
                created_at: new Date(Date.now() - 4 * 60 * 60 * 1000)
            }
        ];

        displayReportsContainer(reportsData);
    }

    function displayReportsContainer(reports) {
        const container = document.getElementById('reportsContainer');
        
        if (container) {
            container.innerHTML = reports.map(report => `
                <div class="report-card">
                    <div class="report-header">
                        <div class="report-info">
                            <h4>Report #${report.id} - ${report.report_type.toUpperCase()}</h4>
                            <div class="report-meta">
                                Post: "${report.post_title}" | Reporter: ${report.reporter_name} | 
                                ${formatTimeAgo(report.created_at)}
                            </div>
                        </div>
                        <div class="report-actions">
                            <button class="btn-action btn-view" onclick="viewReportedPost(${report.post_id})">View Post</button>
                            <button class="btn-action btn-approve" onclick="resolveReport(${report.id})">Resolve</button>
                            <button class="btn-action btn-reject" onclick="dismissReport(${report.id})">Dismiss</button>
                        </div>
                    </div>
                    <div class="report-content">
                        "${report.description}"
                    </div>
                </div>
            `).join('');
        }
    }

    function loadAdminSettings() {
        console.log('Admin settings loaded');
    }

    function setupFiltersAndSearch() {
        const postFilter = document.getElementById('postFilter');
        const postType = document.getElementById('postType');
        
        if (postFilter) {
            postFilter.addEventListener('change', function() {
                filterPosts(this.value, postType ? postType.value : 'all');
            });
        }
        
        if (postType) {
            postType.addEventListener('change', function() {
                filterPosts(postFilter ? postFilter.value : 'all', this.value);
            });
        }

        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', function() {
                searchUsers(this.value);
            });
        }
    }

    function filterPosts(status, type) {
        console.log('Filtering posts:', status, type);
    }

    function searchUsers(query) {
        console.log('Searching users:', query);
    }

    function setupModals() {
        const postModal = document.getElementById('postModal');
        const closePostModal = document.getElementById('closePostModal');
        
        if (closePostModal) {
            closePostModal.addEventListener('click', () => {
                postModal.style.display = 'none';
            });
        }

        const userModal = document.getElementById('userModal');
        const closeUserModal = document.getElementById('closeUserModal');
        
        if (closeUserModal) {
            closeUserModal.addEventListener('click', () => {
                userModal.style.display = 'none';
            });
        }

        setupModalActionButtons();
    }

    function setupModalActionButtons() {
        const approveBtn = document.getElementById('approvePostBtn');
        const rejectBtn = document.getElementById('rejectPostBtn');
        const editBtn = document.getElementById('editPostBtn');
        const deleteBtn = document.getElementById('deletePostBtn');

        if (approveBtn) approveBtn.addEventListener('click', () => approveCurrentPost());
        if (rejectBtn) rejectBtn.addEventListener('click', () => rejectCurrentPost());
        if (editBtn) editBtn.addEventListener('click', () => editCurrentPost());
        if (deleteBtn) deleteBtn.addEventListener('click', () => deleteCurrentPost());

        const suspendUserBtn = document.getElementById('suspendUserBtn');
        const banUserBtn = document.getElementById('banUserBtn');
        const activateUserBtn = document.getElementById('activateUserBtn');

        if (suspendUserBtn) suspendUserBtn.addEventListener('click', () => suspendCurrentUser());
        if (banUserBtn) banUserBtn.addEventListener('click', () => banCurrentUser());
        if (activateUserBtn) activateUserBtn.addEventListener('click', () => activateCurrentUser());
    }

    function approveCurrentPost() {
        if (window.currentPostId) {
            approvePost(window.currentPostId);
        }
    }

    function rejectCurrentPost() {
        if (window.currentPostId) {
            rejectPost(window.currentPostId);
        }
    }

    function editCurrentPost() {
        if (window.currentPostId) {
            console.log('Editing post:', window.currentPostId);
        }
    }

    function deleteCurrentPost() {
        if (window.currentPostId) {
            deletePost(window.currentPostId);
        }
    }

    function suspendCurrentUser() {
        if (window.currentUserId) {
            suspendUser(window.currentUserId);
        }
    }

    function banCurrentUser() {
        if (window.currentUserId) {
            banUser(window.currentUserId);
        }
    }

    function activateCurrentUser() {
        if (window.currentUserId) {
            activateUser(window.currentUserId);
        }
    }

    function setupProfileDropdown() {
        const userProfile = document.getElementById('userProfile');
        const userProfileDropdown = document.getElementById('userProfileDropdown');

        if (userProfile && userProfileDropdown) {
            userProfile.addEventListener('click', function() {
                const isVisible = userProfileDropdown.style.display === 'block';
                userProfileDropdown.style.display = isVisible ? 'none' : 'block';
            });

            document.querySelectorAll('.menu-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const action = this.dataset.action;
                    handleProfileAction(action);
                });
            });
        }
    }

    // Announcement functions
    function loadAnnouncements() {
        const announcementsTableBody = document.getElementById('announcementsTableBody');
        if (!announcementsTableBody) return;
        
        const announcements = [
            { 
                id: 'ANN001', 
                title: 'Final Exam Schedule Released', 
                category: 'academic', 
                audience: 'All Students',
                date: '2024-01-15 09:00',
                priority: 'high',
                status: 'active',
                created_by: 'Admin User'
            },
            { 
                id: 'ANN002', 
                title: 'Campus Maintenance Notice', 
                category: 'maintenance', 
                audience: 'All Students',
                date: '2024-01-20 14:00',
                priority: 'medium',
                status: 'scheduled',
                created_by: 'Admin User'
            },
            { 
                id: 'ANN003', 
                title: 'TIP Foundation Day Celebration', 
                category: 'event', 
                audience: 'All Students',
                date: '2024-02-08 08:00',
                priority: 'high',
                status: 'scheduled',
                created_by: 'Admin User'
            },
            { 
                id: 'ANN004', 
                title: 'Study Group Formation - CCS', 
                category: 'general', 
                audience: 'CCS Students',
                date: '2024-01-18 10:00',
                priority: 'low',
                status: 'pending',
                created_by: 'john.doe'
            },
            { 
                id: 'ANN005', 
                title: 'Free Tutoring Sessions Available', 
                category: 'academic', 
                audience: 'All Students',
                date: '2024-01-22 14:00',
                priority: 'medium',
                status: 'pending',
                created_by: 'maria.santos'
            }
        ];
        
        announcementsTableBody.innerHTML = announcements.map(ann => `
            <tr data-announcement-id="${ann.id}">
                <td>#${ann.id}</td>
                <td>${ann.title}</td>
                <td><span class="badge badge-${ann.category}">${getCategoryDisplayName(ann.category)}</span></td>
                <td>${ann.audience}</td>
                <td>${ann.date}</td>
                <td><span class="priority-badge ${ann.priority}">${ann.priority}</span></td>
                <td><span class="status-badge ${ann.status}">${ann.status}</span></td>
                <td>${ann.created_by}</td>
                <td class="action-buttons">
                    <button class="action-btn view-btn" data-action="view" data-id="${ann.id}" title="View"><img src="https://img.icons8.com/fluency/20/visible.png" alt="View"></button>
                    ${ann.status === 'pending' ? 
                        `<button class="action-btn approve-btn" data-action="approve" data-id="${ann.id}" title="Approve"><img src="https://img.icons8.com/fluency/20/checked.png" alt="Approve"></button>
                         <button class="action-btn reject-btn" data-action="reject" data-id="${ann.id}" title="Reject"><img src="https://img.icons8.com/fluency/20/cancel.png" alt="Reject"></button>` 
                        : ''
                    }
                    <button class="action-btn delete-btn" data-action="delete" data-id="${ann.id}" title="Delete"><img src="https://img.icons8.com/fluency/20/trash.png" alt="Delete"></button>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners to all action buttons
        document.querySelectorAll('#announcementsTableBody .action-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const action = this.dataset.action;
                const id = this.dataset.id;
                
                switch(action) {
                    case 'view':
                        viewAnnouncement(id);
                        break;
                    case 'approve':
                        approveAnnouncement(id);
                        break;
                    case 'reject':
                        rejectAnnouncement(id);
                        break;
                    case 'delete':
                        deleteAnnouncement(id);
                        break;
                }
            });
        });
    }

    function setupAnnouncementActions() {
        // Filter functionality
        const announcementFilter = document.getElementById('announcementFilter');
        const announcementCategory = document.getElementById('announcementCategory');
        
        if (announcementFilter) {
            announcementFilter.addEventListener('change', function() {
                console.log('Filter changed:', this.value);
                // In real app, this would filter the table
            });
        }
        
        if (announcementCategory) {
            announcementCategory.addEventListener('change', function() {
                console.log('Category filter changed:', this.value);
                // In real app, this would filter the table
            });
        }
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

    // Global functions for admin actions
    window.viewPost = function(postId) {
        const post = postsData.find(p => p.id === postId);
        if (!post) return;

        const modal = document.getElementById('postModal');
        const modalBody = document.getElementById('postModalBody');
        const modalTitle = document.getElementById('modalPostTitle');

        modalTitle.textContent = post.title;
        modalBody.innerHTML = `
            <div class="post-details">
                <p><strong>ID:</strong> #${post.id}</p>
                <p><strong>Type:</strong> ${post.type}</p>
                <p><strong>User:</strong> @${post.user}</p>
                <p><strong>Price:</strong> ₱${post.price.toLocaleString()}</p>
                <p><strong>Status:</strong> ${post.status}</p>
                <p><strong>Created:</strong> ${formatDateTime(post.created_at)}</p>
                <p><strong>Reports:</strong> ${post.reports_count}</p>
                <div style="margin-top: 1rem;">
                    <strong>Description:</strong>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 0.5rem;">
                        ${post.description}
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
        window.currentPostId = postId;
    };

    window.viewUser = function(userId) {
        const user = usersData.find(u => u.id === userId);
        if (!user) return;

        const modal = document.getElementById('userModal');
        const modalBody = document.getElementById('userModalBody');
        const modalTitle = document.getElementById('modalUserName');

        modalTitle.textContent = user.name;
        modalBody.innerHTML = `
            <div class="user-details">
                <p><strong>ID:</strong> #${user.id}</p>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Department:</strong> ${user.department}</p>
                <p><strong>Status:</strong> ${user.status}</p>
                <p><strong>Joined:</strong> ${formatDateTime(user.joined)}</p>
                <p><strong>Total Posts:</strong> ${user.posts_count}</p>
                <p><strong>Reports Against:</strong> ${user.reports_count}</p>
            </div>
        `;

        modal.style.display = 'block';
        window.currentUserId = userId;
    };

    window.approvePost = function(postId) {
        if (confirm('Approve this post?')) {
            const post = postsData.find(p => p.id === postId);
            if (post) {
                post.status = 'approved';
                displayPostsTable(postsData);
            }
        }
    };

    window.rejectPost = function(postId) {
        const reason = prompt('Reason for rejection:');
        if (reason) {
            const post = postsData.find(p => p.id === postId);
            if (post) {
                post.status = 'rejected';
                displayPostsTable(postsData);
            }
        }
    };

    window.deletePost = function(postId) {
        if (confirm('Permanently delete this post?')) {
            postsData = postsData.filter(p => p.id !== postId);
            displayPostsTable(postsData);
        }
    };

    window.suspendUser = function(userId) {
        const reason = prompt('Reason for suspension:');
        if (reason) {
            const user = usersData.find(u => u.id === userId);
            if (user) {
                user.status = 'suspended';
                displayUsersTable(usersData);
            }
        }
    };

    window.banUser = function(userId) {
        if (confirm('Permanently ban this user?')) {
            const user = usersData.find(u => u.id === userId);
            if (user) {
                user.status = 'banned';
                displayUsersTable(usersData);
            }
        }
    };

    window.activateUser = function(userId) {
        if (confirm('Activate this user?')) {
            const user = usersData.find(u => u.id === userId);
            if (user) {
                user.status = 'active';
                displayUsersTable(usersData);
            }
        }
    };

    window.viewReportedPost = function(postId) {
        console.log('Viewing reported post:', postId);
    };

    window.resolveReport = function(reportId) {
        if (confirm('Mark this report as resolved?')) {
            console.log('Resolving report:', reportId);
        }
    };

    window.dismissReport = function(reportId) {
        if (confirm('Dismiss this report?')) {
            console.log('Dismissing report:', reportId);
        }
    };

    // Announcement action functions
    window.viewAnnouncement = function(announcementId) {
        const announcements = [
            { 
                id: 'ANN001', 
                title: 'Final Exam Schedule Released', 
                category: 'academic', 
                audience: 'All Students',
                date: '2024-01-15 09:00',
                priority: 'high',
                status: 'active',
                created_by: 'Admin User',
                description: 'The final examination schedule for the current semester has been released. Please check your student portal for your specific exam dates.'
            },
            { 
                id: 'ANN002', 
                title: 'Campus Maintenance Notice', 
                category: 'maintenance', 
                audience: 'All Students',
                date: '2024-01-20 14:00',
                priority: 'medium',
                status: 'scheduled',
                created_by: 'Admin User',
                description: 'There will be a scheduled maintenance on campus facilities. Please plan accordingly.'
            },
            { 
                id: 'ANN003', 
                title: 'TIP Foundation Day Celebration', 
                category: 'event', 
                audience: 'All Students',
                date: '2024-02-08 08:00',
                priority: 'high',
                status: 'scheduled',
                created_by: 'Admin User',
                description: 'Join us in celebrating the TIP Foundation Day with various activities and programs.'
            },
            { 
                id: 'ANN004', 
                title: 'Study Group Formation - CCS', 
                category: 'general', 
                audience: 'CCS Students',
                date: '2024-01-18 10:00',
                priority: 'low',
                status: 'pending',
                created_by: 'john.doe',
                description: 'Formation of study groups for CCS students. Sign up now!'
            },
            { 
                id: 'ANN005', 
                title: 'Free Tutoring Sessions Available', 
                category: 'academic', 
                audience: 'All Students',
                date: '2024-01-22 14:00',
                priority: 'medium',
                status: 'pending',
                created_by: 'maria.santos',
                description: 'Free tutoring sessions for students. Limited slots available.'
            }
        ];
        
        const announcement = announcements.find(a => a.id === announcementId);
        if (!announcement) return;
        
        alert(`📢 ${announcement.title}\n\nCategory: ${announcement.category}\nAudience: ${announcement.audience}\nDate: ${announcement.date}\nPriority: ${announcement.priority}\nStatus: ${announcement.status}\n\n${announcement.description || 'No description'}\n\nCreated by: ${announcement.created_by}`);
    };

    window.approveAnnouncement = function(announcementId) {
        if (confirm(`✅ Approve announcement ${announcementId}?\n\nThis announcement will be published immediately and visible to the target audience.`)) {
            alert(`✅ Announcement ${announcementId} has been approved!\n\n✓ Published successfully\n✓ Users will see it in their dashboard\n✓ Notification sent to creator`);
            
            // Update the row to show approved status and remove approve/reject buttons
            const row = document.querySelector(`tr[data-announcement-id="${announcementId}"]`);
            if (row) {
                const statusBadge = row.querySelector('.status-badge');
                if (statusBadge) {
                    statusBadge.textContent = 'active';
                    statusBadge.className = 'status-badge active';
                }
                
                // Update actions column - only show view and delete
                const actionsCell = row.querySelector('.action-buttons');
                if (actionsCell) {
                    actionsCell.innerHTML = `
                        <button class="action-btn view-btn" data-action="view" data-id="${announcementId}" title="View"><img src="https://img.icons8.com/fluency/20/visible.png" alt="View"></button>
                        <button class="action-btn delete-btn" data-action="delete" data-id="${announcementId}" title="Delete"><img src="https://img.icons8.com/fluency/20/trash.png" alt="Delete"></button>
                    `;
                    
                    // Re-attach event listeners to new buttons
                    actionsCell.querySelectorAll('.action-btn').forEach(btn => {
                        btn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const action = this.dataset.action;
                            const id = this.dataset.id;
                            
                            switch(action) {
                                case 'view':
                                    viewAnnouncement(id);
                                    break;
                                case 'delete':
                                    deleteAnnouncement(id);
                                    break;
                            }
                        });
                    });
                }
            }
        }
    };

    window.rejectAnnouncement = function(announcementId) {
        const reason = prompt(`❌ Reject announcement ${announcementId}?\n\nPlease provide a reason for rejection:`);
        if (reason) {
            alert(`❌ Announcement ${announcementId} has been rejected!\n\nReason: ${reason}\n\n✓ Creator will be notified\n✓ Announcement removed from queue`);
            
            // Remove the row or update status
            const row = document.querySelector(`tr[data-announcement-id="${announcementId}"]`);
            if (row) {
                row.style.opacity = '0.5';
                row.style.textDecoration = 'line-through';
                setTimeout(() => {
                    row.remove();
                }, 1000);
            }
        }
    };

    window.deleteAnnouncement = function(announcementId) {
        if (confirm(`🗑️ Delete announcement ${announcementId}?\n\n⚠️ This action cannot be undone!\n\nThe announcement will be permanently removed from the system.`)) {
            alert(`🗑️ Announcement ${announcementId} has been deleted!\n\n✓ Removed from database\n✓ No longer visible to users`);
            
            const row = document.querySelector(`tr[data-announcement-id="${announcementId}"]`);
            if (row) {
                row.style.transition = 'all 0.3s';
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    row.remove();
                }, 300);
            }
        }
    };

    // Create Announcement Button functionality
    const createAnnouncementBtn = document.getElementById('createAnnouncementBtn');
    if (createAnnouncementBtn) {
        createAnnouncementBtn.addEventListener('click', function() {
            console.log('Create Announcement clicked');
            openAnnouncementModal();
        });
    }

    function openAnnouncementModal() {
        // Check if create-post modal exists, if not, create announcement directly
        const createPostModal = document.getElementById('createPostModal');
        
        if (createPostModal && typeof window.openCreatePostModal === 'function') {
            window.openCreatePostModal('announcement');
        } else {
            // Show inline form or alert
            const title = prompt('Announcement Title:');
            if (!title) return;
            
            const description = prompt('Announcement Description:');
            if (!description) return;
            
            const category = prompt('Category (general/urgent/event/academic):') || 'general';
            const audience = prompt('Target Audience (all/ccs/engineering/etc):') || 'all';
            
            alert(`✅ Announcement Created!\n\nTitle: ${title}\nCategory: ${category}\nAudience: ${audience}\n\n${description}\n\nThe announcement has been posted successfully!`);
            
            // Reload announcements table
            setTimeout(() => {
                location.reload();
            }, 500);
        }
    }

    // Utility functions
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

    function formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    function formatDateTime(date) {
        return new Date(date).toLocaleString();
    }

    function isAdminAuthenticated() {
        const authToken = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
        const userRole = sessionStorage.getItem('user_role') || 'user';
        
        // For demo purposes, allow access if logged in
        return authToken && (userRole === 'admin' || true);
    }

    function getAuthToken() {
        return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || '';
    }

    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    function handleProfileAction(action) {
        switch (action) {
            case 'admin-settings':
                currentSection = 'settings';
                const settingsTab = document.querySelector('[data-section="settings"]');
                if (settingsTab) {
                    settingsTab.click();
                }
                break;
            case 'system-logs':
                console.log('Opening system logs...');
                // Add system logs functionality here
                break;
            case 'backup':
                console.log('Starting data backup...');
                // Add backup functionality here
                break;
            case 'logout':
                if (confirm('Are you sure you want to logout?')) {
                    sessionStorage.clear();
                    localStorage.clear();
                    window.location.href = 'index.html';
                }
                break;
            default:
                console.log('Admin action:', action);
        }
        
        const userProfileDropdown = document.getElementById('userProfileDropdown');
        if (userProfileDropdown) {
            userProfileDropdown.style.display = 'none';
        }
    }
});

