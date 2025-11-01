// Shared Theme JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
});

function initTheme() {
    // Get theme from localStorage or default to light (original design)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle in settings if visible
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        updateThemeToggle(themeToggle);
    }
}

function updateThemeToggle(toggle) {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        toggle.classList.add('toggle-switch--active');
    } else {
        toggle.classList.remove('toggle-switch--active');
    }
}