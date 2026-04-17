/*
Backend Integration Notes:
- GET /api/notifications for loading notifications
- POST /api/notifications/{id}/read for marking as read
- POST /api/notifications/mark-all-read for bulk operations
- WebSocket connection for real-time notifications (optional)
*/

document.addEventListener('DOMContentLoaded', function() {
    let notifications = [];
    let filteredNotifications = [];
    let currentFilter = 'all';
    
    // DOM Elements
    const notificationPanel = document.getElementById('notificationPanel');
    const notificationList = document.getElementById('notificationList');
    const notificationCount = document.getElementById('notificationCount');
    const notificationBadge = document.getElementById('notificationBadge');
    const filterButtons = document.querySelectorAll('.notification-btn[data-filter]');
    const markAllReadBtn = document.getElementById('markAllRead');

    // Initialize notifications
    initializeNotifications();

    function initializeNotifications() {
        setupEventListeners();
        loadNotifications();
        
        // Check for new notifications every 30 seconds
        setInterval(checkForNewNotifications, 30000);
    }

    function setupEventListeners() {
        // Filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.dataset.filter;
                setActiveFilter(filter);
                filterNotifications(filter);
            });
        });

        // Mark all as read
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
        }
    }

    function loadNotifications() {
        /*
        Backend API Endpoint: GET /api/notifications
        
        PHP Example:
        $sql = "SELECT n.*, p.title as post_title, u.username as sender_username 
                FROM notifications n 
                LEFT JOIN posts p ON n.post_id = p.id 
                LEFT JOIN users u ON n.sender_id = u.id 
                WHERE n.user_id = ? 
                ORDER BY n.created_at DESC 
                LIMIT 50";
        */

        fetch('/api/notifications', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                notifications = data.notifications;
                updateNotificationDisplay();
            } else {
                loadSampleNotifications();
            }
        })
        .catch(error => {
            console.error('Error loading notifications:', error);
            loadSampleNotifications();
        });
    }

    function loadSampleNotifications() {
        // Clear notifications when there are no real ones
        notifications = [];
        updateNotificationDisplay();
    }

    function updateNotificationDisplay() {
        filterNotifications(currentFilter);
        updateNotificationBadge();
        updateNotificationCount();
    }

    function filterNotifications(filter) {
        currentFilter = filter;
        
        switch(filter) {
            case 'unread':
                filteredNotifications = notifications.filter(n => !n.is_read);
                break;
            case 'all':
            default:
                filteredNotifications = notifications;
                break;
        }
        
        renderNotifications();
        setActiveFilter(filter);
    }

    function renderNotifications() {
        if (!notificationList) return;

        if (filteredNotifications.length === 0) {
            notificationList.innerHTML = `
                <div class="no-notifications">
                    <div class="no-notifications-icon">🔔</div>
                    <p>No notifications found</p>
                    <small>We'll notify you when something happens</small>
                </div>
            `;
            return;
        }

        notificationList.innerHTML = filteredNotifications.map(notification => `
            <div class="notification-item ${notification.is_read ? '' : 'unread'}" 
                 data-notification-id="${notification.id}"
                 data-action-url="${notification.action_url || '#'}">
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

        setupNotificationItemHandlers();
    }

    function setupNotificationItemHandlers() {
        // Click on notification item
        notificationList.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function(e) {
                // Don't trigger if clicking on action buttons
                if (e.target.classList.contains('mark-read-btn') || e.target.classList.contains('delete-notification-btn')) {
                    return;
                }

                const notificationId = parseInt(this.dataset.notificationId);
                const actionUrl = this.dataset.actionUrl;
                
                handleNotificationClick(notificationId, actionUrl);
            });
        });

        // Mark as read buttons
        notificationList.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const notificationId = parseInt(this.closest('.notification-item').dataset.notificationId);
                markNotificationAsRead(notificationId);
            });
        });

        // Delete buttons
        notificationList.querySelectorAll('.delete-notification-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const notificationId = parseInt(this.closest('.notification-item').dataset.notificationId);
                deleteNotification(notificationId);
            });
        });
    }

    function handleNotificationClick(notificationId, actionUrl) {
        // Mark as read if unread
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.is_read) {
            markNotificationAsRead(notificationId);
        }

        // Navigate to action URL if valid
        if (actionUrl && actionUrl !== '#') {
            // For now, just log the action
            console.log('Navigating to:', actionUrl);
            // In a real app: window.location.href = actionUrl;
        }
    }

    function markNotificationAsRead(notificationId) {
        /*
        Backend API Endpoint: POST /api/notifications/{id}/read
        */
        
        fetch(`/api/notifications/${notificationId}/read`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update local notification
                const notification = notifications.find(n => n.id === notificationId);
                if (notification) {
                    notification.is_read = true;
                    updateNotificationDisplay();
                }
            }
        })
        .catch(error => {
            console.error('Error marking notification as read:', error);
            // Update locally anyway for demo
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.is_read = true;
                updateNotificationDisplay();
            }
        });
    }

    function deleteNotification(notificationId) {
        if (!confirm('Delete this notification?')) {
            return;
        }

        /*
        Backend API Endpoint: DELETE /api/notifications/{id}
        */
        
        fetch(`/api/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Remove from local array
                notifications = notifications.filter(n => n.id !== notificationId);
                updateNotificationDisplay();
            }
        })
        .catch(error => {
            console.error('Error deleting notification:', error);
            // Remove locally anyway for demo
            notifications = notifications.filter(n => n.id !== notificationId);
            updateNotificationDisplay();
        });
    }

    function markAllNotificationsAsRead() {
        const unreadNotifications = notifications.filter(n => !n.is_read);
        
        if (unreadNotifications.length === 0) {
            return;
        }

        /*
        Backend API Endpoint: POST /api/notifications/mark-all-read
        */
        
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
                // Update all notifications locally
                notifications.forEach(n => n.is_read = true);
                updateNotificationDisplay();
            }
        })
        .catch(error => {
            console.error('Error marking all notifications as read:', error);
            // Update locally anyway for demo
            notifications.forEach(n => n.is_read = true);
            updateNotificationDisplay();
        });
    }

    function setActiveFilter(filter) {
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        // Update unread count in filter button
        const unreadBtn = document.querySelector('[data-filter="unread"]');
        if (unreadBtn) {
            const unreadCount = notifications.filter(n => !n.is_read).length;
            unreadBtn.textContent = `Unread (${unreadCount})`;
        }
    }

    function updateNotificationBadge() {
        if (!notificationBadge) return;
        
        const unreadCount = notifications.filter(n => !n.is_read).length;
        
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            notificationBadge.style.display = 'flex';
        } else {
            notificationBadge.style.display = 'none';
        }
    }

    function updateNotificationCount() {
        if (!notificationCount) return;
        
        const unreadCount = notifications.filter(n => !n.is_read).length;
        notificationCount.textContent = `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`;
    }

    function checkForNewNotifications() {
        // This would typically make an API call to check for new notifications
        // For now, we'll just simulate it
        const lastNotificationTime = notifications.length > 0 ? 
            new Date(notifications[0].created_at).getTime() : 0;
        
        fetch(`/api/notifications/check-new?since=${lastNotificationTime}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.notifications.length > 0) {
                // Add new notifications to the beginning
                notifications = [...data.notifications, ...notifications];
                updateNotificationDisplay();
                
                // Show notification sound/animation
                showNewNotificationAlert(data.notifications.length);
            }
        })
        .catch(error => {
            console.error('Error checking for new notifications:', error);
        });
    }

    function showNewNotificationAlert(count) {
        // Flash notification icon
        if (notificationBadge) {
            notificationBadge.style.animation = 'pulse 0.5s ease-in-out 3';
        }
        
        // Optional: Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification(`You have ${count} new notification${count > 1 ? 's' : ''}`, {
                icon: '/Images/LOGO-LONG.png',
                badge: '/Images/LOGO-LONG.png'
            });
        }
    }

    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
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

    function getAuthToken() {
        return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || '';
    }

    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    // Request notification permission on load
    requestNotificationPermission();

    // Export functions for external use
    window.notificationManager = {
        loadNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        filterNotifications
    };
});
