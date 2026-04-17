/*
AI-Powered Recommendation System for ONE-TiP Marketplace
Simulates intelligent product/service recommendations based on user behavior
*/

class AIRecommendationEngine {
    constructor() {
        this.viewedItems = [];
        this.searchQueries = [];
        this.lastCategory = null;
        this.interactionCount = 0;
        this.recommendationThreshold = 2;
        this.isDebugMode = false;
        
        console.log('✨ AI Recommendation Engine initialized');
    }

    // Track when user views a product/service
    trackItemView(item) {
        if (!item || !item.id) return;
        
        // Avoid duplicates
        if (!this.viewedItems.find(i => i.id === item.id && i.type === item.type)) {
            this.viewedItems.push({
                id: item.id,
                title: item.title,
                category: item.category,
                type: item.type || 'marketplace',
                timestamp: Date.now()
            });
            
            this.lastCategory = item.category;
            this.interactionCount++;
            
            console.log(`📊 Tracked view: ${item.title} (${item.category}) - Total interactions: ${this.interactionCount}`);
            this.updateDebugPanel();
        }
    }

    // Track search queries
    trackSearch(query) {
        if (!query || query.length < 3) return;
        
        this.searchQueries.push({
            query: query.toLowerCase(),
            timestamp: Date.now()
        });
        
        this.interactionCount++;
        console.log(`🔍 Tracked search: "${query}" - Total interactions: ${this.interactionCount}`);
        this.updateDebugPanel();
    }

    // Check if we should show recommendations
    shouldShowRecommendations() {
        return this.interactionCount >= this.recommendationThreshold;
    }

    // Generate recommendations based on viewing history
    async generateRecommendations(allItems, currentItemId = null) {
        return new Promise((resolve) => {
            // Simulate AI processing delay
            setTimeout(() => {
                if (!this.shouldShowRecommendations()) {
                    resolve([]);
                    return;
                }

                const viewedIds = this.viewedItems.map(item => item.id);
                
                // Filter items based on last viewed category
                let recommendations = allItems.filter(item => {
                    // Exclude current item
                    if (currentItemId && item.id === currentItemId) return false;
                    
                    // Exclude already viewed items
                    if (viewedIds.includes(item.id)) return false;
                    
                    // Match category
                    return item.category === this.lastCategory;
                });

                // If not enough recommendations, include similar categories
                if (recommendations.length < 6) {
                    const similarItems = allItems.filter(item => 
                        item.id !== currentItemId && 
                        !viewedIds.includes(item.id) &&
                        item.category !== this.lastCategory
                    );
                    recommendations = [...recommendations, ...similarItems];
                }

                // Shuffle and limit to 6 items
                recommendations = this.shuffleArray(recommendations).slice(0, 6);
                
                console.log(`💡 Generated ${recommendations.length} recommendations for category: ${this.lastCategory}`);
                resolve(recommendations);
            }, 500);
        });
    }

    // Get the reason text for recommendations
    getRecommendationReason() {
        if (!this.lastCategory) return 'Recommended for You';
        
        const categoryNames = {
            'electronics': 'Electronics',
            'books': 'Books & Supplies',
            'calculators': 'Calculators',
            'art': 'Art Supplies',
            'musical': 'Musical Instruments',
            'sports': 'Sports Equipment',
            'food': 'Food & Snacks',
            'bags': 'Bags & Accessories',
            'tutoring': 'Tutoring Services',
            'design': 'Design Services',
            'programming': 'Programming Services',
            'photography': 'Photography Services',
            'music': 'Music Services',
            'business': 'Business Services'
        };
        
        const categoryName = categoryNames[this.lastCategory] || this.lastCategory;
        return `Because you viewed ${categoryName}`;
    }

    // Shuffle array for randomness
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Get statistics for debug panel
    getStats() {
        return {
            viewedItems: this.viewedItems.length,
            searches: this.searchQueries.length,
            totalInteractions: this.interactionCount,
            lastCategory: this.lastCategory,
            shouldShow: this.shouldShowRecommendations()
        };
    }

    // Update debug panel (if enabled)
    updateDebugPanel() {
        if (!this.isDebugMode) return;
        
        const debugPanel = document.getElementById('aiDebugPanel');
        if (!debugPanel) return;
        
        const stats = this.getStats();
        debugPanel.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.9); color: white; padding: 15px; border-radius: 10px; font-family: monospace; font-size: 12px; z-index: 9999; max-width: 300px;">
                <div style="font-weight: bold; margin-bottom: 10px; color: #ffc107;">🤖 AI Debug Panel</div>
                <div>Views: ${stats.viewedItems}</div>
                <div>Searches: ${stats.searches}</div>
                <div>Total: ${stats.totalInteractions}</div>
                <div>Category: ${stats.lastCategory || 'None'}</div>
                <div style="margin-top: 10px; color: ${stats.shouldShow ? '#4caf50' : '#ff5252'};">
                    Status: ${stats.shouldShow ? '✅ Showing' : '⏳ Waiting'}
                </div>
            </div>
        `;
    }

    // Enable debug mode
    enableDebug() {
        this.isDebugMode = true;
        if (!document.getElementById('aiDebugPanel')) {
            const panel = document.createElement('div');
            panel.id = 'aiDebugPanel';
            document.body.appendChild(panel);
        }
        this.updateDebugPanel();
    }

    // Clear all data (for session end)
    clearData() {
        this.viewedItems = [];
        this.searchQueries = [];
        this.lastCategory = null;
        this.interactionCount = 0;
        console.log('🗑️ Recommendation data cleared');
    }
}

// Create global instance
window.aiRecommendations = new AIRecommendationEngine();

console.log('✅ AI Recommendation Engine loaded');
