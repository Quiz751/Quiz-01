// Dashboard Page JavaScript with Animations
document.addEventListener('DOMContentLoaded', function() {
    setNeutralDashboard();
    ensureLoggedInThenLoad();
});

function setNeutralDashboard() {
    // Generic welcome text (no dummy name)
    const heading = document.querySelector('.welcome-panel__content h1');
    if (heading) heading.textContent = 'Welcome back!';
    // Avatar initials neutral
    const avatarContainer = document.querySelector('.welcome-panel__avatar .avatar');
    if (avatarContainer) avatarContainer.innerHTML = '<span>U</span>';
    // Zero-out stats to avoid demo numbers
    const stats = document.querySelectorAll('.stats-grid .stat-card__value');
    stats.forEach((el, idx) => {
        if (idx === 3) {
            el.textContent = '#-';
        } else {
            el.textContent = '0';
        }
    });
    // Clear recent activity and show neutral state
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = '<div class="activity-item"><div class="activity-item__info"><h4>No activity yet</h4><p>Take your first quiz</p></div></div>';
    }
	// Reset Daily Challenge progress bar to 0
	const barFill = document.querySelector('.challenge-card .progress-bar__fill');
	if (barFill) {
		barFill.style.width = '0%';
	}
	const progressText = document.querySelector('.challenge-card .progress-text');
	if (progressText) {
		progressText.textContent = '0/5 quizzes';
	}
	// Reset XP ring visuals to 0%
	const xpProgress = document.querySelector('.xp-progress');
	const xpPercentage = document.querySelector('.xp-ring__percentage');
	if (xpProgress && xpPercentage) {
		const circumference = 283;
		xpProgress.style.strokeDashoffset = circumference;
		xpPercentage.textContent = '0%';
	}
}

async function ensureLoggedInThenLoad() {
        const res = await fetch('../../../api/routes/auth.php?action=check_session', { credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data || data.logged_in !== true) {
            window.location.href = 'auth.html';
            return;
        }
    } catch (_) {
        window.location.href = 'auth.html';
        return;
    }
    await loadDashboardUser();
    const profile = await fetchProfile();
    renderDashboard(profile);
    setupContinueButton(profile && Array.isArray(profile.quiz_history) ? profile.quiz_history : []);
    // Listen for cross-page stats updates (XP, progress, level, daily attempts)
    window.addEventListener('storage', async (e) => {
        if (e && e.key === 'quizai:lastStatsUpdate') {
            const updated = await fetchProfile();
            renderDashboard(updated);
        }
    });
}

async function loadDashboardUser() {
    try {
        const res = await fetch('api/routes/profile.php', { credentials: 'include' });
        if (res.status === 401) return; // not logged in; keep placeholders
        const data = await res.json();
        if (!res.ok || data.error) return;
        const user = data.user || {};
        // Update welcome heading
        const heading = document.querySelector('.welcome-panel__content h1');
        if (heading && user.username) {
            heading.textContent = `Welcome back, ${user.username}!`;
        }
        // Update avatar initials or image
        const avatarContainer = document.querySelector('.welcome-panel__avatar .avatar');
        if (avatarContainer) {
            if (user.profile_image) {
                const img = document.createElement('img');
                img.src = 'data:image/png;base64,' + user.profile_image;
                img.alt = 'Avatar';
                img.className = 'avatar-image';
                // Clear initials and insert image
                avatarContainer.innerHTML = '';
                avatarContainer.appendChild(img);
            } else if (user.username) {
                avatarContainer.innerHTML = `<span>${(user.username[0] || 'U').toUpperCase()}</span>`;
            }
        }
    } catch (_) {
        // keep static placeholders on error
    }
}

async function fetchProfile() {
    try {
        const res = await fetch('api/routes/profile.php', { credentials: 'include' });
        if (!res.ok) return null;
        const data = await res.json();
        return data;
    } catch (_) { return null; }
}

function renderDashboard(profile) {
    console.log(profile);
    if (!profile || profile.error) return;

    const stats = profile.stats || {};
    const daily = profile.daily_challenge || { required: 5, attempted: 0 };
    const recent = Array.isArray(profile.recent_activity) ? profile.recent_activity : [];
    const history = Array.isArray(profile.quiz_history) ? profile.quiz_history : [];

    // XP ring and level
    const progressPercent = Math.max(0, Math.min(100, parseInt(stats.progress ?? 0, 10)));
    updateXPRing(progressPercent);
    const levelEl = document.querySelector('.xp-ring__label');
    if (levelEl) levelEl.textContent = `Level ${parseInt(stats.level ?? 1, 10)}`;

    // Your Statistics cards: Streak, XP, Quizzes Completed, Global Rank
    const statEls = document.querySelectorAll('.stats-grid .stat-card__value');
    if (statEls && statEls.length >= 4) {
        safeSetText(statEls[0], String(parseInt(stats.streak ?? 0, 10)));
        safeSetText(statEls[1], String(parseInt(stats.xp ?? 0, 10)));
        const quizzesCompleted = Number.isFinite(profile.stats?.quizzes_completed) ? profile.stats.quizzes_completed : history.length;
        safeSetText(statEls[2], String(quizzesCompleted));
        const rankVal = parseInt(stats.global_rank ?? 0, 10);
        safeSetText(statEls[3], rankVal > 0 ? `#${rankVal}` : '#-');
    }

    // Daily Challenge progress (exactly 5 quizzes)
    const attempted = Math.max(0, Math.min(daily.required || 5, parseInt(daily.attempted ?? 0, 10)));
    const pct = Math.round((attempted / (daily.required || 5)) * 100);
    const barFill = document.querySelector('.challenge-card .progress-bar__fill');
    if (barFill) {
        const currentPct = parseInt(barFill.style.width || '0', 10) || 0;
        animateProgressBar(barFill, currentPct, pct, 800);
    }
    const progressText = document.querySelector('.challenge-card .progress-text');
    if (progressText) progressText.textContent = `${attempted}/${daily.required || 5} quizzes`;

    // Recent Activity: show actual recent actions
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = '';
        const items = recent.length > 0 ? recent : history.slice(0, 10).map(h => ({
            activity_type: 'quiz_submitted',
            meta: JSON.stringify({ chapter_id: h.chapter_id, score: h.score }),
            created_at: h.completed_at
        }));
        if (items.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'activity-item';
            empty.innerHTML = '<div class="activity-item__info"><h4>No activity yet</h4><p>Take your first quiz</p></div>';
            activityList.appendChild(empty);
        } else {
            items.slice(0, 10).forEach(ev => {
                const when = ev.created_at ? new Date(ev.created_at).toLocaleString() : '';
                let title = 'Activity';
                let scoreHtml = '';
                try {
                    const meta = ev.meta ? JSON.parse(ev.meta) : {};
                    if (ev.activity_type === 'quiz_submitted') {
                        title = `Chapter ${meta.chapter_id ?? ''}`.trim();
                        const score = parseInt(meta.score ?? 0, 10);
                        scoreHtml = `<span class="score">${Number.isFinite(score) ? score : 0}%</span>`;
                    } else if (ev.activity_type === 'daily_challenge_completed') {
                        title = 'Daily Challenge Completed';
                        scoreHtml = '<span class="score score--good">+Streak</span>';
                    } else if (ev.activity_type === 'streak_incremented') {
                        title = 'Streak Increased';
                        scoreHtml = '<span class="score score--good">+1</span>';
                    } else if (ev.activity_type === 'streak_reset') {
                        title = 'Streak Reset';
                        scoreHtml = '<span class="score score--average">0</span>';
                    }
                } catch (_) { /* ignore */ }
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.innerHTML = `
                    <div class="activity-item__info">
                        <h4>${title}</h4>
                        <p>${when}</p>
                    </div>
                    <div class="activity-item__score">${scoreHtml}</div>`;
                activityList.appendChild(item);
            });
        }
    }

    // Animate stat values after live data has been rendered
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
        animateStatValues();
    }
}

function updateXPRing(targetPercent) {
    const xpProgress = document.querySelector('.xp-progress');
    const xpPercentage = document.querySelector('.xp-ring__percentage');
    if (!xpProgress || !xpPercentage) return;
    const circumference = 283; // 2 * PI * r (r=45)
    const currentText = xpPercentage.textContent || '0%';
    const currentPercent = Math.max(0, Math.min(100, parseInt(currentText.replace(/[^0-9]/g, '') || '0', 10)));
    const startOffset = circumference - (currentPercent / 100) * circumference;
    const finalOffset = circumference - (targetPercent / 100) * circumference;
    const duration = 1000;
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const easeOut = 1 - Math.pow(1 - t, 3);
        const currentOffset = startOffset + (finalOffset - startOffset) * easeOut;
        const shownPercent = Math.round(currentPercent + (targetPercent - currentPercent) * easeOut);
        xpProgress.style.strokeDashoffset = currentOffset;
        xpPercentage.textContent = `${shownPercent}%`;
        if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

function safeSetText(el, text) {
    if (!el) return;
    el.textContent = text;
}

function setupContinueButton(history) {
    const btn = document.querySelector('.challenge-card .btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        try {
            const res = await fetch('../../../api/routes/auth.php?action=check_session', { credentials: 'include' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data || data.logged_in !== true) {
                window.location.href = 'auth.html';
                return;
            }
        } catch (_) {
            window.location.href = 'auth.html';
            return;
        }
        if (Array.isArray(history) && history.length > 0 && history[0].chapter_id) {
            window.location.href = `quiz.html?chapter_id=${encodeURIComponent(history[0].chapter_id)}`;
        } else {
            window.location.href = 'subjects.html';
        }
    });
}

function animateStatValues() {
    const statValues = document.querySelectorAll('.stat-card__value');
    
    statValues.forEach((element, index) => {
        const finalValue = element.textContent;
        const isNumber = /^\d+/.test(finalValue);
        
        if (isNumber) {
            const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
            const hasComma = finalValue.includes(',');
            const hasHash = finalValue.includes('#');
            
            element.textContent = '0';
            
            setTimeout(() => {
                animateNumber(element, 0, numericValue, 1500, hasComma, hasHash);
            }, 200 + (index * 100));
        }
    });
}

function animateNumber(element, start, end, duration, hasComma = false, hasHash = false) {
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeOut);
        
        let displayValue = current.toString();
        if (hasComma && current >= 1000) {
            displayValue = current.toLocaleString();
        }
        if (hasHash) {
            displayValue = '#' + displayValue;
        }
        
        element.textContent = displayValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Removed generic progress bar animation that used hardcoded widths.

function animateProgressBar(element, start, end, duration) {
    const startTime = performance.now();
    
    function updateProgress(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * easeOut;
        
        element.style.width = current + '%';
        
        if (progress < 1) {
            requestAnimationFrame(updateProgress);
        }
    }
    
    requestAnimationFrame(updateProgress);
}

// Removed hardcoded XP ring animation in favor of live update from profile stats.

function animateXPCircle(element, textElement, circumference, finalOffset, finalPercentage, duration) {
    const startTime = performance.now();
    const startOffset = circumference;
    
    function updateCircle(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentOffset = startOffset - (startOffset - finalOffset) * easeOut;
        const currentPercentage = Math.floor(finalPercentage * easeOut);
        
        element.style.strokeDashoffset = currentOffset;
        textElement.textContent = currentPercentage + '%';
        
        if (progress < 1) {
            requestAnimationFrame(updateCircle);
        }
    }
    
    requestAnimationFrame(updateCircle);
}

// Removed fallback that set dummy values for reduced motion users.