import { appData } from '../state.js';
import { createIcon, getScoreClass } from '../utils.js';

export function renderDashboardPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="dashboard">
      <div class="container">
        <div class="welcome-panel">
          <div class="welcome-panel__avatar">
            <div class="avatar avatar--lg"><span>${appData.user.avatar}</span></div>
          </div>
          <div class="welcome-panel__content">
            <h1>Welcome back, ${appData.user.name.split(' ')[0]}!</h1>
            <p>Ready to continue your learning streak?</p>
          </div>
          <div class="xp-ring-container">
            <div class="xp-ring">
              <svg viewBox="0 0 100 100" class="xp-ring__svg">
                <defs>
                  <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="var(--accent)" />
                    <stop offset="100%" stop-color="var(--primary)" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-elev)" stroke-width="6"/>
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#xpGradient)" stroke-width="6" stroke-dasharray="283" stroke-dashoffset="85" transform="rotate(-90 50 50)" class="xp-progress"/>
              </svg>
              <div class="xp-ring__content">
                <span class="xp-ring__percentage">70%</span>
                <span class="xp-ring__label">Level ${appData.user.level}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="dashboard-section">
            <h2 class="section-title">Your Statistics</h2>
            <div class="stats-grid">
              ${appData.stats.map(stat => `
                <div class="stat-card stat-card--3d">
                  <div class="stat-card__icon">${stat.icon}</div>
                  <div class="stat-card__value">${stat.value}</div>
                  <div class="stat-card__label">${stat.label}</div>
                </div>`).join('')}
            </div>
          </div>
          <div class="dashboard-section">
            <h2 class="section-title">Recent Activity</h2>
            <div class="activity-list">
              ${appData.recentActivity.map(activity => `
                <div class="activity-item">
                  <div class="activity-item__info">
                    <h4>${activity.subject}</h4>
                    <p>${activity.date}</p>
                  </div>
                  <div class="activity-item__score">
                    <span class="score ${getScoreClass(activity.score)}">${activity.score}%</span>
                  </div>
                </div>`).join('')}
            </div>
          </div>
          <div class="challenge-card">
            <div class="challenge-card__header">
              <div class="challenge-card__icon">${createIcon('calendar')}</div>
              <h3>Daily Challenge</h3>
            </div>
            <p class="challenge-card__description">Complete today's 5-question challenge to maintain your streak!</p>
            <div class="challenge-card__progress">
              <div class="progress-bar">
                <div class="progress-bar__fill progress-bar__fill--animate"></div>
              </div>
              <span class="progress-text">3/5 questions</span>
            </div>
            <button class="btn btn--accent btn--full">Continue Challenge</button>
          </div>
        </div>
      </div>
    </div>`;

  setTimeout(() => {
    const xpProgress = document.querySelector('.xp-progress');
    if (xpProgress) xpProgress.style.strokeDashoffset = '85';
  }, 800);
}

