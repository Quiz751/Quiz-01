import { currentTheme, setCurrentTheme } from './state.js';

export function initTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

export function toggleTheme() {
  const next = currentTheme === 'light' ? 'dark' : 'light';
  setCurrentTheme(next);
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) updateThemeToggle(themeToggle);
}

export function updateThemeToggle(toggle) {
  if (currentTheme === 'dark') toggle.classList.add('toggle-switch--active');
  else toggle.classList.remove('toggle-switch--active');
}

