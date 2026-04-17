/*
Chat System for ONE-TiP - Messenger-like Interface
Standalone implementation that works alongside existing code
*/

(function() {
    'use strict';
    
    let currentChatRecipient = null;
    let chatMessages = [];
    let isTyping = false;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeChatSystem);
    } else {
        initializeChatSystem();
    }

    function initializeChatSystem() {
        console.log('Initializing chat system...');
        
        // Inject chat modal HTML if it doesn't exist
        if (!document.getElementById('chatModal')) {
            injectChatModal();
        }
        
        setupChatEventListeners();
        console.log('Chat system initialized successfully');
    }

    function injectChatModal() {
        const modalHTML = `
            <div id="chatModal" class="modal" style="display: none; z-index: 3000;">
                <div class="modal-content" style="max-width: 900px; width: 90%; height: 85vh; max-height: 700px; margin: 2% auto; background: #fff; border-radius: 15px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);">
                    <div style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <img src="Images/profile-icon.png" alt="User" id="chatRecipientAvatar" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid white; object-fit: cover;">
                            <div style="display: flex; flex-direction: column;">
                                <div id="chatRecipientName" style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.25rem;">User Name</div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; opacity: 0.9;">
                                    <span style="width: 8px; height: 8px; border-radius: 50%; background: #4caf50; box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);"></span>
                                    <span>Active now</span>
                                </div>
                            </div>
                        </div>
                        <button id="closeChatModal" style="background: rgba(255, 255, 255, 0.2); border: none; color: white; font-size: 1.5rem; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; transition: background 0.3s;">&times;</button>
                    </div>

                    <div id="chatMessagesContainer" style="flex: 1; overflow-y: auto; padding: 1.5rem; background: #f8f9fa; display: flex; flex-direction: column;">
                        <div style="text-align: center; margin: 1rem 0;">
                            <span style="background: rgba(0, 0, 0, 0.05); padding: 0.25rem 1rem; border-radius: 20px; font-size: 0.75rem; color: #666; font-weight: 500;">Today</span>
                        </div>
                        
                        <div style="text-align: center; padding: 2rem 1rem; margin-bottom: 2rem;">
                            <div style="margin-bottom: 1rem;">
                                <img src="Images/profile-icon.png" alt="User" id="chatWelcomeAvatar" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #007bff;">
                            </div>
                            <h3 id="chatWelcomeName" style="font-size: 1.3rem; margin-bottom: 0.5rem; color: #333;">Start chatting with User</h3>
                            <p id="chatWelcomeContext" style="color: #666; margin-bottom: 0.5rem;">About: Product Name</p>
                            <p style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 0.75rem 1rem; margin-top: 1rem; font-size: 0.85rem; color: #856404; display: inline-block;">
                                💡 <strong>Safety Tip:</strong> Meet in public campus areas and trust your instincts.
                            </p>
                        </div>

                        <div id="chatMessages" style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <!-- Chat messages will appear here -->
                        </div>
                    </div>

                    <div style="background: white; border-top: 1px solid #e9ecef; padding: 1rem 1.5rem;">
                        <div style="display: flex; align-items: flex-end; gap: 0.75rem; background: #f8f9fa; border-radius: 25px; padding: 0.5rem 1rem;">
                            <button id="chatEmojiBtn" title="Add emoji" style="background: transparent; border: none; cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: background 0.3s; font-size: 1.3rem; line-height: 1;">😊</button>
                            
                            <textarea id="chatInput" placeholder="Type a message..." rows="1" maxlength="1000" style="flex: 1; border: none; background: transparent; resize: none; outline: none; font-family: inherit; font-size: 0.95rem; padding: 0.5rem 0; max-height: 120px; overflow-y: auto;"></textarea>
                            
                            <button id="chatSendBtn" title="Send message" style="background: linear-gradient(135deg, #007bff, #0056b3); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; flex-shrink: 0;">
                                <img src="Images/send-icon.svg" alt="Send" style="width: 20px; height: 20px; filter: brightness(0) invert(1);">
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    function setupChatEventListeners() {
        const closeChatBtn = document.getElementById('closeChatModal');
        if (closeChatBtn) {
            closeChatBtn.addEventListener('click', closeChatModal);
        }

        const sendBtn = document.getElementById('chatSendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }

        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            chatInput.addEventListener('input', function() {
                autoResizeTextarea(this);
            });
        }

        const emojiBtn = document.getElementById('chatEmojiBtn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', function() {
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.value += '😊';
                    chatInput.focus();
                }
            });
        }

        const chatModal = document.getElementById('chatModal');
        if (chatModal) {
            chatModal.addEventListener('click', function(e) {
                if (e.target === chatModal) {
                    closeChatModal();
                }
            });
        }

        console.log('Chat event listeners setup complete');
    }

    function openChat(recipientData) {
        console.log('Opening chat with:', recipientData);

        currentChatRecipient = recipientData;

        const chatRecipientName = document.getElementById('chatRecipientName');
        const chatRecipientAvatar = document.getElementById('chatRecipientAvatar');
        const chatWelcomeName = document.getElementById('chatWelcomeName');
        const chatWelcomeAvatar = document.getElementById('chatWelcomeAvatar');
        const chatWelcomeContext = document.getElementById('chatWelcomeContext');

        if (chatRecipientName) chatRecipientName.textContent = recipientData.name;
        if (chatRecipientAvatar) chatRecipientAvatar.src = recipientData.avatar || 'Images/profile-icon.png';
        if (chatWelcomeName) chatWelcomeName.textContent = `Start chatting with ${recipientData.name}`;
        if (chatWelcomeAvatar) chatWelcomeAvatar.src = recipientData.avatar || 'Images/profile-icon.png';
        if (chatWelcomeContext) chatWelcomeContext.textContent = `About: ${recipientData.context || 'General chat'}`;

        const chatModal = document.getElementById('chatModal');
        if (chatModal) {
            chatModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        loadDemoMessages();

        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) chatInput.focus();
        }, 300);
    }

    function loadDemoMessages() {
        chatMessages = [
            {
                id: 1,
                sender_id: currentChatRecipient?.userId || 'other',
                sender_name: currentChatRecipient?.name || 'User',
                message: "Hi! I'm interested in this item/service.",
                created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                is_read: true
            },
            {
                id: 2,
                sender_id: getCurrentUserId(),
                sender_name: 'You',
                message: "Great! Let me know if you have any questions.",
                created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
                is_read: true
            }
        ];

        displayMessages();
    }

    function displayMessages() {
        const chatMessagesContainer = document.getElementById('chatMessages');
        if (!chatMessagesContainer) return;

        chatMessagesContainer.innerHTML = chatMessages.map(msg => {
            const isSent = msg.sender_id === getCurrentUserId();
            const alignSelf = isSent ? 'flex-end' : 'flex-start';
            const flexDirection = isSent ? 'row-reverse' : 'row';
            const bgColor = isSent ? 'linear-gradient(135deg, #007bff, #0056b3)' : '#e9ecef';
            const textColor = isSent ? 'white' : '#333';
            const borderRadius = isSent ? '18px 18px 4px 18px' : '18px 18px 18px 4px';
            const textAlign = isSent ? 'right' : 'left';

            return `
                <div style="display: flex; align-items: flex-end; gap: 0.5rem; max-width: 70%; align-self: ${alignSelf}; flex-direction: ${flexDirection};">
                    <img src="Images/profile-icon.png" alt="${msg.sender_name}" style="width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;">
                    <div style="display: flex; flex-direction: column;">
                        <div style="padding: 0.75rem 1rem; border-radius: ${borderRadius}; word-wrap: break-word; background: ${bgColor}; color: ${textColor};">
                            <p style="margin: 0; line-height: 1.5;">${escapeHtml(msg.message)}</p>
                        </div>
                        <div style="font-size: 0.7rem; color: #999; margin-top: 0.25rem; padding: 0 0.5rem; text-align: ${textAlign};">
                            ${formatMessageTime(msg.created_at)}
                            ${isSent && msg.is_read ? '<span style="color: #4caf50; margin-left: 0.25rem;">✓✓</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        scrollToBottom();
    }

    function sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput ? chatInput.value.trim() : '';

        if (!message) {
            return;
        }

        if (!currentChatRecipient) {
            alert('No recipient selected');
            return;
        }

        const newMessage = {
            id: Date.now(),
            sender_id: getCurrentUserId(),
            sender_name: 'You',
            message: message,
            created_at: new Date().toISOString(),
            is_read: false
        };

        chatMessages.push(newMessage);
        displayMessages();

        if (chatInput) {
            chatInput.value = '';
            autoResizeTextarea(chatInput);
        }
    }

    function closeChatModal() {
        const chatModal = document.getElementById('chatModal');
        if (chatModal) {
            chatModal.style.display = 'none';
            document.body.style.overflow = '';
        }

        currentChatRecipient = null;
        chatMessages = [];

        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = '';
            autoResizeTextarea(chatInput);
        }
    }

    function autoResizeTextarea(textarea) {
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    function scrollToBottom() {
        const container = document.getElementById('chatMessagesContainer');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    }

    function formatMessageTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function getCurrentUserId() {
        return sessionStorage.getItem('user_id') || 'demo_user_1';
    }

    // Export to global scope
    window.openChat = openChat;

    console.log('✅ Chat system loaded successfully');
})();
