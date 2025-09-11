// Profile Page JavaScript with Animations
document.addEventListener('DOMContentLoaded', function() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        // Animate profile cards entrance
        animateProfileCards();
        
        // Animate achievement badges
        animateAchievementBadges();
    } else {
        // If reduced motion is preferred, just show final state
        showFinalState();
    }
    
    // Setup avatar upload functionality
    setupAvatarUpload();
});

function animateProfileCards() {
    const profileCards = document.querySelectorAll('.profile-card, .achievements-card');
    
    profileCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.95)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, 200 + (index * 150));
    });
}

function animateAchievementBadges() {
    const achievementBadges = document.querySelectorAll('.achievement-badge');
    
    achievementBadges.forEach((badge, index) => {
        badge.style.opacity = '0';
        badge.style.transform = 'translateX(-20px) scale(0.8)';
        
        setTimeout(() => {
            badge.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            badge.style.opacity = '1';
            badge.style.transform = 'translateX(0) scale(1)';
        }, 600 + (index * 100));
    });
}

function setupAvatarUpload() {
    const avatarUpload = document.getElementById('avatarUpload');
    
    if (avatarUpload) {
        avatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    // Create a smooth transition for avatar change
                    const avatarContainer = document.querySelector('.profile-avatar-container');
                    const currentAvatar = avatarContainer.querySelector('.profile-avatar, .profile-avatar--default');
                    
                    if (currentAvatar) {
                        currentAvatar.style.transition = 'all 0.3s ease';
                        currentAvatar.style.transform = 'scale(0.8)';
                        currentAvatar.style.opacity = '0.5';
                        
                        setTimeout(() => {
                            // Replace with new avatar
                            const newAvatar = document.createElement('img');
                            newAvatar.src = event.target.result;
                            newAvatar.alt = 'Profile';
                            newAvatar.className = 'profile-avatar';
                            newAvatar.style.transition = 'all 0.3s ease';
                            newAvatar.style.transform = 'scale(0.8)';
                            newAvatar.style.opacity = '0';
                            
                            currentAvatar.replaceWith(newAvatar);
                            
                            // Animate in the new avatar
                            setTimeout(() => {
                                newAvatar.style.transform = 'scale(1)';
                                newAvatar.style.opacity = '1';
                            }, 50);
                        }, 300);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function showFinalState() {
    // For users who prefer reduced motion, just show the final state immediately
    const profileCards = document.querySelectorAll('.profile-card, .achievements-card');
    const achievementBadges = document.querySelectorAll('.achievement-badge');
    
    profileCards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
    });
    
    achievementBadges.forEach(badge => {
        badge.style.opacity = '1';
        badge.style.transform = 'translateX(0) scale(1)';
    });
}