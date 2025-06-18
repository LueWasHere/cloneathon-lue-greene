// js/state.js

// --- Application State ---
let currentThread = null;
let threads = [];
let userPreferences = {};

// --- Derived state (from userPreferences) ---
let currentTheme = 'default';
let isDarkMode = false;
let isSidebarCollapsed = false;
let selectedModel = 'Gemini Flash 2.0';

// --- Data Persistence (localStorage) ---
function saveAppData() {
    const appData = {
        preferences: userPreferences
    };
    localStorage.setItem('llmChatData', JSON.stringify(appData));
}

function loadAppData() {
    const appData = localStorage.getItem('llmChatData');
    if (appData) {
        const parsedData = JSON.parse(appData);
        const parsedChatData = fetch(API_FETCH_CHATS).then(response => {
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
            const chats = parsedData.data;

            threads = chats || [];
            const parsedCookieData = JSON.parse(appData);
            userPreferences = parsedCookieData.preferences;
            console.log(userPreferences)
        
            applyUserPreferences();
            updateGreeting();
            renderThreads();
            updateAccountStats();
        })
        .catch(error => {
            // This will catch any errors from the fetch or parsing steps
            console.error("Could not fetch chat data:", error);
        });
    } else {
        // First-time user, create demo data
        const initialData = createInitialData();
        userPreferences = initialData.preferences;
        
        updateGreeting();
        renderThreads();
        applyUserPreferences();
        
        savePreferences();
    }

    applyUserPreferences();
    document.getElementById('threadsLoading').classList.add('hidden');
    document.getElementById('threadsContainer').classList.remove('hidden');
}

function applyUserPreferences() {
    currentTheme = userPreferences.theme || 'default';
    isDarkMode = userPreferences.is_dark_mode || false;
    isSidebarCollapsed = userPreferences.sidebar_collapsed || false;
    selectedModel = userPreferences.default_model || 'Gemini Flash 2.0';
    
    document.getElementById('selectedModel').textContent = selectedModel;
    document.getElementById('customInstructions').value = userPreferences.custom_instructions || '';
    
    if (userPreferences.api_keys) {
        document.getElementById('openaiKey').value = userPreferences.api_keys.openai ? '••••••••••••' : '';
        document.getElementById('anthropicKey').value = userPreferences.api_keys.anthropic ? '••••••••••••' : '';
        document.getElementById('geminiKey').value = userPreferences.api_keys.gemini ? '••••••••••••' : '';
    }
    
    if (isSidebarCollapsed) hideSidebar(false); // from ui.js
    applyTheme(); // from theme.js
}

function savePreferences(updates) {
    Object.assign(userPreferences, updates);
    applyUserPreferences();
    saveAppData();
}

function createInitialData() {
    return {
        preferences: {
            theme: 'default', is_dark_mode: false, sidebar_collapsed: false,
            default_model: 'Gemini Flash 2.0', custom_instructions: '',
            api_keys: { openai: '', anthropic: '', gemini: '' }
        }
    };
}