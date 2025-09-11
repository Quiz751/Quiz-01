// Subjects Page JavaScript with Fade+Rise Animations
document.addEventListener('DOMContentLoaded', function() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        // Animate subject cards with fade+rise effect
        animateSubjectCards();
        
        // Animate progress bars
        animateSubjectProgressBars();
    } else {
        // If reduced motion is preferred, just show final state
        showFinalState();
    }
});

function animateSubjectCards() {
    const subjectCards = document.querySelectorAll('.subject-card');
    
    subjectCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });
}

function animateSubjectProgressBars() {
    const progressBars = document.querySelectorAll('.subject-progress');
    
    progressBars.forEach((bar, index) => {
        const finalWidth = bar.style.width || bar.getAttribute('data-width') || '75%';
        const numericWidth = parseInt(finalWidth);
        
        bar.style.width = '0%';
        
        setTimeout(() => {
            animateProgressBar(bar, 0, numericWidth, 1200);
        }, 800 + (index * 150));
    });
}

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

function showFinalState() {
    // For users who prefer reduced motion, just show the final state immediately
    const subjectCards = document.querySelectorAll('.subject-card');
    const progressBars = document.querySelectorAll('.subject-progress');
    
    subjectCards.forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });
    
    progressBars.forEach(bar => {
        const finalWidth = bar.getAttribute('data-width') || '75%';
        bar.style.width = finalWidth;
    });
}