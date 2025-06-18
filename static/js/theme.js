// js/theme.js

function applyTheme() {
    const app = document.getElementById('app');
    const sidebar = document.getElementById('sidebar');
    const modal = document.querySelector('#settingsModal > div');
    const dropdown = document.getElementById('modelDropdown');
    const showSidebarBtn = document.getElementById('showSidebar');
    
    const mode = isDarkMode ? 'dark' : 'light';
    const colors = themes[currentTheme][mode];
    
    // Apply theme class to body for scrollbar styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${currentTheme}`);
    if (isDarkMode) document.body.classList.add('theme-dark');
    else document.body.classList.add('theme-light');
    
    document.documentElement.style.setProperty('--main-bg', colors.mainBg);
    document.documentElement.style.setProperty('--sidebar-bg', colors.sidebarBg);
    document.documentElement.style.setProperty('--surface', colors.surface);
    document.documentElement.style.setProperty('--primary-text', colors.primaryText);
    document.documentElement.style.setProperty('--secondary-text', colors.secondaryText);
    document.documentElement.style.setProperty('--border', colors.border);
    document.documentElement.style.setProperty('--primary-btn', colors.primaryBtn);
    
    app.style.backgroundColor = colors.mainBg;
    app.style.color = colors.primaryText;
    
    sidebar.style.backgroundColor = colors.sidebarBg;
    sidebar.style.borderColor = colors.border;
    
    if (showSidebarBtn) {
        showSidebarBtn.style.backgroundColor = colors.surface;
        showSidebarBtn.style.color = colors.primaryText;
        showSidebarBtn.style.borderColor = colors.border;
    }
    
    if (modal) {
        modal.style.backgroundColor = colors.surface;
        modal.style.color = colors.primaryText;
    }
    
    if (dropdown) {
        dropdown.style.backgroundColor = colors.surface;
        dropdown.style.color = colors.primaryText;
        dropdown.style.borderColor = colors.border;
    }
    
    document.querySelectorAll('input, textarea').forEach(el => {
        el.style.backgroundColor = colors.surface;
        el.style.color = colors.primaryText;
        el.style.borderColor = colors.border;
    });
    
    document.querySelectorAll('button').forEach(el => {
        if (el.classList.contains('text-white') || el.id === 'sendBtn') {
            el.style.backgroundColor = colors.primaryBtn;
            el.style.color = isDarkMode ? colors.primaryText : '#FFFFFF';
        } else {
            el.style.backgroundColor = colors.surface;
            el.style.color = colors.primaryText;
            el.style.borderColor = colors.border;
        }
    });
    
    document.querySelectorAll('[class*="border"]').forEach(el => el.style.borderColor = colors.border);
    
    const contextMenu = document.getElementById('threadContextMenu');
    if (contextMenu) {
        contextMenu.style.backgroundColor = colors.surface;
        contextMenu.style.borderColor = colors.border;
    }
    
    updateTags();
    updateModeButtons();
    updateThemeSelection();
    applyAccountTabTheme();
    
    // Re-render messages to apply theme changes
    if (currentThread && threads[currentThread]) {
        renderMessages(); // from ui.js
    }
}

function applyAccountTabTheme() {
    const mode = isDarkMode ? 'dark' : 'light';
    const colors = themes[currentTheme][mode];
    
    // Account card styling
    const accountCard = document.querySelector('.account-info-card');
    if (accountCard) {
        accountCard.style.backgroundColor = colors.surface;
        accountCard.style.borderColor = colors.border;
        accountCard.style.color = colors.primaryText;
    }
    
    // Account stats styling
    document.querySelectorAll('.account-stat').forEach(stat => {
        stat.style.backgroundColor = colors.surface;
        stat.style.borderColor = colors.border;
        stat.style.color = colors.primaryText;
    });
    
    // Profile picture border
    const profilePic = document.getElementById('profilePicture');
    if (profilePic) {
        profilePic.style.borderColor = colors.border;
    }
    
    // Secondary buttons
    document.querySelectorAll('.btn-secondary').forEach(btn => {
        btn.style.backgroundColor = colors.surface;
        btn.style.borderColor = colors.border;
        btn.style.color = colors.primaryText;
    });
    
    // Status badges theme adjustment
    const verifiedBadge = document.querySelector('.status-verified');
    const freePlanBadge = document.querySelector('.status-free-plan');
    
    if (isDarkMode) {
        if (verifiedBadge) {
            verifiedBadge.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
            verifiedBadge.style.color = '#86EFAC';
            verifiedBadge.style.borderColor = 'rgba(34, 197, 94, 0.3)';
        }
        if (freePlanBadge) {
            freePlanBadge.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
            freePlanBadge.style.color = '#FDBA74';
            freePlanBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        }
    } else {
        if (verifiedBadge) {
            verifiedBadge.style.backgroundColor = '#F0FDF4';
            verifiedBadge.style.color = '#166534';
            verifiedBadge.style.borderColor = '#BBF7D0';
        }
        if (freePlanBadge) {
            freePlanBadge.style.backgroundColor = '#FEF3C7';
            freePlanBadge.style.color = '#D97706';
            freePlanBadge.style.borderColor = '#FCD34D';
        }
    }
}

function updateTags() {
    document.querySelectorAll('.new-tag, .byok-tag, .free-tag').forEach(tag => {
        if (isDarkMode) {
            tag.style.backgroundColor = '#333333';
            tag.style.color = '#9CA3AF';
        } else {
            tag.style.backgroundColor = '#F3F4F6';
            tag.style.color = '#4B5563';
        }
    });
}

function updateModeButtons() {
    const lightBtn = document.getElementById('lightModeBtn');
    const darkBtn = document.getElementById('darkModeBtn');
    const colors = themes[currentTheme][isDarkMode ? 'dark' : 'light'];
    
    if (lightBtn && darkBtn) {
        if (isDarkMode) {
            lightBtn.style.backgroundColor = colors.surface; lightBtn.style.borderColor = colors.border; lightBtn.style.color = colors.primaryText;
            darkBtn.style.backgroundColor = colors.primaryBtn; darkBtn.style.color = isDarkMode ? colors.primaryText : '#FFFFFF';
        } else {
            lightBtn.style.backgroundColor = colors.primaryBtn; lightBtn.style.color = '#FFFFFF';
            darkBtn.style.backgroundColor = colors.surface; darkBtn.style.borderColor = colors.border; darkBtn.style.color = colors.primaryText;
        }
    }
}

function updateThemeSelection() {
    document.querySelectorAll('.theme-option').forEach(option => {
        const colors = themes[currentTheme][isDarkMode ? 'dark' : 'light'];
        if (option.dataset.theme === currentTheme) {
            option.style.borderColor = colors.primaryBtn;
            option.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        } else {
            option.style.borderColor = colors.border;
            option.style.backgroundColor = colors.surface;
        }
    });
}