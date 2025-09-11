import { appData, avatarPreview, setAvatarPreview } from '../state.js';
import { createIcon } from '../utils.js';

export function renderProfilePage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="profile-page">
      <div class="container">
        <div class="profile-header">
          <div class="profile-avatar-section">
            <div class="profile-avatar-container">
              ${avatarPreview ? `<img src="${avatarPreview}" alt="Profile" class="profile-avatar">` : `<div class="profile-avatar profile-avatar--default"><span>${appData.user.avatar}</span></div>`}
              <label class="avatar-upload-btn">${createIcon('camera', 16)}<input type="file" accept="image/*" class="avatar-upload-input" id="avatarUpload"></label>
            </div>
          </div>
          <div class="profile-info">
            <h1>${appData.user.name}</h1>
            <p class="profile-role">${appData.user.role}</p>
            <div class="profile-actions">
              <a href="#" class="btn btn--secondary" data-route="/settings">${createIcon('settings', 16)}Settings</a>
              <button class="btn btn--danger">${createIcon('logOut', 16)}Logout</button>
            </div>
          </div>
        </div>
        <div class="profile-grid">
          <div class="profile-card">
            <div class="profile-card__header"><h3>Profile Details</h3><button class="icon-btn">${createIcon('edit3', 16)}</button></div>
            <div class="profile-details">
              <div class="detail-item"><span class="detail-label">Full Name</span><span class="detail-value">${appData.user.name}</span></div>
              <div class="detail-item"><span class="detail-label">Email</span><span class="detail-value">${appData.user.email}</span></div>
              <div class="detail-item"><span class="detail-label">Member Since</span><span class="detail-value">${appData.user.memberSince}</span></div>
              <div class="detail-item"><span class="detail-label">Learning Focus</span><span class="detail-value">${appData.user.focus}</span></div>
            </div>
          </div>
          <div class="achievements-card">
            <h3>Recent Achievements</h3>
            <div class="achievements-grid">
              ${appData.achievements.map(a => `<div class="achievement-badge"><div class="achievement-icon">${a.icon}</div><div class="achievement-content"><h4>${a.title}</h4><p>${a.description}</p></div></div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const avatarUpload = document.getElementById('avatarUpload');
  if (avatarUpload) {
    avatarUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => { setAvatarPreview(event.target.result); renderProfilePage(); };
        reader.readAsDataURL(file);
      }
    });
  }
}

