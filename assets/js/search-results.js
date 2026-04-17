document.addEventListener('DOMContentLoaded', function() {
    let currentResults = [];
    let filteredResults = [];
    let currentFilter = 'all';
    let currentSort = 'relevance';
    let currentQuery = '';

    // Initialize search results page
    initializeSearchResults();

    function initializeSearchResults() {
        loadUserProfile();
        setupEventListeners();
        
        // Get search query from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        currentQuery = urlParams.get('q') || '';
        
        if (currentQuery) {
            document.getElementById('globalSearch').value = currentQuery;
            document.getElementById('currentQuery').textContent = currentQuery;
            performSearch(currentQuery);
        } else {
            showNoResults();
        }
    }

    function setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('globalSearch');
        const searchBtn = document.getElementById('searchBtn');

        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performNewSearch();
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', performNewSearch);
        }

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                setActiveFilter(this.dataset.type);
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('searchSort');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                currentSort = this.value;
                filterAndDisplayResults();
            });
        }

        // Profile dropdown
        setupProfileDropdown();
    }

    function performNewSearch() {
        const query = document.getElementById('globalSearch').value.trim();
        if (query.length < 2) {
            alert('Please enter at least 2 characters to search');
            return;
        }

        // Update URL and perform search
        const newUrl = `search-results.html?q=${encodeURIComponent(query)}`;
        window.history.pushState({}, '', newUrl);
        
        currentQuery = query;
        document.getElementById('currentQuery').textContent = query;
        performSearch(query);
    }

    function performSearch(query) {
        // Show loading state
        const resultsGrid = document.getElementById('resultsGrid');
        resultsGrid.innerHTML = '<div class="loading">Searching...</div>';

        // Simulate API call
        fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken(),
                'X-CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify({
                query: query,
                type: 'global'
            })
        })
        .then(response => response.json())
        .then(data => {
            currentResults = data.results || [];
            filterAndDisplayResults();
        })
        .catch(error => {
            console.error('Search error:', error);
            // Use sample data for demo
            loadSampleResults(query);
        });
    }

    function loadSampleResults(query) {
        // Sample search results based on query
        const sampleData = [
            {
                id: 1,
                type: 'marketplace',
                title: 'MacBook Pro 13" 2022',
                description: 'Barely used MacBook with M4 chip. Perfect for programming and design work. Excellent condition with original box.',
                price: 35000,
                seller: 'johndoe',
                department: 'CCS',
                created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
                views: 24,
                likes: 5,
                image_url: null
            },
            {
                id: 2,
                type: 'services',
                title: 'Math Tutoring Service',
                description: 'Professional mathematics tutoring for all levels. Experienced tutor with 3+ years helping students.',
                price: 150,
                seller: 'mariatutor',
                department: 'Engineering',
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                orders: 12,
                rating: 4.9,
                reviews: 25
            },
            {
                id: 3,
                type: 'marketplace',
                title: 'Programming Books Collection',
                description: 'Collection of programming books including JavaScript, Python, and Java. All in excellent condition.',
                price: 1500,
                seller: 'codemaster',
                department: 'CCS',
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                views: 18,
                likes: 3
            },
            {
                id: 4,
                type: 'services',
                title: 'Logo Design & Branding',
                description: 'Professional logo design and branding services. Create stunning visuals for your business or project.',
                price: 500,
                seller: 'designpro',
                department: 'Arts',
                created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                orders: 8,
                rating: 4.7,
                reviews: 15
            }
        ];

        // Filter results based on query
        currentResults = sampleData.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        );

        filterAndDisplayResults();
    }

    function setActiveFilter(type) {
        currentFilter = type;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });

        filterAndDisplayResults();
    }

    function filterAndDisplayResults() {
        // Filter by type
        if (currentFilter === 'all') {
            filteredResults = [...currentResults];
        } else {
            filteredResults = currentResults.filter(item => item.type === currentFilter);
        }

        // Sort results
        sortResults();

        // Display results
        displayResults();
        updateResultsCount();
    }

    function sortResults() {
        filteredResults.sort((a, b) => {
            switch (currentSort) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'price_low':
                    return a.price - b.price;
                case 'price_high':
                    return b.price - a.price;
                case 'relevance':
                default:
                    // Simple relevance based on title match
                    const aRelevance = a.title.toLowerCase().includes(currentQuery.toLowerCase()) ? 1 : 0;
                    const bRelevance = b.title.toLowerCase().includes(currentQuery.toLowerCase()) ? 1 : 0;
                    return bRelevance - aRelevance;
            }
        });
    }

    function displayResults() {
        const resultsGrid = document.getElementById('resultsGrid');
        const noResults = document.getElementById('noResults');

        if (filteredResults.length === 0) {
            resultsGrid.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        resultsGrid.style.display = 'grid';
        noResults.style.display = 'none';

        resultsGrid.innerHTML = filteredResults.map(result => `
            <div class="result-card ${result.type}" onclick="openResultDetails(${result.id}, '${result.type}')">
                <div class="type-badge">${result.type}</div>
                <div class="result-image">
                    ${result.image_url ? 
                        `<img src="${result.image_url}" alt="${result.title}">` : 
                        `<img src="Images/placeholder-product.jpg" alt="${result.title}" style="width: 100%; height: 100%; object-fit: cover;">`
                    }
                </div>
                <div class="result-info">
                    <div class="result-title">${highlightSearchTerms(result.title)}</div>
                    <div class="result-description">${highlightSearchTerms(result.description)}</div>
                    <div class="result-meta">
                        <div class="result-price">₱${result.price.toLocaleString()}${result.type === 'services' ? '/hr' : ''}</div>
                        <div class="result-seller">@${result.seller}</div>
                    </div>
                    <div class="result-stats">
                        ${result.type === 'marketplace' ? 
                            `<span>
                                <img src="Images/eye-icon.svg" alt="Views" style="width: 14px; height: 14px; margin-right: 2px;">
                                ${result.views} views
                            </span>
                            <span>
                                <img src="Images/heart-icon.svg" alt="Likes" style="width: 14px; height: 14px; margin-right: 2px;">
                                ${result.likes} likes
                            </span>` :
                            `<span>
                                <img src="Images/calendar-icon.svg" alt="Orders" style="width: 14px; height: 14px; margin-right: 2px;">
                                ${result.orders} orders
                            </span>
                            <span>⭐ ${result.rating} (${result.reviews})</span>`
                        }
                        <span>
                            <img src="Images/calendar-icon.svg" alt="Date" style="width: 14px; height: 14px; margin-right: 2px;">
                            ${formatTimeAgo(result.created_at)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function highlightSearchTerms(text) {
        if (!currentQuery) return text;
        
        const regex = new RegExp(`(${currentQuery})`, 'gi');
        return text.replace(regex, '<mark class="highlight">$1</mark>');
    }

    function updateResultsCount() {
        const count = filteredResults.length;
        const resultsCount = document.getElementById('resultsCount');
        resultsCount.textContent = `${count} result${count !== 1 ? 's' : ''} found`;
    }

    function showNoResults() {
        document.getElementById('resultsGrid').style.display = 'none';
        const noResults = document.getElementById('noResults');
        noResults.style.display = 'block';
        noResults.innerHTML = `
            <div class="no-results-icon">
                <img src="Images/black-search.svg" alt="Search" style="width: 64px; height: 64px; opacity: 0.5;">
            </div>
            <h3>No results found</h3>
            <p>Try adjusting your search terms or browse our categories</p>
            <div class="suggestion-links">
                <a href="marketplace.html" class="btn-secondary">Browse Marketplace</a>
                <a href="services.html" class="btn-secondary">Browse Services</a>
            </div>
        `;
        document.getElementById('resultsCount').textContent = '0 results found';
    }

    function openResultDetails(id, type) {
        if (type === 'marketplace') {
            window.location.href = `marketplace.html?item=${id}`;
        } else {
            window.location.href = `services.html?service=${id}`;
        }
    }

    function setupProfileDropdown() {
        const userProfile = document.getElementById('userProfile');
        const userProfileDropdown = document.getElementById('userProfileDropdown');

        if (userProfile && userProfileDropdown) {
            userProfile.addEventListener('click', function(e) {
                e.stopPropagation();
                const isVisible = userProfileDropdown.style.display === 'block';
                userProfileDropdown.style.display = isVisible ? 'none' : 'block';
            });

            document.addEventListener('click', function(event) {
                if (!userProfile.contains(event.target) && !userProfileDropdown.contains(event.target)) {
                    userProfileDropdown.style.display = 'none';
                }
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

    function loadUserProfile() {
        const username = sessionStorage.getItem('username') || 'user';
        const email = sessionStorage.getItem('email') || 'user@tip.edu.ph';

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
                console.log('Opening help...');
                break;
            case 'logout':
                if (confirm('Are you sure you want to logout?')) {
                    sessionStorage.clear();
                    localStorage.clear();
                    window.location.href = 'index.html';
                }
                break;
        }

        const userProfileDropdown = document.getElementById('userProfileDropdown');
        if (userProfileDropdown) {
            userProfileDropdown.style.display = 'none';
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
        return str.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    function getAuthToken() {
        return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || '';
    }

    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    // Global function for opening result details
    window.openResultDetails = openResultDetails;
});
