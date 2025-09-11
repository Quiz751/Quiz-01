import { currentRoute, setCurrentRoute } from './state.js';
import { renderHomePage } from './views/home.js';
import { renderAuthPage } from './views/auth.js';
import { renderDashboardPage } from './views/dashboard.js';
import { renderLeaderboardPage } from './views/leaderboard.js';
import { renderProfilePage } from './views/profile.js';
import { renderSubjectsPage } from './views/subjects.js';
import { renderQuizPage } from './views/quiz.js';
import { renderSettingsPage } from './views/settings.js';

export function navigateTo(route) {
  setCurrentRoute(route);
  history.pushState(null, '', route === '/' ? '/' : route);
  renderCurrentPage();
  updateActiveNavLink();
}

export function renderCurrentPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = '';
  mainContent.classList.add('page-transition');
  setTimeout(() => {
    switch (window.location.pathname) {
      case '/':
        renderHomePage();
        break;
      case '/auth':
        renderAuthPage();
        break;
      case '/dashboard':
        renderDashboardPage();
        break;
      case '/leaderboard':
        renderLeaderboardPage();
        break;
      case '/profile':
        renderProfilePage();
        break;
      case '/subjects':
        renderSubjectsPage();
        break;
      case '/quiz':
        renderQuizPage();
        break;
      case '/settings':
        renderSettingsPage();
        break;
      default:
        renderHomePage();
    }
    mainContent.classList.add('active');
  }, 50);
}

export function updateActiveNavLink() {
  document.querySelectorAll('.nav__link').forEach(link => {
    link.classList.remove('nav__link--active');
    if (link.getAttribute('data-route') === window.location.pathname) {
      link.classList.add('nav__link--active');
    }
  });
  document.querySelectorAll('.nav__mobile-link').forEach(link => {
    link.classList.remove('nav__mobile-link--active');
    if (link.getAttribute('data-route') === window.location.pathname) {
      link.classList.add('nav__mobile-link--active');
    }
  });
}

