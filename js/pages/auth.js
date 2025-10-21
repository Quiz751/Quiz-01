// Simplified Auth Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    setupAuthTabs();
    setupPasswordToggle();
    setupAuthSubmitHandlers();
    setupForgotPassword();
});

function setupForgotPassword() {
    const forgotPasswordLink = document.querySelector('.form__forgot');

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showEmailPrompt();
        });
    }
}

function showEmailPrompt() {
    const modalContent = `
        <div class="modal-content">
            <h2>Forgot Password</h2>
            <p>Please enter your email address to reset your password.</p>
            <div class="form__group">
                <div class="form__input-wrapper">
                    <input type="email" id="email-for-reset" class="form__input" placeholder=" " required>
                    <label class="form__label">Email Address</label>
                </div>
            </div>
            <div class="modal-buttons">
                <button id="submitEmailBtn" class="btn btn--primary">Next</button>
                <button id="cancelBtn" class="btn btn--secondary">Cancel</button>
            </div>
        </div>
    `;

    showModal(modalContent, (modal) => {
        modal.querySelector('#submitEmailBtn').addEventListener('click', async () => {
            const email = modal.querySelector('#email-for-reset').value;
            if (!email) {
                alert('Please enter an email.');
                return;
            }

            // Check if email exists
            const res = await fetch(`api/routes/auth.php?action=check_email&email=${encodeURIComponent(email)}`);
            const data = await res.json();

            if (data.exists) {
                showPasswordPrompt(email);
            } else {
                alert('No account found with that email address.');
            }
        });
    });
}

function showPasswordPrompt(email) {
    const modalContent = `
        <div class="modal-content">
            <h2>Reset Password</h2>
            <p>Enter your new password for ${email}.</p>
            <div class="form__group">
                <div class="form__input-wrapper">
                    <input type="password" id="new-password" class="form__input" placeholder=" " required>
                    <label class="form__label">New Password</label>
                </div>
            </div>
            <div class="modal-buttons">
                <button id="submitPasswordBtn" class="btn btn--primary">Reset Password</button>
                <button id="cancelBtn" class="btn btn--secondary">Cancel</button>
            </div>
        </div>
    `;

    showModal(modalContent, (modal) => {
        modal.querySelector('#submitPasswordBtn').addEventListener('click', async () => {
            const password = modal.querySelector('#new-password').value;
            if (!password) {
                alert('Please enter a new password.');
                return;
            }

            const res = await fetch('api/routes/auth.php?action=reset_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                alert('Password reset successfully!');
                removeModal();
            } else {
                alert('Failed to reset password.');
            }
        });
    });
}

function showModal(content, callback) {
    removeModal(); // Remove any existing modals

    const modalHtml = `
        <div class="confirmation-modal-overlay">
            <div class="confirmation-modal">
                ${content}
            </div>
        </div>
    `;

    const body = document.querySelector('body');
    body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.querySelector('.confirmation-modal-overlay');

    modal.querySelector('#cancelBtn').addEventListener('click', () => {
        removeModal();
    });

    if (callback) {
        callback(modal);
    }
}

function removeModal() {
    const modal = document.querySelector('.confirmation-modal-overlay');
    if (modal) {
        modal.remove();
    }
}


function setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('auth-tab--active'));
            
            // Add active class to clicked tab
            tab.classList.add('auth-tab--active');
            
            // Show/hide forms
            if (tabType === 'login') {
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                signupForm.classList.remove('hidden');
            }
        });
    });
}

function setupPasswordToggle() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    const passwordInputs = document.querySelectorAll('.password-input');
    
    passwordToggles.forEach((toggle, index) => {
        const input = passwordInputs[index];
        
        if (toggle && input) {
            toggle.addEventListener('click', () => {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                
                // Update icon
                toggle.innerHTML = isPassword ? 
                    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68"/>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5.39-1.61"/>
                        <line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>` :
                    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>`;
            });
        }
    });
}

function setupAuthSubmitHandlers() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.addEventListener('click', async () => {
                const inputs = loginForm.querySelectorAll('input');
                const email = (inputs[0] && inputs[0].value.trim()) || '';
                const password = (inputs[1] && inputs[1].value) || '';
                if (!email || !password) return;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Signing In...';
                try {
                    const res = await fetch('api/routes/auth.php?action=login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ email, password })
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || data.error) {
                        alert(data.error || 'Login failed');
                    } else {
                        window.location.href = 'subjects.html';
                    }
                } catch (e) {
                    alert('Network error. Please try again.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign In';
                }
            });
        }
    }

    if (signupForm) {
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.addEventListener('click', async () => {
                const inputs = signupForm.querySelectorAll('input');
                const username = (inputs[0] && inputs[0].value.trim()) || '';
                const email = (inputs[1] && inputs[1].value.trim()) || '';
                const password = (inputs[2] && inputs[2].value) || '';
                if (!username || !email || !password) return;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating...';
                try {
                    const res = await fetch('api/routes/auth.php?action=register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ username, email, password })
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || data.error) {
                        alert(data.error || 'Registration failed');
                    } else {
                        // Auto-login after signup
                        const loginRes = await fetch('api/routes/auth.php?action=login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ email, password })
                        });
                        if (loginRes.ok) {
                            window.location.href = 'subjects.html';
                        } else {
                            window.location.href = 'auth.html';
                        }
                    }
                } catch (e) {
                    alert('Network error. Please try again.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Create Account';
                }
            });
        }
    }
}