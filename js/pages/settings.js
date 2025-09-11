// Settings Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        // Animate settings cards entrance
        animateSettingsCards();
    } else {
        // If reduced motion is preferred, just show final state
        showFinalState();
    }
    
    // Setup settings functionality
    setupThemeToggle();
    setupAvatarUpload();
    setupNotificationToggles();
});

function animateSettingsCards() {
    const settingsCards = document.querySelectorAll('.settings-card');
    
    settingsCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.95)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, 200 + (index * 150));
    });
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        // Set initial state based on current theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            themeToggle.classList.add('toggle-switch--active');
        }
        
        themeToggle.addEventListener('click', () => {
            // Add button animation
            themeToggle.style.transform = 'scale(0.95)';
            setTimeout(() => {
                themeToggle.style.transform = 'scale(1)';
            }, 150);
            
            // Toggle theme
            toggleTheme();
        });
    }
}

function setupAvatarUpload() {
    const avatarUpload = document.getElementById('settingsAvatarUpload');
    const removeAvatar = document.getElementById('removeAvatar');
    
    if (avatarUpload) {
        avatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const avatarPreview = document.querySelector('.avatar-preview');
                    if (avatarPreview) {
                        avatarPreview.innerHTML = `
                            <img src="${event.target.result}" alt="Avatar preview" class="avatar-image">
                        `;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (removeAvatar) {
        removeAvatar.addEventListener('click', () => {
            const avatarPreview = document.querySelector('.avatar-preview');
            if (avatarPreview) {
                avatarPreview.innerHTML = `
                    <div class="avatar-placeholder">
                        <span>JD</span>
                    </div>
                `;
            }
        });
    }
}

function setupNotificationToggles() {
    const notificationToggles = document.querySelectorAll('[data-notification]');
    
    notificationToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // Add button animation
            toggle.style.transform = 'scale(0.95)';
            setTimeout(() => {
                toggle.style.transform = 'scale(1)';
            }, 150);
            
            // Toggle notification setting
            toggle.classList.toggle('toggle-switch--active');
        });
    });
}

function showFinalState() {
    // For users who prefer reduced motion, just show the final state immediately
    const settingsCards = document.querySelectorAll('.settings-card');
    
    settingsCards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
    });
}