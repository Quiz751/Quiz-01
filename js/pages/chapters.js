// Chapters Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get subject from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject') || 'mathematics';
    
    // Demo data for subjects and their chapters
    const subjectsData = {
        mathematics: {
            name: 'Mathematics',
            chapters: [
                { name: 'Algebra', description: 'Basic algebraic concepts and equations' },
                { name: 'Geometry', description: 'Shapes, angles, and spatial relationships' },
                { name: 'Calculus', description: 'Derivatives, integrals, and limits' }
            ]
        },
        science: {
            name: 'Science',
            chapters: [
                { name: 'Physics', description: 'Motion, forces, and energy' },
                { name: 'Chemistry', description: 'Elements, compounds, and reactions' },
                { name: 'Biology', description: 'Living organisms and life processes' }
            ]
        },
        history: {
            name: 'History',
            chapters: [
                { name: 'Ancient', description: 'Ancient civilizations and early history' },
                { name: 'Medieval', description: 'Middle Ages and medieval period' },
                { name: 'Modern', description: 'Modern history and contemporary events' }
            ]
        }
    };
    
    // Show loading state first
    showLoadingState();
    
    // Load chapters for the selected subject with a slight delay for better UX
    setTimeout(() => {
        loadChapters(subject, subjectsData);
        setupChapterNavigation();
    }, 500);
});

function loadChapters(subject, subjectsData) {
    const subjectData = subjectsData[subject];
    
    if (!subjectData) {
        // Fallback to mathematics if subject not found
        loadChapters('mathematics', subjectsData);
        return;
    }
    
    // Update page title and breadcrumb
    document.getElementById('subjectName').textContent = subjectData.name;
    document.getElementById('pageTitle').textContent = `${subjectData.name} Chapters`;
    
    // Generate chapter cards
    const chaptersGrid = document.getElementById('chaptersGrid');
    chaptersGrid.innerHTML = '';
    
    // Add the Complete Subject Quiz card first
    const completeSubjectCard = createCompleteSubjectCard(subject);
    chaptersGrid.appendChild(completeSubjectCard);
    
    subjectData.chapters.forEach((chapter, index) => {
        const chapterCard = createChapterCard(chapter, subject, index);
        chaptersGrid.appendChild(chapterCard);
    });
}

function createCompleteSubjectCard(subject) {
    const card = document.createElement('a');
    card.className = 'chapter-card complete-subject-card';
    card.href = `quiz.html?subject=${subject}&chapter=complete`;
    card.setAttribute('data-chapter', 'complete');
    
    card.innerHTML = `
        <div class="chapter-card__content">
            <h3 class="chapter-card__title">Complete Subject Quiz</h3>
            <p class="chapter-card__description">Test knowledge across all chapters</p>
        </div>
    `;
    
    return card;
}

function createChapterCard(chapter, subject, index) {
    const card = document.createElement('a');
    card.className = 'chapter-card';
    card.href = `quiz.html?subject=${subject}&chapter=${chapter.name.toLowerCase()}`;
    card.setAttribute('data-chapter', chapter.name.toLowerCase());
    
    card.innerHTML = `
        <div class="chapter-card__content">
            <h3 class="chapter-card__title">${chapter.name}</h3>
            <p class="chapter-card__description">${chapter.description}</p>
        </div>
    `;
    
    return card;
}

function setupChapterNavigation() {
    // Add smooth transition effects
    const chapterCards = document.querySelectorAll('.chapter-card');
    
    chapterCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Enhanced click animation with ripple effect
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
            
            // Scale animation
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    // Navigate to quiz page with smooth transition
                    document.body.style.opacity = '0.8';
                    document.body.style.transform = 'scale(0.98)';
                    document.body.style.transition = 'all 0.3s ease';
                    
                    setTimeout(() => {
                        window.location.href = this.href;
                    }, 200);
                }, 100);
            }, 150);
        });
        
        // Enhanced hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px) scale(1.03)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Handle browser back button
window.addEventListener('popstate', function() {
    // Reload the page to handle back navigation properly
    window.location.reload();
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Go back to subjects page
        window.location.href = 'subjects.html';
    }
});

// Add loading animation
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

// Add error handling
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
