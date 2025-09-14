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
    document.getElementById('pageTitle').textContent = ${subjectData.name} Chapters;
    
    // Generate chapter cards
    const chaptersGrid = document.getElementById('chaptersGrid');
    chaptersGrid.innerHTML = '';
    
    subjectData.chapters.forEach((chapter, index) => {
        const chapterCard = createChapterCard(chapter, subject, index);
        chaptersGrid.appendChild(chapterCard);
    });
}

function createChapterCard(chapter, subject, index) {
    const card = document.createElement('a');
    card.className = 'chapter-card';
    card.href = quiz.html?subject=${subject}&chapter=${chapter.name.toLowerCase()};
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
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
                // Navigate to quiz page
                window.location.href = this.href;
            }, 150);
        });
        
        // Add hover sound effect (optional)
        card.addEventListener('mouseenter', function() {
            // You can add a subtle sound effect here if desired
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