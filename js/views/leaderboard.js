import { appData, activeLeaderboardFilter, setActiveLeaderboardFilter } from '../state.js';
import { createIcon, getTrendIcon } from '../utils.js';

export function renderLeaderboardPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="leaderboard-page">
      <div class="container">
        <div class="leaderboard-header">
          <h1 class="page-title">Global Leaderboard</h1>
          <p class="page-subtitle">See how you rank among the best learners worldwide</p>
        </div>
        <div class="leaderboard-stats">
          ${appData.leaderboardStats.map(stat => `
            <div class="stat-card stat-card--3d">
              <div class="stat-card__icon">${stat.icon}</div>
              <div class="stat-card__value">${stat.value}</div>
              <div class="stat-card__label">${stat.label}</div>
            </div>`).join('')}
        </div>
        <div class="podium-container">
          <div class="podium">
            ${appData.podiumPlayers.map(player => `
              <div class="podium__place podium__place--${player.position}">
                <div class="podium__glow"></div>
                <div class="podium__avatar"><span>${player.avatar}</span></div>
                <h3 class="podium__name">${player.name}</h3>
                <p class="podium__xp">${player.xp.toLocaleString()} XP</p>
                <div class="podium__medal">${player.position === 1 ? createIcon('crown') : player.position === 2 ? '🥈' : '🥉'}</div>
              </div>`).join('')}
          </div>
        </div>
        <div class="leaderboard-filters">
          ${['daily', 'weekly', 'monthly', 'all'].map(filter => `
            <button class="filter-btn ${activeLeaderboardFilter === filter ? 'filter-btn--active' : ''}" data-filter="${filter}">
              ${filter.charAt(0).toUpperCase() + filter.slice(1)}${filter === 'all' ? ' Time' : ''}
            </button>`).join('')}
        </div>
        <div class="rankings-container">
          <h2 class="section-title">Current Rankings</h2>
          <div class="rankings-list">
            ${appData.rankings.map(player => `
              <div class="ranking-item ${player.position === 5 ? 'ranking-item--highlight' : ''}">
                <div class="ranking-item__position"><span>${player.position}</span></div>
                <div class="ranking-item__avatar"><span>${player.name.split(' ').map(n => n[0]).join('')}</span></div>
                <div class="ranking-item__info">
                  <h4>${player.name}</h4>
                  <p>${player.subject} • 🔥 ${player.streak} day streak</p>
                </div>
                <div class="ranking-item__stats">
                  <span class="ranking-item__xp">${player.xp.toLocaleString()} XP</span>
                  <div class="ranking-item__trend">
                    <span class="trend-icon--${player.trend}">${getTrendIcon(player.trend)}</span>
                    <span class="trend-value trend-value--${player.trend}">${player.change > 0 ? '+' : ''}${player.change}</span>
                  </div>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;

  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveLeaderboardFilter(btn.getAttribute('data-filter'));
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
    });
  });
}

