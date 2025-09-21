// Subjects Page JavaScript with Fade+Rise Animations

document.addEventListener('DOMContentLoaded', async function () {
    // Require login for subjects page redirect target as well
    const allowed = await ensureLoggedIn();
    if (!allowed) {
        window.location.href = 'auth.html';
        return;
    }
    fetchAndRenderSubjects();

    // The animation will be re-triggered after fetching
});

async function ensureLoggedIn() {
    try {
        const res = await fetch('api/routes/auth.php?action=check_session', { credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        return res.ok && data && data.logged_in === true;
    } catch (_) {
        return false;
    }
}

async function fetchAndRenderSubjects() {
    const grid = document.querySelector('.subjects-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Start fresh

    const createAiCard = () => {
        const aiCard = document.createElement('a');
        aiCard.className = 'subject-card subject-card--ai';
        aiCard.href = 'AiGenerate/index.html';
        aiCard.innerHTML = `
            <div class="subject-card__inner">
                <div class="subject-card__icon">🧠</div>
                <h3 class="subject-card__title">AI Generate Quiz</h3>
                <p class="subject-card__description">Create a custom quiz on any topic using the power of AI.</p>
                <span class="btn btn--primary btn--full btn--3d">Generate Now</span>
            </div>
        `;
        return aiCard;
    };

    try {
        const res = await fetch('api/routes/subjects.php');
        const subjects = await res.json();

        if (Array.isArray(subjects)) {
            subjects.forEach((subject) => {
                const card = document.createElement('a');
                card.className = 'subject-card';
                card.href = `chapters.html?subject_id=${encodeURIComponent(subject.id)}`;
                card.innerHTML = `
                    <div class="subject-card__inner">
                        <div class="subject-card__icon" style="color: var(--primary)">📚</div>
                        <h3 class="subject-card__title">${subject.name}</h3>
                        <p class="subject-card__description">${subject.description || ''}</p>
                        <span class="btn btn--primary btn--full btn--3d">Start Learning</span>
                    </div>
                `;
                grid.appendChild(card);
            });
        }
    } catch (e) {
        const errorCard = document.createElement('div');
        errorCard.className = 'subject-card';
        errorCard.innerHTML = '<div class="subject-card__inner"><p>Failed to load other subjects.</p></div>';
        grid.appendChild(errorCard);
    } finally {
        // Add the AI card at the end, regardless of success or failure
        grid.appendChild(createAiCard());

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            animateSubjectCards();
        } else {
            showFinalState();
        }
    }
}

function animateSubjectCards() {
    const subjectCards = document.querySelectorAll('.subject-card');
    subjectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 100)); // Stagger the animation
    });
}

function showFinalState() {
    // For users who prefer reduced motion, just show the final state immediately
    const subjectCards = document.querySelectorAll('.subject-card');
    subjectCards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });
}