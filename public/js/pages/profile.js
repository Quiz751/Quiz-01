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


    const profileImage = document.getElementById('profileImage');
    if (user.profile_image) {
        profileImage.innerHTML = `<img src="data:image/png;base64,${user.profile_image}" alt="Profile Image" class="profile-avatar">`;
    } else {
        profileImage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="profile-avatar"><circle cx="12" cy="7" r="4"></circle><path d="M5.5 21v-2a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v2"></path></svg>';
    }

    // Details
    document.getElementById('fullName').textContent = user.username;
    document.getElementById('email').textContent = user.email;
    document.getElementById('memberSince').textContent = new Date(user.created_at).toLocaleDateString();


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