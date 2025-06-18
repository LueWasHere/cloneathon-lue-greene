// js/main.js

// UUID function
const uuid = () => ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

// --- Core App Logic ---
/*async function createNewThread() {
    const threadId = uuid();
    
    new_thread = {
        id: threadId // TODO: Make "title" be a summarized title from an AI model
    };

    const options = {
        // The method is 'POST' because we are sending data.
        method: 'POST',
        // The headers tell the server what kind of data we are sending.
        headers: {
            'Content-Type': 'application/json'
        },
        // The body is the actual data we send, converted to a JSON string.
        body: JSON.stringify(new_thread)
    };
    const messagesData = await fetch(API_CREATE_CHAT, json=options).then(response => {
        // 1. Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        renderThreads();
        switchToThread(threadId);
        return;
    })
    .catch(error => {
        // This will catch any errors from the fetch or parsing steps
        console.error("Could not fetch message data:", error);
        return;
    });

    return threadId;
}

function addMessage(threadId, sender, content, first_message, model = null) {
    const msg_id = uuid()
    const newMessage = { thread_id: threadId, id: msg_id, "sender": sender, "content": content, "model_used": model };

    const options = {
        // The method is 'POST' because we are sending data.
        method: 'POST',
        // The headers tell the server what kind of data we are sending.
        headers: {
            'Content-Type': 'application/json'
        },
        // The body is the actual data we send, converted to a JSON string.
        body: JSON.stringify(newMessage)
    };
    const messagesData = fetch(API_ADD_MESSAGE, json=options).then(response => {
        // 1. Check if the request was successful
        if (!response.ok) {
            if (response.status === 403) window.location.replace('/forbidden');
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        renderThreads();

        // If it's the first message, set the thread title
        if (first_message && sender === 'user') {
            //threads[threadId].title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
            renderThreads();
        }
        
        // Only render messages if we're viewing this thread
        if (currentThread === threadId) {
            renderMessages();
        }
        return;
    })
    .catch(error => {
        // This will catch any errors from the fetch or parsing steps
        console.error("Could not fetch message data:", error);
        return;
    });
}*/

async function handleSendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    //let first_message = false;
    if (!content) return;
    
    let threadId = currentThread;
    if (!threadId) {
        first_message = true;
        threadId = uuid();
        currentThread = threadId;
        switchToThread(threadId);
    } else {
        switchToThread(threadId);
        renderMessages();
    }
    
    input.value = '';
    document.getElementById('sendBtn').disabled = true;
    
    const options = {
        // The method is 'POST' because we are sending data.
        method: 'POST',
        // The headers tell the server what kind of data we are sending.
        headers: {
            'Content-Type': 'application/json'
        },
        // The body is the actual data we send, converted to a JSON string.
        body: JSON.stringify({ "content": content , "chat_id": threadId })
    };

    fetch('/api/send_to_ai', json=options)
        .then(async response => {
            if (!response.ok) {
                if (response.status === 403) window.location.replace('/forbidden');
                if (response.status === 500) window.location.replace('/general-error');
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            // Get the readable stream from the response body
            const reader = response.body.getReader();
            // Create a decoder for UTF-8 text
            const decoder = new TextDecoder();
            
            const messagesList = document.getElementById('messagesList');
            const messageElUser = document.createElement('div');
            const messageEl = document.createElement('div');
            const colors = themes[currentTheme][isDarkMode ? 'dark' : 'light'];
            messageEl.className = `mb-6 text-left`;
            messageElUser.className = `mb-6 text-right`;
            
            messageElUser.innerHTML = `
                <div class="inline-block max-w-3xl">
                    <div class="flex items-start space-x-3 flex-row-reverse space-x-reverse">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style="background-color: ${colors.primaryBtn}; color: ${!isDarkMode ? '#FFFFFF' : colors.primaryText}">
                            U
                        </div>
                        <div class="flex-1">
                            <div class="p-4 rounded-lg" style="background-color: ${colors.border}; border: 1px solid ${colors.border}">
                                <div class="whitespace-pre-wrap">${content}</div>
                            </div>
                            <div class="text-xs opacity-50 mt-1 text-right">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            if (first_message) messagesList.appendChild(messageElUser);
            messageEl.innerHTML = `
                <div class="inline-block max-w-3xl">
                    <div class="flex items-start space-x-3">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style="background-color: ${colors.border}; color: ${colors.primaryText}">
                            AI
                        </div>
                        <div class="flex-1">
                            <div class="p-4 rounded-lg" style="background-color: ${colors.surface}; border: 1px solid ${colors.border}">
                                <div class="whitespace-pre-wrap" id="free-flow-text"></div>
                            </div>
                            <div class="text-xs opacity-50 mt-1 text-left">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            messagesList.appendChild(messageEl);

            const messageTextFreeForm = document.getElementById('free-flow-text');

            // Define a function to process the stream
            async function processStream() {
                return reader.read().then(({ done, value }) => {
                    // If the stream is finished, we're done
                    if (done) return done;

                    // `value` is a Uint8Array. Decode it to a string.
                    const chunk = decoder.decode(value);
                    
                    // Append the new chunk of text to our output element
                    messageTextFreeForm.textContent += chunk;
                    console.log(chunk);

                    // Continue processing the stream
                    return processStream();
                });
            }

            // Start processing the stream
            let done = await processStream();
            if (done) console.log(done); 
            //if (currentThread === threadId) renderMessages();
        })
        .catch(error => {
            console.error('Error fetching the stream:', error);
    });

    document.getElementById('sendBtn').disabled = false;
}

// --- Account Management Functions ---
async function updateAccountStats() {
    try {
        // Fetch account stats from the server
        const response = await fetch('/api/account/stats');
        if (response.ok) {
            const stats = await response.json();
            
            // Update the DOM with server data
            document.getElementById('conversationCount').textContent = stats.conversations || 0;
            document.getElementById('messagesSent').textContent = stats.messages_sent || 0;
            document.getElementById('daysActive').textContent = stats.days_active || 0;
            document.getElementById('accountCreated').textContent = 
                stats.account_created ? new Date(stats.account_created).toLocaleDateString() : 'No data';
            document.getElementById('lastSignIn').textContent = 
                stats.last_sign_in ? formatTime(stats.last_sign_in) : 'Just now';
        } else {
            // Fallback to client-side calculation
            updateAccountStatsLocal();
        }
    } catch (error) {
        console.error('Error fetching account stats:', error);
        // Fallback to client-side calculation
        updateAccountStatsLocal();
    }
}

function updateAccountStatsLocal() {
    // Fallback: Calculate and update account statistics from local data
    const conversationCount = Object.keys(threads).length;
    const messagesSent = Object.values(threads).reduce((total, thread) => {
        return 0; // TODO: IMPLREMENT TS
        //return total + thread.messages.filter(msg => msg["sender"] === 'user').length;
    }, 0);
    
    // Calculate days active (simple approximation)
    const firstThreadDate = Object.values(threads).reduce((earliest, thread) => {
        const threadDate = new Date(thread.created_at);
        return !earliest || threadDate < earliest ? threadDate : earliest;
    }, null);
    
    const daysActive = firstThreadDate ? 
        Math.ceil((new Date() - firstThreadDate) / (1000 * 60 * 60 * 24)) : 0;
    
    // Update the DOM
    document.getElementById('conversationCount').textContent = conversationCount;
    document.getElementById('messagesSent').textContent = messagesSent;
    document.getElementById('daysActive').textContent = daysActive;
    document.getElementById('accountCreated').textContent = firstThreadDate ? 
        firstThreadDate.toLocaleDateString() : 'No data';
    document.getElementById('lastSignIn').textContent = 'Just now';
}

function handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
        // Redirect to logout route
        window.location.href = 'logout';
    }
}

async function handleDeleteAccount() {
    const confirmation = prompt('This will permanently delete your account and all your data. Type "DELETE" to confirm:');
    if (confirmation === 'DELETE') {
        if (confirm('This action cannot be undone. Are you absolutely sure?')) {
            try {
                const response = await fetch('/api/account/delete', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Account deleted successfully. Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = '/auth/login';
                    }, 2000);
                } else {
                    showNotification(result.message || 'Account deletion failed', 'error');
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                showNotification('Failed to delete account. Please try again.', 'error');
            }
        }
    }
}

async function handleExportData() {
    try {
        showNotification('Preparing your data export...', 'info');
        
        const response = await fetch('/api/account/export');
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `llmchat_data_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification('Data exported successfully!', 'success');
        } else {
            throw new Error('Failed to export data');
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        showNotification('Failed to export data. Please try again.', 'error');
    }
}

function handleEditProfile() {
    const currentName = document.getElementById('accountName').textContent;
    const newName = prompt('Enter your new name:', currentName);
    
    if (newName && newName.trim() !== currentName) {
        // In a real implementation, you'd make an API call to update the profile
        showNotification('Profile editing is not implemented in this demo', 'info');
        // updateUserProfile(newName.trim());
    }
}

function handleChangePassword() {
    showNotification('Password change functionality would redirect to a secure form', 'info');
    // In a real implementation, you'd redirect to a password change form
    // window.location.href = '/auth/change-password';
}

// --- Event Listeners (Entry Point) ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial Setup
    loadAppData();
    
    // Sidebar Listeners
    document.getElementById('collapseSidebar').addEventListener('click', () => hideSidebar());
    document.getElementById('showSidebar').addEventListener('click', () => showSidebar());
    document.getElementById('newThreadBtn').addEventListener('click', showWelcomeScreen);
    
    // Search Listener
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.trim().toLowerCase();
            if (query) {
                const filtered = threads.filter(t => t.title.toLowerCase().includes(query));
                renderThreads(filtered);
            } else {
                renderThreads();
            }
        }, 300);
    });
    
    // Chat Input Listeners
    document.getElementById('sendBtn').addEventListener('click', handleSendMessage);
    document.getElementById('messageInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
    });
    
    // Suggestion Chip Listeners
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.getElementById('messageInput').value = chip.dataset.prompt;
            handleSendMessage();
        });
    });
    
    // Model Selector Listeners
    document.getElementById('modelSelector').addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('modelDropdown');
        const rect = e.currentTarget.getBoundingClientRect();
        dropdown.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
        dropdown.style.left = rect.left + 'px';
        dropdown.classList.toggle('hidden');
        applyTheme();
    });
    
    document.getElementById('modelDropdown').addEventListener('click', (e) => {
        const modelOption = e.target.closest('[data-model]');
        if (modelOption) {
            selectedModel = modelOption.dataset.model;
            document.getElementById('selectedModel').textContent = selectedModel;
            document.getElementById('modelDropdown').classList.add('hidden');
            savePreferences({ default_model: selectedModel });
        }
    });
    
    // Settings Modal Listeners
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('hidden');
        applyTheme();
    });
    
    document.getElementById('closeModal').addEventListener('click', () => document.getElementById('settingsModal').classList.add('hidden'));
    
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') document.getElementById('settingsModal').classList.add('hidden');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('nav-active'));
            item.classList.add('nav-active');
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
            document.getElementById(item.dataset.tab + '-tab').classList.remove('hidden');
            
            // Update account stats when account tab is opened
            if (item.dataset.tab === 'account') {
                updateAccountStats();
            }
            
            setTimeout(applyTheme, 50);
        });
    });
    
    // Account Tab Event Listeners
    document.getElementById('signOutBtn')?.addEventListener('click', handleSignOut);
    document.getElementById('deleteAccountBtn')?.addEventListener('click', handleDeleteAccount);
    document.getElementById('exportDataBtn')?.addEventListener('click', handleExportData);
    document.getElementById('editProfileBtn')?.addEventListener('click', handleEditProfile);
    document.getElementById('changePasswordBtn')?.addEventListener('click', handleChangePassword);

    // Appearance Settings Listeners
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => savePreferences({ theme: option.dataset.theme }));
    });
    
    document.getElementById('lightModeBtn')?.addEventListener('click', () => savePreferences({ is_dark_mode: false }));
    document.getElementById('darkModeBtn')?.addEventListener('click', () => savePreferences({ is_dark_mode: true }));
    
    // API & Customization Listeners
    document.querySelectorAll('.api-key-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.dataset.provider;
            const input = document.getElementById(`${provider}Key`);
            if (!input.value.trim()) { showNotification('Please enter an API key', 'error'); return; }
            const currentKeys = userPreferences.api_keys || {};
            currentKeys[provider] = input.value.trim();
            savePreferences({ api_keys: currentKeys });
            input.value = '••••••••••••';
            showNotification('API key saved successfully', 'success');
        });
    });
    
    document.getElementById('saveCustomInstructions').addEventListener('click', () => {
        savePreferences({ custom_instructions: document.getElementById('customInstructions').value });
        showNotification('Custom instructions saved', 'success');
    });

    // Thread Context Menu Listeners
    document.getElementById('threadContextMenu').addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        const threadId = e.currentTarget.dataset.threadId;
        if (!action || !threadId) return;

        switch (action) {
            case 'pin':
                threads[threadId].is_pinned = !threads[threadId].is_pinned;
                saveAppData();
                renderThreads();
                break;
            case 'rename':
                const oldTitle = threads[threadId].title;
                const newTitle = prompt('Enter new thread title:', oldTitle);
                if (newTitle && newTitle.trim() !== oldTitle) {
                    threads[threadId].title = newTitle.trim();
                    saveAppData();
                    renderThreads();
                }
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this thread? This cannot be undone.')) {
                    delete threads[threadId];
                    saveAppData();
                    if (currentThread === threadId) showWelcomeScreen();
                    renderThreads();
                }
                break;
        }
        e.currentTarget.classList.add('hidden');
    });
    
    // Global Listeners for closing popups/menus
    document.addEventListener('click', () => {
        document.getElementById('threadContextMenu').classList.add('hidden');
        document.getElementById('modelDropdown').classList.add('hidden');
    });

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); document.getElementById('searchInput').focus(); }
        if (e.key === 'Escape') {
            document.getElementById('threadContextMenu').classList.add('hidden');
            document.getElementById('modelDropdown').classList.add('hidden');
            document.getElementById('settingsModal').classList.add('hidden');
        }
    });
});