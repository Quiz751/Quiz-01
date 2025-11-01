// Main module: initializes theme, navigation, routing, and page rendering.
import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { renderCurrentPage, updateActiveNavLink } from './router.js';

function init() {
  initTheme();
  initNavigation();
  window.addEventListener('popstate', () => {
    renderCurrentPage();
    updateActiveNavLink();
  });
  renderCurrentPage();
  updateActiveNavLink();
}

document.addEventListener('DOMContentLoaded', init);

