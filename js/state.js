// Application State and Data are centralized here to be shared across modules.

export let currentRoute = '/';
export let currentTheme = localStorage.getItem('theme') || 'dark';
export let isScrolled = false;
export let isMobileMenuOpen = false;
export let activeAuthTab = 'login';
export let activeLeaderboardFilter = 'weekly';
export let avatarPreview = null;
export let settingsAvatarPreview = null;
export let showPassword = false;
export let notifications = {
  email: true,
  push: false,
  streak: true,
  achievements: true
};

export const appData = {
};

// Simple setters to keep reactive values in sync across modules
export function setCurrentRoute(route) { currentRoute = route; }
export function setCurrentTheme(theme) { currentTheme = theme; }
export function setIsScrolled(val) { isScrolled = val; }
export function setIsMobileMenuOpen(val) { isMobileMenuOpen = val; }
export function setActiveAuthTab(val) { activeAuthTab = val; }
export function setActiveLeaderboardFilter(val) { activeLeaderboardFilter = val; }
export function setAvatarPreview(val) { avatarPreview = val; }
export function setSettingsAvatarPreview(val) { settingsAvatarPreview = val; }
export function setShowPassword(val) { showPassword = val; }

