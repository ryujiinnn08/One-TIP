/*
Help & Support System
Fixed event handling and button functionality
*/

console.log('🚀 Help & Support JavaScript loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded - Initializing Help System');
    initializeHelpSystem();
});

function initializeHelpSystem() {
    console.log('⚙️ Initializing Help System...');
    setupEventListeners();
    loadUserProfile();
    loadFAQs();
    console.log('✅ Help System initialized');
}

function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    setupQuickActionButtons();
    setupContactModalListeners();
    setupFAQListeners();
    setupProfileDropdown();
    setupSearchListeners();
    setupGlobalHandlers();
    console.log('✅ All event listeners configured');
}

function setupQuickActionButtons() {
    const contactAdminBtn = document.getElementById('helpContactAdminBtn');
    if (contactAdminBtn) {
        contactAdminBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📧 Contact Admin button clicked');
            openContactModal();
        });
        console.log('✅ Contact Admin button ready');
    } else {
        console.error('❌ Contact Admin button not found');
    }

    const browseKnowledgeBtn = document.getElementById('helpBrowseKnowledgeBtn');
    if (browseKnowledgeBtn) {
        browseKnowledgeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📚 Browse Knowledge button clicked');
            scrollToKnowledgeBase();
        });
        console.log('✅ Browse Knowledge button ready');
    } else {
        console.error('❌ Browse Knowledge button not found');
    }
}

function setupContactModalListeners() {
    const closeContactModal = document.getElementById('helpCloseContactModal');
    const cancelContactBtn = document.getElementById('helpCancelContactBtn');
    const contactForm = document.getElementById('helpContactAdminForm');
    const supportMessage = document.getElementById('helpSupportMessage');

    if (closeContactModal) {
        closeContactModal.addEventListener('click', closeContactModalHandler);
    }

    if (cancelContactBtn) {
        cancelContactBtn.addEventListener('click', closeContactModalHandler);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', submitContactForm);
    }

    if (supportMessage) {
        supportMessage.addEventListener('input', updateCharCounter);
    }
}

function setupFAQListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('faq-question')) {
            toggleFAQAnswer(e.target);
        }
    });

    const faqSearch = document.getElementById('helpFaqSearch');
    if (faqSearch) {
        faqSearch.addEventListener('input', function(e) {
            searchFAQs(e.target.value);
        });
    }

    document.querySelectorAll('.category-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-help-category');
            filterFAQsByCategory(category);
            updateActiveCategoryTab(this);
        });
    });
}

function setupProfileDropdown() {
    const userProfile = document.getElementById('helpUserProfile');
    const dropdown = document.getElementById('helpUserProfileDropdown');

    if (userProfile && dropdown) {
        userProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
        });
    }

    document.querySelectorAll('[data-help-action]').forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-help-action');
            handleProfileAction(action);
        });
    });
}

function setupSearchListeners() {
    const searchBtn = document.getElementById('helpSearchBtn');
    const searchInput = document.getElementById('helpGlobalSearch');

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }
}

function setupGlobalHandlers() {
    document.addEventListener('click', function(e) {
        const contactModal = document.getElementById('helpContactAdminModal');
        const userProfile = document.getElementById('helpUserProfile');
        const dropdown = document.getElementById('helpUserProfileDropdown');
        
        if (contactModal && contactModal.style.display === 'block' && e.target === contactModal) {
            closeContactModalHandler();
        }
        
        if (userProfile && dropdown && 
            !userProfile.contains(e.target) && 
            !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeContactModalHandler();
        }
    });
}

// Contact Modal Functions
function openContactModal() {
    console.log('📧 Opening contact modal...');
    const modal = document.getElementById('helpContactAdminModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('✅ Contact modal opened');
    } else {
        console.error('❌ Contact modal not found');
    }
}

function closeContactModalHandler() {
    console.log('❌ Closing contact modal...');
    const modal = document.getElementById('helpContactAdminModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function submitContactForm(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('helpSendContactBtn');
    if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(function() {
            alert('✅ Support ticket submitted successfully!\n\nTicket ID: #SUP' + Date.now().toString().slice(-6));
            closeContactModalHandler();
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
        }, 2000);
    }
}

function updateCharCounter() {
    const textarea = document.getElementById('helpSupportMessage');
    const counter = document.getElementById('helpMessageCharCount');
    if (textarea && counter) {
        counter.textContent = textarea.value.length;
    }
}

var allFAQs = [];

function loadFAQs() {
    console.log('📚 Loading FAQs...');
    
    allFAQs = [
        {
            category: 'account',
            question: 'How do I create an account on ONE-TiP?',
            answer: 'To create an account, click "Sign Up" on the login page. You\'ll need your TiP email address (@tip.edu.ph), student number, and choose a secure password. After registration, verify your email and choose a unique username. Only TiP students can register to ensure a safe community.'
        },
        {
            category: 'posting',
            question: 'How do I create a marketplace listing?',
            answer: 'Click the "+ Create Post" button, select "Marketplace Item", fill in your item details (title, price, condition, description), upload clear photos, set your price and condition, add contact information, and submit for review. Posts are typically approved within 24 hours.'
        },
        {
            category: 'posting',
            question: 'How do I offer services on ONE-TiP?',
            answer: 'Click "+ Create Post", select "Service Offer", add your service title and starting price, set delivery timeframes, showcase your portfolio with examples of previous work, write a detailed description of what you offer, and submit for approval. Popular services include tutoring, graphic design, programming help, and academic assistance.'
        },
        {
            category: 'marketplace',
            question: 'Is it safe to buy from other students?',
            answer: 'Yes! All users are verified TiP students. For safety: meet in public campus areas (library, cafeteria, student lounge), bring a friend when meeting for high-value transactions, use cash for small amounts, trust your instincts, and report any suspicious activity using the report buttons.'
        }
    ];

    displayFAQs(allFAQs);
    updateFAQStats();
    console.log('✅ FAQs loaded successfully');
}

function displayFAQs(faqs) {
    const faqList = document.getElementById('helpFaqList');
    
    if (!faqList) {
        console.error('❌ FAQ list container not found');
        return;
    }

    if (faqs.length === 0) {
        faqList.innerHTML = '<div class="no-faqs"><div class="no-faqs-icon">🔍</div><h3>No FAQs found</h3><p>Try adjusting your search or browse different categories</p></div>';
        return;
    }
    
    var faqHTML = '';
    for (var i = 0; i < faqs.length; i++) {
        var faq = faqs[i];
        faqHTML += '<div class="faq-item" data-help-category="' + faq.category + '"><button class="faq-question" data-help-index="' + i + '">' + faq.question + '<span class="faq-arrow">▼</span></button><div class="faq-answer" data-help-index="' + i + '"><p>' + faq.answer + '</p></div></div>';
    }
    
    faqList.innerHTML = faqHTML;
    console.log('✅ FAQs displayed successfully');
}

function toggleFAQAnswer(questionElement) {
    const answerElement = questionElement.nextElementSibling;
    
    questionElement.classList.toggle('active');
    if (answerElement) {
        answerElement.classList.toggle('active');
    }
}

function searchFAQs(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (searchTerm.length === 0) {
        displayFAQs(allFAQs);
        return;
    }
    
    var filtered = [];
    for (var i = 0; i < allFAQs.length; i++) {
        var faq = allFAQs[i];
        if (faq.question.toLowerCase().indexOf(searchTerm) !== -1 || 
            faq.answer.toLowerCase().indexOf(searchTerm) !== -1) {
            filtered.push(faq);
        }
    }
    
    displayFAQs(filtered);
}

function filterFAQsByCategory(category) {
    var filtered = [];
    if (category === 'all') {
        filtered = allFAQs;
    } else {
        for (var i = 0; i < allFAQs.length; i++) {
            if (allFAQs[i].category === category) {
                filtered.push(allFAQs[i]);
            }
        }
    }
    displayFAQs(filtered);
}

function updateActiveCategoryTab(activeTab) {
    document.querySelectorAll('.category-tab').forEach(function(tab) {
        tab.classList.remove('active');
    });
    activeTab.classList.add('active');
}

function updateFAQStats() {
    const totalFaqs = document.getElementById('helpTotalFaqs');
    const helpfulVotes = document.getElementById('helpHelpfulVotes');
    
    if (totalFaqs) totalFaqs.textContent = allFAQs.length;
    if (helpfulVotes) helpfulVotes.textContent = Math.floor(Math.random() * 200) + 100;
}

function scrollToKnowledgeBase() {
    const knowledgeBase = document.getElementById('helpKnowledgeBase');
    if (knowledgeBase) {
        knowledgeBase.scrollIntoView({ behavior: 'smooth' });
    }
}

function loadUserProfile() {
    const username = sessionStorage.getItem('username') || 'user';
    const email = sessionStorage.getItem('email') || 'user@tip.edu.ph';

    const displayUsername = document.getElementById('helpDisplayUsername');
    const profileName = document.getElementById('helpProfileName');
    const profileEmail = document.getElementById('helpProfileEmail');

    if (displayUsername) displayUsername.textContent = '@' + username;
    if (profileName) profileName.textContent = capitalizeWords(username.replace(/[._]/g, ' '));
    if (profileEmail) profileEmail.textContent = email;

    console.log('👤 User profile loaded:', username);
}

function handleProfileAction(action) {
    switch (action) {
        case 'logout':
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.clear();
                localStorage.clear();
                window.location.href = 'index.html';
            }
            break;
        default:
            console.log('Profile action:', action);
    }
    
    const dropdown = document.getElementById('helpUserProfileDropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

function performSearch() {
    const searchInput = document.getElementById('helpGlobalSearch');
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    if (query.length < 2) {
        alert('Please enter at least 2 characters to search');
        return;
    }
    
    console.log('🔍 Performing search:', query);
    searchFAQs(query);
    scrollToKnowledgeBase();
}

function capitalizeWords(str) {
    return str.split(' ').map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}

console.log('✅ Help & Support JavaScript loaded successfully!');
