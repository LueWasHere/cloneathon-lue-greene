// js/ui.js

// --- Utility Functions for UI ---
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500';
    notification.className += ` ${bgColor} text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    // 'userName' is a global variable defined in index.html
    document.getElementById('welcomeGreeting').textContent = greeting + ', ' + userName;
}

// --- UI Rendering Functions ---
function groupThreadsForDisplay(threadsArraySorted) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const week_ago = new Date(today); week_ago.setDate(week_ago.getDate() - 7);

    const grouped = { pinned: [], today: [], yesterday: [], last_7_days: [], older: [] };

    threadsArraySorted.forEach(thread => {
        const updatedAt = new Date(thread["created_at"]);
        const threadDate = new Date(updatedAt.getFullYear(), updatedAt.getMonth(), updatedAt.getDate());

        if (thread["is_pinned"]) grouped.pinned.push(thread);
        else if (threadDate.getTime() === today.getTime()) grouped.today.push(thread);
        else if (threadDate.getTime() === yesterday.getTime()) grouped.yesterday.push(thread);
        else if (updatedAt > week_ago) grouped.last_7_days.push(thread);
        else grouped.older.push(thread);
    });
    return grouped;
}

function renderThreads(filteredThreads = null) {
    const container = document.getElementById('threadsContainer');
    container.innerHTML = '';
    
    const threadsToRender = filteredThreads ? { "search_results": filteredThreads } : groupThreadsForDisplay(threads);

    const sections = filteredThreads 
        ? [{ key: 'search_results', title: 'Search Results' }] 
        : [
            { key: 'pinned', title: 'Pinned', icon: 'fas fa-thumbtack' },
            { key: 'today', title: 'Today', icon: null },
            { key: 'yesterday', title: 'Yesterday', icon: null },
            { key: 'last_7_days', title: 'Last 7 Days', icon: null },
            { key: 'older', title: 'Older', icon: null }
        ];
    
    let hasContent = false;
    sections.forEach(section => {
        const sectionThreads = threadsToRender[section.key];
        if (!sectionThreads || sectionThreads.length === 0) return;

        hasContent = true;
        const sectionEl = document.createElement('div');
        sectionEl.className = 'mb-6 sidebar-text';
        sectionEl.innerHTML = `
            <div class="flex items-center mb-2">
                ${section.icon ? `<i class="${section.icon} mr-2"></i>` : ''}
                <h3 class="font-medium opacity-70">${section.title}</h3>
            </div>
            <div class="space-y-1">
                ${sectionThreads.map(thread => `
                    <div class="thread-item p-2 hover:bg-opacity-50 rounded cursor-pointer text-sm transition-all duration-200 group relative ${currentThread === thread['id'] ? 'bg-opacity-30' : ''}" 
                         data-thread-id="${thread['chat_id']}" data-is-pinned="${thread['is_pinned']}">
                        <div class="flex items-center justify-between">
                            <span class="truncate flex-1">${thread['title']}</span>
                            <div class="flex items-center space-x-1">
                                ${thread['is_pinned'] ? '<i class="fas fa-thumbtack text-xs opacity-50"></i>' : ''}
                                <button class="thread-menu-btn opacity-0 group-hover:opacity-100 p-1 hover:bg-opacity-50 rounded transition-all duration-200" data-thread-id="${thread['id']}">
                                    <i class="fas fa-ellipsis-h text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <div class="text-xs opacity-50 mt-1">${formatTime(thread['created_at'])}</div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(sectionEl);
    });
    
    if (!hasContent) {
         container.innerHTML = `<p class="text-sm opacity-70 text-center">No threads found.</p>`;
    }

    // Attach event listeners after rendering
    container.querySelectorAll('.thread-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.thread-menu-btn')) switchToThread(item.dataset.threadId);
        });
    });
    container.querySelectorAll('.thread-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showThreadContextMenu(e, btn.dataset.threadId);
        });
    });
}

async function renderMessages() {
    if (!currentThread) return;
    const options = {
        // The method is 'POST' because we are sending data.
        method: 'POST',
        // The headers tell the server what kind of data we are sending.
        headers: {
            'Content-Type': 'application/json'
        },
        // The body is the actual data we send, converted to a JSON string.
        body: JSON.stringify(currentThread)
    };
    const messagesData = fetch(API_FETCH_MESSAGES, json=options).then(response => {
        // 1. Check if the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // 2. Parse the JSON, which returns another promise
        return response.json(); 
    })
    .then(parsedData => {
        // 3. This block receives the result of response.json()
        // Access the "data" property
        messages = parsedData.data || [];
        if (!messagesData) return;

        const messagesList = document.getElementById('messagesList');
        const chatContainer = document.getElementById('chatContainer');
        
        const wasScrolledToBottom = chatContainer.scrollTop >= (chatContainer.scrollHeight - chatContainer.clientHeight - 50);
        
        messagesList.innerHTML = '';
        
        messages.forEach(message => {
            const messageEl = document.createElement('div');
            messageEl.className = `mb-6 ${message["sender"] === 'user' ? 'text-right' : 'text-left'}`;
            const isUser = message["sender"] === 'user';
            const colors = themes[currentTheme][isDarkMode ? 'dark' : 'light'];
            const model_used = message["llm_name"];
            
            messageEl.innerHTML = `
                <div class="inline-block max-w-3xl">
                    <div class="flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style="background-color: ${isUser ? colors.primaryBtn : colors.border}; color: ${isUser && !isDarkMode ? '#FFFFFF' : colors.primaryText}">
                            ${isUser ? 'U' : 'AI'}
                        </div>
                        <div class="flex-1">
                            <div class="p-4 rounded-lg" style="background-color: ${isUser ? colors.border : colors.surface}; border: 1px solid ${colors.border}">
                                <div class="whitespace-pre-wrap">${message["content"]}</div>
                                ${model_used ? `<div class="text-xs opacity-50 mt-2">${model_used}</div>` : ''}
                            </div>
                            <div class="text-xs opacity-50 mt-1 ${isUser ? 'text-right' : 'text-left'}">
                                ${formatTime(message["created_at"])}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            messagesList.appendChild(messageEl);
        });
        
        if (wasScrolledToBottom || messages.length <= 2) {
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 10);
        }
    })
    .catch(error => {
        // This will catch any errors from the fetch or parsing steps
        console.error("Could not fetch message data:", error);
        return null;
    });
}

function switchToThread(threadId) {
    currentThread = threadId;
    
    document.querySelectorAll('.thread-item').forEach(item => item.classList.remove('bg-opacity-30'));
    const activeThreadEl = document.querySelector(`[data-thread-id="${threadId}"]`);
    if (activeThreadEl) activeThreadEl.classList.add('bg-opacity-30');
    
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('messagesContainer').classList.remove('hidden');
    
    document.getElementById('chatContainer').style.overflowY = 'auto';
    renderMessages();
}

function showWelcomeScreen() {
    currentThread = null;
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.getElementById('messagesContainer').classList.add('hidden');
    document.querySelectorAll('.thread-item').forEach(item => item.classList.remove('bg-opacity-30'));
    
    document.getElementById('chatContainer').style.overflowY = 'hidden';
}

function hideSidebar(save = true) {
    isSidebarCollapsed = true;
    const sidebar = document.getElementById('sidebar');
    const showSidebarBtn = document.getElementById('showSidebar');
    
    sidebar.style.width = '0px';
    sidebar.style.minWidth = '0px';
    sidebar.style.overflow = 'hidden';
    showSidebarBtn.classList.remove('hidden');
    
    if (save) savePreferences({ sidebar_collapsed: isSidebarCollapsed });
}

function showSidebar(save = true) {
    isSidebarCollapsed = false;
    const sidebar = document.getElementById('sidebar');
    const showSidebarBtn = document.getElementById('showSidebar');
    
    sidebar.style.width = '320px';
    sidebar.style.minWidth = '320px';
    sidebar.style.overflow = 'visible';
    showSidebarBtn.classList.add('hidden');
    
    if (save) savePreferences({ sidebar_collapsed: isSidebarCollapsed });
}

function showThreadContextMenu(event, threadId) {
    const contextMenu = document.getElementById('threadContextMenu');
    const thread = threads[threadId];
    if (!thread) return;
    
    document.getElementById('pinText').textContent = thread.is_pinned ? 'Unpin Thread' : 'Pin Thread';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';
    contextMenu.classList.remove('hidden');
    contextMenu.dataset.threadId = threadId;

    const colors = themes[currentTheme][isDarkMode ? 'dark' : 'light'];
    contextMenu.style.backgroundColor = colors.surface;
    contextMenu.style.borderColor = colors.border;
    contextMenu.style.color = colors.primaryText;
}