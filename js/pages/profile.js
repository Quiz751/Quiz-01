document.addEventListener('DOMContentLoaded', async () => {
    const isLoggedIn = await ensureLoggedIn();
    if (!isLoggedIn) {
        window.location.href = 'auth.html';
        return;
    }

    loadProfileData();

    window.addEventListener('storage', (e) => {
        if (e.key === 'quizai:lastStatsUpdate') {
            loadProfileData();
        }
    });

    document.getElementById('logout-button').addEventListener('click', () => {
        fetch('api/routes/auth.php?action=logout', { method: 'POST' })
            .then(() => window.location.href = 'auth.html');
    });
});

function loadProfileData() {
    fetch('api/routes/profile.php')
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.error) {
                console.error(data.error);
                return;
            }
            populateProfile(data);
        })
        .catch(err => console.error('Error fetching profile:', err));
}

function populateProfile(data) {
    const user = data.user;
    const stats = data.stats;

    // Header
    document.getElementById('username').textContent = user.username;
    document.getElementById('level').textContent = `Level ${stats.level}`;
    const progressBar = document.getElementById('progress-bar');
    const progressLabel = document.getElementById('progress-label');
    progressBar.style.width = `${stats.progress}%;`;
    progressLabel.textContent = `${stats.progress}% to next level`;

    const profileImage = document.getElementById('profileImage');
    if (user.profile_image) {
        profileImage.innerHTML = `<img src="data:image/png;base64,${user.profile_image}" alt="Profile Image" class="profile-avatar">`;
    } else {
        document.getElementById('avatar-initials').textContent = (user.username || 'U')[0].toUpperCase();
    }

    // Details
    document.getElementById('fullName').textContent = user.username;
    document.getElementById('email').textContent = user.email;
    document.getElementById('memberSince').textContent = new Date(user.created_at).toLocaleDateString();
    document.getElementById('learningFocus').textContent = data.learning_focus || 'Not set';

    // Achievements
    const achievementsContainer = document.getElementById('achievements');
    achievementsContainer.innerHTML = '';
    if (data.achievements && data.achievements.length > 0) {
        data.achievements.forEach(ach => {
            const achievement = document.createElement('div');
            achievement.className = 'achievement-badge';
            achievement.innerHTML = `
                <div class="achievement-icon">🏆</div>
                <div class="achievement-content">
                    <h4>${ach.achievement_name}</h4>
                    <p>Achieved on ${new Date(ach.achieved_at).toLocaleDateString()}</p>
                </div>
            `;
            achievementsContainer.appendChild(achievement);
        });
    } else {
        achievementsContainer.innerHTML = '<p>No achievements yet.</p>';
    }
}

async function ensureLoggedIn() {
    try {
        const res = await fetch('api/routes/auth.php?action=check_session');
        const data = await res.json();
        return data.logged_in === true;
    } catch (error) {
        return false;
    }
}