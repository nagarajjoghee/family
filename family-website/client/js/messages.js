let currentTab = 'inbox';
let currentMessageId = null;

async function loadMessagesPage() {
    await loadMessages(currentTab);
}

async function loadMessages(tab) {
    currentTab = tab;
    
    try {
        const messages = tab === 'inbox' ? await API.getInbox() : await API.getSent();
        const container = document.getElementById('messagesContainer');
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div class="messages-sidebar">
                    <div class="messages-tabs">
                        <button class="messages-tab ${tab === 'inbox' ? 'active' : ''}" onclick="switchMessagesTab('inbox')">Inbox</button>
                        <button class="messages-tab ${tab === 'sent' ? 'active' : ''}" onclick="switchMessagesTab('sent')">Sent</button>
                    </div>
                    <div class="empty-state">
                        <h3>No messages</h3>
                        <p>${tab === 'inbox' ? 'Your inbox is empty' : 'You haven\'t sent any messages'}</p>
                    </div>
                </div>
                <div class="messages-content">
                    <div class="empty-state">
                        <p>Select a message to view</p>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="messages-sidebar">
                <div class="messages-tabs">
                    <button class="messages-tab ${tab === 'inbox' ? 'active' : ''}" onclick="switchMessagesTab('inbox')">Inbox</button>
                    <button class="messages-tab ${tab === 'sent' ? 'active' : ''}" onclick="switchMessagesTab('sent')">Sent</button>
                </div>
                <div class="message-list">
                    ${messages.map(msg => `
                        <div class="message-item ${!msg.read_status && tab === 'inbox' ? 'unread' : ''}" onclick="viewMessage(${msg.id})">
                            <div class="message-item-header">
                                <strong>${tab === 'inbox' ? (msg.sender_name || msg.username) : (msg.recipient_name || msg.username)}</strong>
                                <span class="message-date">${new Date(msg.created_at).toLocaleDateString()}</span>
                            </div>
                            ${msg.subject ? `<div class="message-item-subject">${msg.subject}</div>` : ''}
                            <div class="message-item-preview">${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="messages-content">
                <div class="empty-state">
                    <p>Select a message to view</p>
                </div>
            </div>
        `;
        
        // Update unread count in navigation if available
        try {
            const unreadCount = await API.getUnreadCount();
            updateUnreadBadge(unreadCount.count);
        } catch (error) {
            // Ignore error
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        showNotification('Failed to load messages', 'error');
    }
}

function switchMessagesTab(tab) {
    loadMessages(tab);
}

async function viewMessage(messageId) {
    currentMessageId = messageId;
    
    try {
        const message = await API.getMessage(messageId);
        const currentUser = getCurrentUser();
        const isRecipient = currentUser && currentUser.id === message.recipient_id;
        
        const contentArea = document.querySelector('.messages-content');
        contentArea.innerHTML = `
            <div class="message-detail">
                <div class="message-detail-header">
                    <h2>${message.subject || 'No Subject'}</h2>
                    <div class="message-detail-meta">
                        <span><strong>From:</strong> ${message.sender_name || message.sender_username}</span>
                        <span><strong>To:</strong> ${message.recipient_name || message.recipient_username}</span>
                        <span><strong>Date:</strong> ${new Date(message.created_at).toLocaleString()}</span>
                    </div>
                </div>
                <div class="message-detail-content">${message.content}</div>
                <div class="message-actions">
                    ${isRecipient ? `
                        <button class="btn btn-primary" onclick="replyToMessage(${message.sender_id}, '${message.subject || ''}')">Reply</button>
                    ` : ''}
                    <button class="btn btn-danger" onclick="deleteMessage(${messageId})">Delete</button>
                </div>
            </div>
        `;
        
        // Reload messages to update read status
        if (isRecipient) {
            await loadMessages(currentTab);
            // Re-select the message
            setTimeout(() => {
                const messageItem = document.querySelector(`[onclick="viewMessage(${messageId})"]`);
                if (messageItem) {
                    messageItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    } catch (error) {
        console.error('Error loading message:', error);
        showNotification('Failed to load message', 'error');
    }
}

function showComposeModal() {
    // First, get list of users for recipient selection
    API.getProfiles().then(profiles => {
        const currentUser = getCurrentUser();
        const otherUsers = profiles.filter(p => p.id !== currentUser.id);
        
        showModal(`
            <h2>Compose Message</h2>
            <form id="composeMessageForm" onsubmit="sendMessage(event)">
                <div class="form-group">
                    <label>To</label>
                    <select name="recipientId" required>
                        <option value="">Select recipient...</option>
                        ${otherUsers.map(user => `
                            <option value="${user.id}">${user.full_name || user.username}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <input type="text" name="subject">
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea name="content" rows="10" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Send</button>
            </form>
        `);
    }).catch(error => {
        showNotification('Failed to load recipients', 'error');
    });
}

async function sendMessage(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        await API.sendMessage({
            recipientId: parseInt(formData.get('recipientId')),
            subject: formData.get('subject') || null,
            content: formData.get('content')
        });
        closeModal();
        loadMessagesPage();
        showNotification('Message sent!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to send message', 'error');
    }
}

function replyToMessage(recipientId, subject) {
    API.getProfile(recipientId).then(profile => {
        showModal(`
            <h2>Reply</h2>
            <form id="replyMessageForm" onsubmit="sendMessage(event)">
                <div class="form-group">
                    <label>To</label>
                    <input type="text" value="${profile.full_name || profile.username}" disabled>
                    <input type="hidden" name="recipientId" value="${recipientId}">
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <input type="text" name="subject" value="Re: ${subject}">
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea name="content" rows="10" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Send</button>
            </form>
        `);
    });
}

async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }
    
    try {
        await API.deleteMessage(messageId);
        loadMessagesPage();
        showNotification('Message deleted', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to delete message', 'error');
    }
}

function updateUnreadBadge(count) {
    // This could update a badge in the navigation
    // For now, we'll just log it
    if (count > 0) {
        console.log(`You have ${count} unread message(s)`);
    }
}

// Make functions globally available
window.switchMessagesTab = switchMessagesTab;
window.viewMessage = viewMessage;
window.sendMessage = sendMessage;
window.replyToMessage = replyToMessage;
window.deleteMessage = deleteMessage;

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const composeBtn = document.getElementById('composeMessageBtn');
    if (composeBtn) {
        composeBtn.addEventListener('click', showComposeModal);
    }
});

