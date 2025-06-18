// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.isDarkMode = false;
        this.themes = ['default', 'blue', 'green', 'purple', 'warm'];
        this.themeIndex = 0;
        
        this.init();
    }
    
    init() {
        this.updateTheme();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            themeToggle.addEventListener('dblclick', () => this.resetToLight());
        }
    }
    
    toggleTheme() {
        // First click toggles dark mode, subsequent clicks cycle themes in dark mode
        if (!this.isDarkMode) {
            this.isDarkMode = true;
        } else {
            this.themeIndex = (this.themeIndex + 1) % this.themes.length;
            this.currentTheme = this.themes[this.themeIndex];
        }
        this.updateTheme();
    }
    
    resetToLight() {
        this.isDarkMode = false;
        this.currentTheme = 'default';
        this.themeIndex = 0;
        this.updateTheme();
    }
    
    updateTheme() {
        const body = document.body;
        const icon = document.getElementById('theme-icon');
        
        if (!body || !icon) return;
        
        body.setAttribute('data-theme', this.currentTheme);
        body.setAttribute('data-mode', this.isDarkMode ? 'dark' : 'light');
        
        // Update icon based on current theme and mode
        if (this.isDarkMode) {
            const iconMap = {
                'default': 'fas fa-moon',
                'blue': 'fas fa-water',
                'green': 'fas fa-leaf',
                'purple': 'fas fa-magic',
                'warm': 'fas fa-fire'
            };
            icon.className = iconMap[this.currentTheme] || 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
            // Reset to first theme when going back to light mode
            if (this.currentTheme !== 'default') {
                this.currentTheme = 'default';
                this.themeIndex = 0;
                body.setAttribute('data-theme', this.currentTheme);
            }
        }
    }
}

// Form Management
class FormManager {
    constructor() {
        this.signinForm = document.getElementById('signin-form');
        this.signupForm = document.getElementById('signup-form');
        this.signupFormElement = document.getElementById('signup-form-element');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupPasswordValidation();
    }
    
    setupEventListeners() {
        // Form switching buttons
        const showSignUpBtns = document.querySelectorAll('[onclick="showSignUp()"]');
        const showSignInBtns = document.querySelectorAll('[onclick="showSignIn()"]');
        
        showSignUpBtns.forEach(btn => {
            btn.onclick = () => this.showSignUp();
        });
        
        showSignInBtns.forEach(btn => {
            btn.onclick = () => this.showSignIn();
        });
        
        // Password toggle buttons
        const passwordToggles = document.querySelectorAll('[onclick^="togglePassword"]');
        passwordToggles.forEach(btn => {
            const inputId = btn.getAttribute('onclick').match(/togglePassword\('(.+?)'\)/)[1];
            btn.onclick = () => this.togglePassword(inputId);
        });
        
        // Form validation
        if (this.signupFormElement) {
            this.signupFormElement.addEventListener('submit', (e) => this.validateSignupForm(e));
        }
    }
    
    setupPasswordValidation() {
        const signupPassword = document.getElementById('signup-password');
        const signupPassword2 = document.getElementById('signup-password2');
        
        if (signupPassword) {
            signupPassword.addEventListener('input', () => {
                this.checkPasswordStrength(signupPassword.value);
                this.checkPasswordMatch();
            });
        }
        
        if (signupPassword2) {
            signupPassword2.addEventListener('input', () => this.checkPasswordMatch());
        }
    }
    
    showSignUp() {
        if (this.signinForm) this.signinForm.classList.add('hidden');
        if (this.signupForm) this.signupForm.classList.remove('hidden');
        document.title = 'Sign Up - LLMChat.co';
    }
    
    showSignIn() {
        if (this.signupForm) this.signupForm.classList.add('hidden');
        if (this.signinForm) this.signinForm.classList.remove('hidden');
        document.title = 'Sign In - LLMChat.co';
    }
    
    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(inputId + '-toggle');
        
        if (!input || !toggle) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            toggle.classList.remove('fa-eye');
            toggle.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            toggle.classList.remove('fa-eye-slash');
            toggle.classList.add('fa-eye');
        }
    }
    
    checkPasswordStrength(password) {
        const strengthEl = document.getElementById('password-strength');
        
        if (!strengthEl) return;
        
        if (password.length === 0) {
            strengthEl.classList.add('hidden');
            return;
        }
        
        strengthEl.classList.remove('hidden');
        
        let score = 0;
        const requirements = [];
        
        if (password.length >= 8) score++;
        else requirements.push('at least 8 characters');
        
        if (/[A-Z]/.test(password)) score++;
        else requirements.push('uppercase letter');
        
        if (/[a-z]/.test(password)) score++;
        else requirements.push('lowercase letter');
        
        if (/\d/.test(password)) score++;
        else requirements.push('number');
        
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        else requirements.push('special character');
        
        // Reset classes
        strengthEl.className = '';
        strengthEl.classList.add('password-strength');
        
        if (score < 3) {
            strengthEl.classList.add('weak');
            strengthEl.textContent = `Weak password. Add: ${requirements.slice(0, 2).join(', ')}`;
        } else if (score < 5) {
            strengthEl.classList.add('medium');
            strengthEl.textContent = 'Good password. Consider adding more complexity.';
        } else {
            strengthEl.classList.add('strong');
            strengthEl.textContent = 'Strong password!';
        }
    }
    
    checkPasswordMatch() {
        const password = document.getElementById('signup-password');
        const password2 = document.getElementById('signup-password2');
        const matchEl = document.getElementById('password-match');
        
        if (!password || !password2 || !matchEl) return;
        
        if (password2.value.length === 0) {
            matchEl.classList.add('hidden');
            return;
        }
        
        matchEl.classList.remove('hidden');
        
        if (password.value === password2.value) {
            matchEl.textContent = '✓ Passwords match';
            matchEl.style.color = '#059669';
            password2.style.borderColor = 'var(--border)';
        } else {
            matchEl.textContent = '✗ Passwords do not match';
            matchEl.style.color = '#DC2626';
            password2.style.borderColor = '#DC2626';
        }
    }
    
    validateSignupForm(e) {
        const password = document.getElementById('signup-password');
        const password2 = document.getElementById('signup-password2');
        
        if (!password || !password2) return;
        
        if (password.value !== password2.value) {
            e.preventDefault();
            this.showFlashMessage('Passwords do not match.', 'error', 'signup-flash-messages');
            return;
        }
        
        if (password.value.length < 8) {
            e.preventDefault();
            this.showFlashMessage('Password must be at least 8 characters long.', 'error', 'signup-flash-messages');
            return;
        }
    }
    
    showFlashMessage(message, type = 'error', container = 'flash-messages') {
        const messageContainer = document.getElementById(container);
        if (!messageContainer) return;
        
        const messageClass = type === 'error' ? 'error-message' : 'success-message';
        
        messageContainer.innerHTML = `
            <div class="${messageClass}">
                ${message}
            </div>
        `;
        
        setTimeout(() => {
            messageContainer.innerHTML = '';
        }, 5000);
    }
}

// Utility Functions
class Utils {
    static autoHideFlashMessages() {
        setTimeout(() => {
            const messages = document.querySelectorAll('.error-message, .success-message');
            messages.forEach(msg => {
                msg.style.transition = 'opacity 0.5s ease';
                msg.style.opacity = '0';
                setTimeout(() => {
                    if (msg.parentNode) {
                        msg.remove();
                    }
                }, 500);
            });
        }, 5000);
    }
    
    static initializeAccessibility() {
        // Add proper ARIA labels and roles
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.setAttribute('role', 'form');
        });
        
        const inputs = document.querySelectorAll('input[type="password"]');
        inputs.forEach(input => {
            input.setAttribute('autocomplete', input.id.includes('signup') ? 'new-password' : 'current-password');
        });
        
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.setAttribute('autocomplete', 'email');
        });
    }
    
    static setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // ESC to close any open elements
            if (e.key === 'Escape') {
                const hiddenForms = document.querySelectorAll('.hidden');
                if (hiddenForms.length > 0) {
                    // Reset to signin form
                    const formManager = window.formManager;
                    if (formManager) {
                        formManager.showSignIn();
                    }
                }
            }
            
            // Ctrl/Cmd + Enter to submit active form
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const activeForm = document.querySelector('form:not(.hidden)');
                if (activeForm) {
                    activeForm.submit();
                }
            }
        });
    }
}

// Main Application Initialization
class LoginApp {
    constructor() {
        this.themeManager = null;
        this.formManager = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }
    
    initializeApp() {
        try {
            // Initialize managers
            this.themeManager = new ThemeManager();
            this.formManager = new FormManager();
            
            // Make form manager globally accessible for onclick handlers
            window.formManager = this.formManager;
            
            // Initialize utilities
            Utils.autoHideFlashMessages();
            Utils.initializeAccessibility();
            Utils.setupKeyboardNavigation();
            
            console.log('Login app initialized successfully');
        } catch (error) {
            console.error('Error initializing login app:', error);
        }
    }
}

function showSignUp() {
    if (window.formManager) {
        window.formManager.showSignUp();
    }
}

function showSignIn() {
    if (window.formManager) {
        window.formManager.showSignIn();
    }
}

function togglePassword(inputId) {
    if (window.formManager) {
        window.formManager.togglePassword(inputId);
    }
}

function toggleTheme() {
    if (window.loginApp && window.loginApp.themeManager) {
        window.loginApp.themeManager.toggleTheme();
    }
}

// Initialize the application
window.loginApp = new LoginApp();

// Export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LoginApp, ThemeManager, FormManager, Utils };
}