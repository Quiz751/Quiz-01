// Dashboard Page JavaScript with Animations
document.addEventListener('DOMContentLoaded', function() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        // Animate stat values with count-up effect
        animateStatValues();
        
        // Animate progress bars
        animateProgressBars();
        
        // Animate XP ring
        animateXPRing();
    } else {
        // If reduced motion is preferred, just show final values
        showFinalValues();
    }
});

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

function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar__fill');
    
    progressBars.forEach((bar, index) => {
        const finalWidth = bar.style.width || '60%';
        const numericWidth = parseInt(finalWidth);
        
        bar.style.width = '0%';
        
        setTimeout(() => {
            animateProgressBar(bar, 0, numericWidth, 1200);
        }, 800 + (index * 200));
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

function animateXPRing() {
    const xpProgress = document.querySelector('.xp-progress');
    const xpPercentage = document.querySelector('.xp-ring__percentage');
    
    if (xpProgress && xpPercentage) {
        const finalPercentage = 70; // 70% as shown in the HTML
        const circumference = 283; // 2 * π * 45 (radius)
        const finalOffset = circumference - (finalPercentage / 100) * circumference;
        
        // Start with full offset (0% progress)
        xpProgress.style.strokeDashoffset = circumference;
        xpPercentage.textContent = '0%';
        
        setTimeout(() => {
            animateXPCircle(xpProgress, xpPercentage, circumference, finalOffset, finalPercentage, 2000);
        }, 1000);
    }
}

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

function showFinalValues() {
    // For users who prefer reduced motion, just show the final values immediately
    const statValues = document.querySelectorAll('.stat-card__value');
    const progressBars = document.querySelectorAll('.progress-bar__fill');
    const xpProgress = document.querySelector('.xp-progress');
    const xpPercentage = document.querySelector('.xp-ring__percentage');
    
    // Show final stat values
    statValues.forEach(element => {
        // Values are already correct in HTML, no need to change
    });
    
    // Show final progress bar widths
    progressBars.forEach(bar => {
        if (!bar.style.width) {
            bar.style.width = '60%';
        }
    });
    
    // Show final XP ring
    if (xpProgress && xpPercentage) {
        const circumference = 283;
        const finalPercentage = 70;
        const finalOffset = circumference - (finalPercentage / 100) * circumference;
        xpProgress.style.strokeDashoffset = finalOffset;
        xpPercentage.textContent = '70%';
    }
}