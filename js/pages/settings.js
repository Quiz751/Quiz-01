// Settings Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        animateSettingsCards();
    } else {
        showFinalState();
    }
    
    loadSettings();
    setupThemeToggle();
    setupAvatarUpload();
    setupNotificationToggles();
    setupSettingsForm();
});

async function loadSettings() {
    try {
        const res = await fetch('api/routes/settings.php?action=get_settings');
        const data = await res.json();

        if (data.error) {
            console.error(data.error);
            return;
        }

        document.getElementById('username').value = data.username || '';
        document.getElementById('email').value = data.email || '';

        const avatarPreview = document.querySelector('.avatar-preview');
        if (data.profile_image) {
            avatarPreview.innerHTML = `<img src="${data.profile_image}" alt="Avatar preview" class="avatar-image">`;
        } else {
            avatarPreview.innerHTML = `<div class="avatar-placeholder"><span>${(data.username || 'U')[0].toUpperCase()}</span></div>`;
        }

        const achievementsPreview = document.querySelector('.achievements-preview');
        achievementsPreview.innerHTML = '';
        if (data.achievements && data.achievements.length > 0) {
            data.achievements.slice(0, 3).forEach(ach => {
                const achievementItem = document.createElement('div');
                achievementItem.className = 'achievement-item';
                achievementItem.innerHTML = `
                    <div class="achievement-icon">🏆</div>
                    <div class="achievement-info">
                        <h4>${ach.achievement_name}</h4>
                        <p>Achieved on ${new Date(ach.achieved_at).toLocaleDateString()}</p>
                    </div>
                    <div class="achievement-status achieved">✓</div>
                `;
                achievementsPreview.appendChild(achievementItem);
            });
        } else {
            achievementsPreview.innerHTML = '<p>No achievements yet.</p>';
        }

    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

function setupSettingsForm() {
    const form = document.getElementById('settingsForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const res = await fetch('api/routes/settings.php?action=update_settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (result.success) {
                    alert('Settings updated successfully!');
                } else {
                    alert(`Error: ${result.error}`);
                }
            } catch (error) {
                alert('An error occurred while updating settings.');
            }
        });
    }
}

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
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            themeToggle.classList.add('toggle-switch--active');
        }
        
        themeToggle.addEventListener('click', () => {
            themeToggle.style.transform = 'scale(0.95)';
            setTimeout(() => {
                themeToggle.style.transform = 'scale(1)';
            }, 150);
            
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
                reader.onload = async (event) => {
                    const avatarPreview = document.querySelector('.avatar-preview');
                    if (avatarPreview) {
                        avatarPreview.innerHTML = `<img src="${event.target.result}" alt="Avatar preview" class="avatar-image">`;
                    }
                    await updateProfileImage(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (removeAvatar) {
        removeAvatar.addEventListener('click', async () => {
            const avatarPreview = document.querySelector('.avatar-preview');
            if (avatarPreview) {
                const username = document.getElementById('username').value || 'U';
                avatarPreview.innerHTML = `<div class="avatar-placeholder"><span>${username[0].toUpperCase()}</span></div>`;
            }
            await removeProfileImage();
        });
    }
}

async function updateProfileImage(imageData) {
    try {
        const res = await fetch('api/routes/settings.php?action=update_profile_image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_data: imageData })
        });
        const result = await res.json();
        if (!result.success) {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        alert('An error occurred while updating the profile image.');
    }
}

async function removeProfileImage() {
    try {
        const res = await fetch('api/routes/settings.php?action=remove_profile_image', {
            method: 'POST'
        });
        const result = await res.json();
        if (!result.success) {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        alert('An error occurred while removing the profile image.');
    }
}

function setupNotificationToggles() {
    const notificationToggles = document.querySelectorAll('[data-notification]');
    
    notificationToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.style.transform = 'scale(0.95)';
            setTimeout(() => {
                toggle.style.transform = 'scale(1)';
            }, 150);
            
            toggle.classList.toggle('toggle-switch--active');
        });
    });
}

function showFinalState() {
    const settingsCards = document.querySelectorAll('.settings-card');
    
    settingsCards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
    });
}
