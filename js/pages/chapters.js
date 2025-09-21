// Chapters Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const subjectId = urlParams.get('subject_id');

    showLoadingState();

    if (!subjectId) {
        showErrorState('Missing subject. Please go back and select a subject.');
        return;
    }

    loadChapters(subjectId);

    // Handle browser back button
    window.addEventListener('popstate', function () {
        window.location.reload();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            window.location.href = 'subjects.html';
        }
    });
});

async function loadChapters(subjectId) {
    try {
        const res = await fetch(`api/routes/chapters.php?subject_id=${encodeURIComponent(subjectId)}`);
        if (!res.ok) throw new Error('Failed to load chapters');
        const data = await res.json();
        console.log(data);

        if (!data || !Array.isArray(data.chapters) || data.chapters.length === 0) {
            showErrorState('No chapters found for this subject.');
            return;
        }

        // Update page title and breadcrumb
        document.getElementById('subjectName').textContent = data.subject_name;
        document.getElementById('pageTitle').textContent = `${data.subject_name} Chapters`;

        const chaptersGrid = document.getElementById('chaptersGrid');
        chaptersGrid.innerHTML = '';

        // Add the Complete Subject Quiz card first (linking to complete mode)
        const completeSubjectCard = document.createElement('a');
        completeSubjectCard.className = 'chapter-card complete-subject-card';
        completeSubjectCard.href = `quiz.html?subject_id=${encodeURIComponent(subjectId)}&mode=complete`;
        completeSubjectCard.setAttribute('data-chapter', 'complete');
        completeSubjectCard.innerHTML = `
            <div class="chapter-card__content">
                <h3 class="chapter-card__title">Complete Subject Quiz</h3>
                <p class="chapter-card__description">Test knowledge across all chapters</p>
            </div>
        `;
        chaptersGrid.appendChild(completeSubjectCard);

        data.chapters.forEach((chapter) => {
            const card = document.createElement('a');
            card.className = 'chapter-card';
            // Pass both chapter_id and subject_id to the quiz page
            card.href = `quiz.html?chapter_id=${encodeURIComponent(chapter.id)}&subject_id=${encodeURIComponent(subjectId)}`;
            card.setAttribute('data-chapter', String(chapter.id));
            card.innerHTML = `
                <div class="chapter-card__content">
                    <h3 class="chapter-card__title">${chapter.title}</h3>
                    <p class="chapter-card__description">Chapter ${chapter.order_index ?? ''}</p>
                </div>
            `;

            // Interactions
            card.addEventListener('click', function (e) {
                e.preventDefault();
                const ripple = document.createElement('div');
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255, 255, 255, 0.6)';
                ripple.style.transform = 'scale(0)';
                ripple.style.animation = 'ripple 0.6s linear';
                ripple.style.left = '50%';
                ripple.style.top = '50%';
                ripple.style.width = '100px';
                ripple.style.height = '100px';
                ripple.style.marginLeft = '-50px';
                ripple.style.marginTop = '-50px';
                ripple.style.pointerEvents = 'none';

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        document.body.style.opacity = '0.8';
                        document.body.style.transform = 'scale(0.98)';
                        document.body.style.transition = 'all 0.3s ease';
                        setTimeout(() => {
                            window.location.href = this.href;
                        }, 200);
                    }, 100);
                }, 150);
            });

            card.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-12px) scale(1.03)';
            });
            card.addEventListener('mouseleave', function () {
                this.style.transform = 'translateY(0) scale(1)';
            });

            chaptersGrid.appendChild(card);
        });
    } catch (err) {
        showErrorState('Failed to load chapters.');
    }
}

function showLoadingState() {
    const chaptersGrid = document.getElementById('chaptersGrid');
    chaptersGrid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
            </div>
            <p>Loading chapters...</p>
        </div>
    `;
}

function showErrorState(message) {
    const chaptersGrid = document.getElementById('chaptersGrid');
    chaptersGrid.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Oops! Something went wrong</h3>
            <p>${message}</p>
            <a href="subjects.html" class="btn btn--primary">Back to Subjects</a>
        </div>
    `;
}