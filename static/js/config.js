// js/config.js

// Tailwind CSS runtime configuration
tailwind.config = {
    theme: {
        extend: {
            colors: {
                // Default theme colors
                'default-light-main-bg': '#F9F9F9',
                'default-light-sidebar-bg': '#F0F0F0',
                'default-light-surface': '#FFFFFF',
                'default-light-primary-text': '#333333',
                'default-light-secondary-text': '#888888',
                'default-light-border': '#E5E5E5',
                'default-light-primary-btn': '#111111',
                'default-dark-main-bg': '#171717',
                'default-dark-sidebar-bg': '#1E1E1E',
                'default-dark-surface': '#252525',
                'default-dark-primary-text': '#E5E5E5',
                'default-dark-secondary-text': '#A0A0A0',
                'default-dark-border': '#333333',
                'default-dark-primary-btn': '#4b5563',
                
                // Blue theme colors
                'blue-light-main-bg': '#F8FAFC',
                'blue-light-sidebar-bg': '#F1F5F9',
                'blue-light-surface': '#FFFFFF',
                'blue-light-primary-text': '#1E293B',
                'blue-light-secondary-text': '#64748B',
                'blue-light-border': '#E2E8F0',
                'blue-light-primary-btn': '#1E40AF',
                'blue-dark-main-bg': '#0F172A',
                'blue-dark-sidebar-bg': '#1E293B',
                'blue-dark-surface': '#334155',
                'blue-dark-primary-text': '#F1F5F9',
                'blue-dark-secondary-text': '#94A3B8',
                'blue-dark-border': '#475569',
                'blue-dark-primary-btn': '#3B82F6',
                
                // Green theme colors
                'green-light-main-bg': '#F7FDF7',
                'green-light-sidebar-bg': '#F0FDF4',
                'green-light-surface': '#FFFFFF',
                'green-light-primary-text': '#14532D',
                'green-light-secondary-text': '#6B7280',
                'green-light-border': '#D1FAE5',
                'green-light-primary-btn': '#166534',
                'green-dark-main-bg': '#0F1B0F',
                'green-dark-sidebar-bg': '#1A2E1A',
                'green-dark-surface': '#2D4A2D',
                'green-dark-primary-text': '#ECFDF5',
                'green-dark-secondary-text': '#9CA3AF',
                'green-dark-border': '#4ADE80',
                'green-dark-primary-btn': '#22C55E',
                
                // Purple theme colors
                'purple-light-main-bg': '#FDFAFF',
                'purple-light-sidebar-bg': '#FAF5FF',
                'purple-light-surface': '#FFFFFF',
                'purple-light-primary-text': '#581C87',
                'purple-light-secondary-text': '#7C3AED',
                'purple-light-border': '#E9D5FF',
                'purple-light-primary-btn': '#6b21a8',
                'purple-dark-main-bg': '#1A0B2E',
                'purple-dark-sidebar-bg': '#2E1065',
                'purple-dark-surface': '#4C1D95',
                'purple-dark-primary-text': '#F3E8FF',
                'purple-dark-secondary-text': '#C4B5FD',
                'purple-dark-border': '#8B5CF6',
                'purple-dark-primary-btn': '#A855F7',
                
                // Warm theme colors
                'warm-light-main-bg': '#FFFBF5',
                'warm-light-sidebar-bg': '#FEF3E2',
                'warm-light-surface': '#FFFFFF',
                'warm-light-primary-text': '#9A3412',
                'warm-light-secondary-text': '#EA580C',
                'warm-light-border': '#FDBA74',
                'warm-light-primary-btn': '#C2410C',
                'warm-dark-main-bg': '#1C0F0A',
                'warm-dark-sidebar-bg': '#2C1810',
                'warm-dark-surface': '#44281A',
                'warm-dark-primary-text': '#FED7AA',
                'warm-dark-secondary-text': '#FDBA74',
                'warm-dark-border': '#F97316',
                'warm-dark-primary-btn': '#FB923C'
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', 'sans-serif']
            },
            backdropBlur: {
                'xs': '2px',
            }
        }
    }
}

// Theme color definitions
const themes = {
    default: { light: { mainBg: '#F9F9F9', sidebarBg: '#F0F0F0', surface: '#FFFFFF', primaryText: '#333333', secondaryText: '#888888', border: '#E5E5E5', primaryBtn: '#111111' }, dark: { mainBg: '#171717', sidebarBg: '#1E1E1E', surface: '#252525', primaryText: '#E5E5E5', secondaryText: '#A0A0A0', border: '#333333', primaryBtn: '#4b5563' } },
    blue: { light: { mainBg: '#F8FAFC', sidebarBg: '#F1F5F9', surface: '#FFFFFF', primaryText: '#1E293B', secondaryText: '#64748B', border: '#E2E8F0', primaryBtn: '#1E40AF' }, dark: { mainBg: '#0F172A', sidebarBg: '#1E293B', surface: '#334155', primaryText: '#F1F5F9', secondaryText: '#94A3B8', border: '#475569', primaryBtn: '#3B82F6' } },
    green: { light: { mainBg: '#F7FDF7', sidebarBg: '#F0FDF4', surface: '#FFFFFF', primaryText: '#14532D', secondaryText: '#6B7280', border: '#D1FAE5', primaryBtn: '#166534' }, dark: { mainBg: '#0F1B0F', sidebarBg: '#1A2E1A', surface: '#2D4A2D', primaryText: '#ECFDF5', secondaryText: '#9CA3AF', border: '#4ADE80', primaryBtn: '#22C55E' } },
    purple: { light: { mainBg: '#FDFAFF', sidebarBg: '#FAF5FF', surface: '#FFFFFF', primaryText: '#581C87', secondaryText: '#7C3AED', border: '#E9D5FF', primaryBtn: '#6b21a8' }, dark: { mainBg: '#1A0B2E', sidebarBg: '#2E1065', surface: '#4C1D95', primaryText: '#F3E8FF', secondaryText: '#C4B5FD', border: '#8B5CF6', primaryBtn: '#A855F7' } },
    warm: { light: { mainBg: '#FFFBF5', sidebarBg: '#FEF3E2', surface: '#FFFFFF', primaryText: '#9A3412', secondaryText: '#EA580C', border: '#FDBA74', primaryBtn: '#C2410C' }, dark: { mainBg: '#1C0F0A', sidebarBg: '#2C1810', surface: '#44281A', primaryText: '#FED7AA', secondaryText: '#FDBA74', border: '#F97316', primaryBtn: '#FB923C' } }
};