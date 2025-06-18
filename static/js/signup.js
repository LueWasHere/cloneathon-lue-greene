/**
 * Signup Page JavaScript - signup.js
 * Handles password validation, form submission, and user interactions for the signup page
 */

// Password Management
class PasswordManager {
    constructor() {
        this.passwordInput = document.getElementById('password');
        this.password2Input = document.getElementById('password2');
        this.strengthEl = document.getElementById('password-strength');
        this.matchEl = document.getElementById('password-match');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', () => {
                this.checkPasswordStrength(this.passwordInput.value);
                this.checkPasswordMatch();
            });
        }
        
        if (this.password2Input) {
            this.password2Input.addEventListener('input', () => this.checkPasswordMatch());
        }
        
        // Setup password toggle buttons
        this.setupPasswordToggles();
    }
    
    setupPasswordToggles() {
        const toggleButtons = [
            { inputId: 'password', toggleId: 'password-toggle' },
            { inputId: 'password2', toggleId: 'password2-toggle' }
        ];
        
        toggleButtons.forEach(({ inputId, toggleId }) => {
            const button = document.getElementById(toggleId);
            if (button) {
                button.addEventListener('click', () => this.togglePassword(inputId));
            }
        });
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
        if (!this.strengthEl) return;
        
        if (password.length === 0) {
            this.strengthEl.classList.add('hidden');
            return;
        }
        
        this.strengthEl.classList.remove('hidden');
        
        let score = 0;
        const feedback = [];
        
        // Check various password criteria
        const criteria = [
            { test: password.length >= 8, message: 'at least 8 characters' },
            { test: /[A-Z]/.test(password), message: 'uppercase letter' },
            { test: /[a-z]/.test(password), message: 'lowercase letter' },
            { test: /\d/.test(password), message: 'number' },
            { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: 'special character' }
        ];
        
        criteria.forEach(criterion => {
            if (criterion.test) {
                score++;
            } else {
                feedback.push(criterion.message);
            }
        });
        
        // Reset classes and apply new ones
        this.strengthEl.className = 'password-strength';
        
        if (score < 3) {
            this.strengthEl.classList.add('weak');
            this.strengthEl.textContent = `Weak password. Add: ${feedback.slice(0, 2).join(', ')}`;
        } else if (score < 5) {
            this.strengthEl.classList.add('medium');
            this.strengthEl.textContent = 'Good password. Consider adding more complexity.';
        } else {
            this.strengthEl.classList.add('strong');
            this.strengthEl.textContent = 'Strong password!';
        }
    }
    
    checkPasswordMatch() {
        if (!this.passwordInput || !this.password2Input || !this.matchEl) return;
        
        const password = this.passwordInput.value;
        const password2 = this.password2Input.value;
        
        if (password2.length === 0) {
            this.matchEl.classList.add('hidden');
            this.password2Input.style.borderColor = 'var(--border)';
            return;
        }
        
        this.matchEl.classList.remove('hidden');
        
        if (password === password2) {
            this.matchEl.textContent = '✓ Passwords match';
            this.matchEl.style.color = '#166534';
            this.password2Input.style.borderColor = 'var(--border)';
        } else {
            this.matchEl.textContent = '✗ Passwords do not match';
            this.matchEl.style.color = '#DC2626';
            this.password2Input.style.borderColor = '#DC2626';
        }
    }
    
    validatePasswords() {
        if (!this.passwordInput || !this.password2Input) return { valid: false, message: 'Password fields not found' };
        
        const password = this.passwordInput.value;
        const password2 = this.password2Input.value;
        
        if (password !== password2) {
            return { valid: false, message: 'Passwords do not match.' };
        }
        
        if (password.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters long.' };
        }
        
        return { valid: true };
    }
}

// Form Validation Manager
class FormValidator {
    constructor() {
        this.form = document.getElementById('signup-form');
        this.passwordManager = new PasswordManager();
        
        this.init();
    }
    
    init() {
        this.setupFormValidation();
        this.setupRealTimeValidation();
    }
    
    setupFormValidation() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.validateForm(e));
        }
    }
    
    setupRealTimeValidation() {
        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail(emailInput.value));
            emailInput.addEventListener('input', () => this.clearEmailError());
        }
        
        // Name validation
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.addEventListener('blur', () => this.validateName(nameInput.value));
            nameInput.addEventListener('input', () => this.clearNameError());
        }
    }
    
    validateForm(e) {
        let isValid = true;
        const errors = [];
        
        // Validate name
        const name = document.getElementById('name')?.value.trim();
        if (!name || name.length < 2) {
            errors.push('Name must be at least 2 characters long.');
            isValid = false;
        }
        
        // Validate email
        const email = document.getElementById('email')?.value.trim();
        if (!this.isValidEmail(email)) {
            errors.push('Please enter a valid email address.');
            isValid = false;
        }
        
        // Validate passwords
        const passwordValidation = this.passwordManager.validatePasswords();
        if (!passwordValidation.valid) {
            errors.push(passwordValidation.message);
            isValid = false;
        }
        
        // Validate terms checkbox
        const termsCheckbox = document.getElementById('terms');
        if (termsCheckbox && !termsCheckbox.checked) {
            errors.push('You must agree to the Terms of Service and Privacy Policy.');
            isValid = false;
        }
        
        if (!isValid) {
            e.preventDefault();
            this.showErrors(errors);
        }
    }
    
    validateEmail(email) {
        const emailInput = document.getElementById('email');
        if (!emailInput) return;
        
        if (email && !this.isValidEmail(email)) {
            this.showFieldError(emailInput, 'Please enter a valid email address.');
        } else {
            this.clearFieldError(emailInput);
        }
    }
    
    validateName(name) {
        const nameInput = document.getElementById('name');
        if (!nameInput) return;
        
        if (name && name.trim().length < 2) {
            this.showFieldError(nameInput, 'Name must be at least 2 characters long.');
        } else {
            this.clearFieldError(nameInput);
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    showFieldError(field, message) {
        field.style.borderColor = '#DC2626';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorEl = document.createElement('div');
        errorEl.className = 'field-error text-red-600 text-xs mt-1';
        errorEl.textContent = message;
        field.parentNode.appendChild(errorEl);
    }
    
    clearFieldError(field) {
        field.style.borderColor = 'var(--border)';
        const errorEl = field.parentNode.querySelector('.field-error');
        if (errorEl) {
            errorEl.remove();
        }
    }
    
    clearEmailError() {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            this.clearFieldError(emailInput);
        }
    }
    
    clearNameError() {
        const nameInput = document.getElementById('name');
        if (nameInput) {
            this.clearFieldError(nameInput);
        }
    }
    
    showErrors(errors) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.innerHTML = errors.join('<br>');
        
        // Insert at the top of the form
        const form = document.getElementById('signup-form');
        if (form) {
            form.insertBefore(errorContainer, form.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorContainer.parentNode) {
                    errorContainer.remove();
                }
            }, 5000);
        }
    }
}

// Flash Message Manager
class FlashMessageManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.autoHideMessages();
    }
    
    autoHideMessages() {
        setTimeout(() => {
            const messages = document.querySelectorAll('.error-message, .success-message');
            messages.forEach(msg => {
                if (!msg.classList.contains('field-error')) {
                    msg.style.transition = 'opacity 0.5s ease';
                    msg.style.opacity = '0';
                    setTimeout(() => {
                        if (msg.parentNode) {
                            msg.remove();
                        }
                    }, 500);
                }
            });
        }, 5000);
    }
    
    static showMessage(message, type = 'error') {
        const messageContainer = document.createElement('div');
        messageContainer.className = type === 'error' ? 'error-message' : 'success-message';
        messageContainer.textContent = message;
        
        const form = document.getElementById('signup-form');
        if (form) {
            form.insertBefore(messageContainer, form.firstChild);
            
            setTimeout(() => {
                if (messageContainer.parentNode) {
                    messageContainer.remove();
                }
            }, 5000);
        }
    }
}

// Accessibility Manager
class AccessibilityManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupKeyboardNavigation();
        this.setupAriaLabels();
        this.setupFormAnnouncements();
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to submit form
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const form = document.getElementById('signup-form');
                if (form) {
                    form.submit();
                }
            }
        });
    }
    
    setupAriaLabels() {
        // Add proper ARIA labels
        const form = document.getElementById('signup-form');
        if (form) {
            form.setAttribute('role', 'form');
            form.setAttribute('aria-label', 'Create new account');
        }
        
        // Password fields
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach((input, index) => {
            input.setAttribute('autocomplete', 'new-password');
            if (index === 0) {
                input.setAttribute('aria-describedby', 'password-strength');
            } else {
                input.setAttribute('aria-describedby', 'password-match');
            }
        });
        
        // Email input
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.setAttribute('autocomplete', 'email');
        }
        
        // Name input
        const nameInput = document.getElementById('name');
        if (nameInput) {
            nameInput.setAttribute('autocomplete', 'name');
        }
    }
    
    setupFormAnnouncements() {
        // Create a live region for screen reader announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    }
    
    static announce(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
}

// Main Signup Application
class SignupApp {
    constructor() {
        this.formValidator = null;
        this.flashMessageManager = null;
        this.accessibilityManager = null;
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }
    
    initializeApp() {
        try {
            // Initialize all managers
            this.formValidator = new FormValidator();
            this.flashMessageManager = new FlashMessageManager();
            this.accessibilityManager = new AccessibilityManager();
            
            // Setup additional features
            this.setupTooltips();
            this.setupProgressIndicator();
            
            console.log('Signup app initialized successfully');
        } catch (error) {
            console.error('Error initializing signup app:', error);
        }
    }
    
    setupTooltips() {
        // Add helpful tooltips for password requirements
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.setAttribute('title', 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
        }
    }
    
    setupProgressIndicator() {
        // Visual progress indicator for form completion
        const inputs = document.querySelectorAll('#signup-form input[required]');
        const updateProgress = () => {
            const completed = Array.from(inputs).filter(input => input.value.trim() !== '').length;
            const percentage = (completed / inputs.length) * 100;
            
            // Update progress bar if it exists
            const progressBar = document.getElementById('form-progress');
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
        };
        
        inputs.forEach(input => {
            input.addEventListener('input', updateProgress);
        });
    }
}

// Global functions for backward compatibility
function togglePassword(inputId) {
    const passwordManager = window.signupApp?.formValidator?.passwordManager;
    if (passwordManager) {
        passwordManager.togglePassword(inputId);
    }
}

// Initialize the application
window.signupApp = new SignupApp();

// Export for ES6 modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        SignupApp, 
        PasswordManager, 
        FormValidator, 
        FlashMessageManager, 
        AccessibilityManager 
    };
}