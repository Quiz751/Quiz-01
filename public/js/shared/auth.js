import { activeAuthTab, setActiveAuthTab, showPassword, setShowPassword } from '../state.js';
import { createIcon } from '../utils.js';


export function renderAuthPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="auth-orb auth-orb--1"></div>
        <div class="auth-orb auth-orb--2"></div>
      </div>
      <div class="container">
        <div class="auth-card">
          <div class="auth-tabs">
            <button class="auth-tab ${activeAuthTab === 'login' ? 'auth-tab--active' : ''}" data-tab="login">Login</button>
            <button class="auth-tab ${activeAuthTab === 'signup' ? 'auth-tab--active' : ''}" data-tab="signup">Sign Up</button>
          </div>
          <div class="auth-form" id="authForm">${renderAuthForm()}</div>
          <div class="auth-demo">
            <div class="auth-demo__content">
              <h4>Quick Demo</h4>
              <p>Try without creating an account</p>
              <a href="#" class="btn btn--secondary btn--sm" data-route="/dashboard">Continue as Guest</a>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      setActiveAuthTab(tab.getAttribute('data-tab'));
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('auth-tab--active'));
      tab.classList.add('auth-tab--active');
      document.getElementById('authForm').innerHTML = renderAuthForm();
      setupPasswordToggle();
    });
  });

  setupPasswordToggle();
}

function renderAuthForm() {
  if (activeAuthTab === 'login') {
    return `
      <h2 class="auth-title">Welcome Back</h2>
      <p class="auth-subtitle">Sign in to continue your learning journey</p>
      <form class="form" onsubmit="return false;">
        <div class="form__group">
          <input type="email" class="form__input" placeholder=" " required>
          <label class="form__label">Email Address</label>
        </div>
        <div class="form__group">
          <input type="password" class="form__input password-input" placeholder=" " required>
          <label class="form__label">Password</label>
          <button type="button" class="form__toggle password-toggle">${createIcon('eye', 20)}</button>
        </div>
        <button type="submit" class="btn btn--primary btn--full btn--3d">Sign In</button>
      </form>`;
  }
  return `
    <h2 class="auth-title">Create Account</h2>
    <p class="auth-subtitle">Join thousands of learners worldwide</p>
    <form class="form" onsubmit="return false;">
      <div class="form__group">
        <input type="text" class="form__input" placeholder=" " required>
        <label class="form__label">Full Name</label>
      </div>
      <div class="form__group">
        <input type="email" class="form__input" placeholder=" " required>
        <label class="form__label">Email Address</label>
      </div>
      <div class="form__group">
        <input type="tel" class="form__input" placeholder=" " required>
        <label class="form__label">Phone Number</label>
      </div>
      <div class="form__group">
        <input type="password" class="form__input password-input" placeholder=" " required>
        <label class="form__label">Password</label>
        <button type="button" class="form__toggle password-toggle">${createIcon('eye', 20)}</button>
      </div>
      <button type="submit" class="btn btn--primary btn--full btn--3d">Create Account</button>
    </form>`;
}

function setupPasswordToggle() {
  const passwordToggle = document.querySelector('.password-toggle');
  const passwordInput = document.querySelector('.password-input');
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const next = !showPassword;
      setShowPassword(next);
      passwordInput.type = next ? 'text' : 'password';
      passwordToggle.innerHTML = next ? createIcon('eyeOff', 20) : createIcon('eye', 20);
    });
  }
}

