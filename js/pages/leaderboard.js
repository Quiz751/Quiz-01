// Leaderboard Page JavaScript with Animations
document.addEventListener('DOMContentLoaded', function() {
    setupFilters();
    loadLeaderboard('weekly');
    // Live refresh on stats update
    window.addEventListener('storage', async (e) => {
        if (e && e.key === 'quizai:lastStatsUpdate') {
            const activeFilter = document.querySelector('.filter-btn--active').dataset.filter;
            loadLeaderboard(activeFilter);
        }
    });
});

async function loadLeaderboard(filter = 'weekly') {
    try {
        const res = await fetch(`api/routes/leaderboard.php?filter=${filter}`);
        const data = await res.json();
        console.log(data);
        if (!data) return;

        if (data.global_stats) {
            updateGlobalStats(data.global_stats);
        }

        if (Array.isArray(data.leaderboard)) {
            renderPodium(data.leaderboard.slice(0, 3));
            renderRankings(data.leaderboard.slice(3));
        }

    } catch (e) {
        // keep static content if API fails
    }
}

function updateGlobalStats(stats) {
    const statValues = document.querySelectorAll('.leaderboard-stats .stat-card__value');
    if (statValues.length >= 3) {
        statValues[0].textContent = stats.top_score || 0;
        statValues[1].textContent = stats.active_players || 0;
        statValues[2].textContent = stats.day_streak_record || 0;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
        animateLeaderboardStats();
    }
}

function renderPodium(podiumData) {
    const podium = document.querySelector('.podium');
    if (!podium) return;
    podium.innerHTML = '';

    const places = [1, 0, 2]; // Order to render: 2nd, 1st, 3rd
    const medals = ['🥇', '🥈', '🥉'];

    places.forEach(index => {
        if (podiumData[index]) {
            const user = podiumData[index];
            const place = index + 1;
            const podiumPlace = document.createElement('div');
            podiumPlace.className = `podium__place podium__place--${place}`;
            podiumPlace.innerHTML = `
                <div class="podium__glow"></div>
                <div class="podium__avatar"><span>${(user.username || 'U').slice(0,2).toUpperCase()}</span></div>
                <h3 class="podium__name">${user.username || 'User'}</h3>
                <p class="podium__xp">${user.xp ?? 0} XP</p>
                <div class="podium__medal">${medals[index]}</div>
            `;
            podium.appendChild(podiumPlace);
        }
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
        animatePodiumEntrance();
        animatePodiumXP();
    }
}

function renderRankings(rankingsData) {
    const list = document.querySelector('.rankings-list');
    if (!list) return;
    list.innerHTML = '';

    rankingsData.forEach((row, idx) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        item.innerHTML = `
            <div class="ranking-item__position"><span>${idx + 4}</span></div>
            <div class="ranking-item__avatar"><span>${(row.username || 'U').slice(0,2).toUpperCase()}</span></div>
            <div class="ranking-item__info">
                <h4>${row.username || 'User'}</h4>
                <p>XP</p>
            </div>
            <div class="ranking-item__stats"><span class="ranking-item__xp">${row.xp ?? 0} XP</span></div>
        `;
        list.appendChild(item);
    });
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('filter-btn--active'));
            button.classList.add('filter-btn--active');
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
            loadLeaderboard(button.dataset.filter);
        });
    });
}

function animateLeaderboardStats() {
    const statValues = document.querySelectorAll('.leaderboard-stats .stat-card__value');
    
    statValues.forEach((element, index) => {
        const finalValue = element.textContent;
        const isNumber = /^\d+/.test(finalValue);
        
        if (isNumber) {
            const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
            const hasComma = finalValue.includes(',');
            
            element.textContent = '0';
            
            setTimeout(() => {
                animateNumber(element, 0, numericValue, 1500, hasComma);
            }, 300 + (index * 150));
        }
    });
}

function animatePodiumXP() {
    const podiumXP = document.querySelectorAll('.podium__xp');
    
    podiumXP.forEach((element, index) => {
        const finalValue = element.textContent;
        const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
        
        element.textContent = '0 XP';
        
        setTimeout(() => {
            animateNumber(element, 0, numericValue, 1200, true, false, ' XP');
        }, 800 + (index * 200));
    });
}

function animatePodiumEntrance() {
    const podiumPlaces = document.querySelectorAll('.podium__place');
    
    podiumPlaces.forEach((place, index) => {
        place.style.opacity = '0';
        place.style.transform = 'translateY(50px) scale(0.8)';
        
        setTimeout(() => {
            place.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            place.style.opacity = '1';
            place.style.transform = 'translateY(0) scale(1)';
        }, 500 + (index * 80));
    });
}

function animateNumber(element, start, end, duration, hasComma = false, hasHash = false, suffix = '') {
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        let displayValue = current.toString();
        if (hasComma && current >= 1000) {
            displayValue = current.toLocaleString();
        }
        if (hasHash) {
            displayValue = '#' + displayValue;
        }
        
        element.textContent = displayValue + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}