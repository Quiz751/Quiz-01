
document.addEventListener('DOMContentLoaded', function() {
    setupAuthTabs();
    setupPasswordToggle();
    setupAuthSubmitHandlers();
    setupForgotPassword();
});

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
                    const res = await fetch('../../../api/routes/auth.php?action=login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ email, password })
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || data.error) {
                        showAlert('Error', data.error || 'Login failed');
                    } else {
                        window.location.href = 'subjects.html';
                    }
                } catch (e) {
                    showAlert('Error', 'Network error. Please try again.');
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
                    const res = await fetch('../../../api/routes/auth.php?action=register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ username, email, password })
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || data.error) {
                        showAlert('Error', data.error || 'Registration failed');
                    } else {
                        // Auto-login after signup
                        const loginRes = await fetch('../../../api/routes/auth.php?action=login', {
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
                    showAlert('Error', 'Network error. Please try again.');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Create Account';
                }
            });
        }
    }
}
