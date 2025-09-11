import { currentTheme, settingsAvatarPreview, setSettingsAvatarPreview, notifications } from '../state.js';
import { createIcon } from '../utils.js';
import { toggleTheme } from '../theme.js';

export function renderSettingsPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="settings-page">
      <div class="container">
        <div class="settings-header">
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Customize your QuizAI experience</p>
        </div>
        <div class="settings-grid">
          <div class="settings-card">
            <div class="settings-card__header"><h3>Appearance</h3>${currentTheme === 'dark' ? createIcon('moon', 20) : createIcon('sun', 20)}</div>
            <div class="settings-option">
              <div class="settings-option__info"><h4>Dark Mode</h4><p>Toggle between light and dark themes</p></div>
              <button class="toggle-switch ${currentTheme === 'dark' ? 'toggle-switch--active' : ''}" id="themeToggle"><div class="toggle-switch__thumb"></div></button>
            </div>
          </div>
          <div class="settings-card">
            <div class="settings-card__header"><h3>Profile</h3>${createIcon('camera', 20)}</div>
            <div class="avatar-settings">
              <div class="avatar-preview">
                ${settingsAvatarPreview ? `<img src="${settingsAvatarPreview}" alt="Avatar preview" class="avatar-image">` : `<div class="avatar-placeholder"><span>JD</span></div>`}
              </div>
              <div class="avatar-actions">
                <label class="btn btn--secondary btn--sm">${createIcon('camera', 16)}Upload Avatar<input type="file" accept="image/*" class="avatar-upload-input" id="settingsAvatarUpload"></label>
                <button class="btn btn--danger btn--sm" id="removeAvatar">${createIcon('trash2', 16)}Remove</button>
              </div>
            </div>
          </div>
          <div class="settings-card">
            <div class="settings-card__header"><h3>Notifications</h3>${createIcon('bell', 20)}</div>
            <div class="notifications-list">
              ${Object.entries(notifications).map(([key, value]) => `
                <div class="settings-option">
                  <div class="settings-option__info"><h4>${key.charAt(0).toUpperCase() + key.slice(1)} Notifications</h4><p>Receive ${key} notifications</p></div>
                  <button class="toggle-switch ${value ? 'toggle-switch--active' : ''}" data-notification="${key}"><div class="toggle-switch__thumb"></div></button>
                </div>`).join('')}
            </div>
          </div>
          <div class="settings-card settings-card--danger">
            <div class="settings-card__header"><h3>Account</h3>${createIcon('shield', 20)}</div>
            <div class="settings-option">
              <div class="settings-option__info"><h4>Delete Account</h4><p>Permanently delete your account and all data</p></div>
              <button class="btn btn--danger">${createIcon('trash2', 16)}Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  const settingsAvatarUpload = document.getElementById('settingsAvatarUpload');
  if (settingsAvatarUpload) {
    settingsAvatarUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => { setSettingsAvatarPreview(event.target.result); renderSettingsPage(); };
        reader.readAsDataURL(file);
      }
    });
  }

  const removeAvatar = document.getElementById('removeAvatar');
  if (removeAvatar) {
    removeAvatar.addEventListener('click', () => { setSettingsAvatarPreview(null); renderSettingsPage(); });
  }

  document.querySelectorAll('[data-notification]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const key = toggle.getAttribute('data-notification');
      // Toggle boolean in place
      notifications[key] = !notifications[key];
      toggle.classList.toggle('toggle-switch--active');
    });
  });
}

