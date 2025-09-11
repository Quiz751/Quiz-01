// Leaderboard Page JavaScript with Animations
document.addEventListener('DOMContentLoaded', function() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        // Animate leaderboard stats
        animateLeaderboardStats();
        
        // Animate podium XP values
        animatePodiumXP();
        
        // Add staggered entrance for podium places
        animatePodiumEntrance();
    } else {
        // If reduced motion is preferred, just show final values
        showFinalValues();
    }
    
    // Setup filter functionality
    setupFilters();
});

function animateLeaderboardStats() {
    const statValues = document.querySelectorAll('.leaderboard-stats .stat-card__value');
    
    statValues.forEach((element, index) => {
        const finalValue = element.textContent;
        const isNumber = /^\d+/.test(finalValue);
        
        if (isNumber) {
            const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
            const hasComma = finalValue.includes(',');
            
            element.textContent = '0';
            
            setTimeout(() => {
                animateNumber(element, 0, numericValue, 1500, hasComma);
            }, 300 + (index * 150));
        }
    });
}

function animatePodiumXP() {
    const podiumXP = document.querySelectorAll('.podium__xp');
    
    podiumXP.forEach((element, index) => {
        const finalValue = element.textContent;
        const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
        
        element.textContent = '0 XP';
        
        setTimeout(() => {
            animateNumber(element, 0, numericValue, 1200, true, false, ' XP');
        }, 800 + (index * 200));
    });
}

function animatePodiumEntrance() {
    const podiumPlaces = document.querySelectorAll('.podium__place');
    
    podiumPlaces.forEach((place, index) => {
        place.style.opacity = '0';
        place.style.transform = 'translateY(50px) scale(0.8)';
        
        setTimeout(() => {
            place.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            place.style.opacity = '1';
            place.style.transform = 'translateY(0) scale(1)';
        }, 500 + (index * 80));
    });
}

function animateNumber(element, start, end, duration, hasComma = false, hasHash = false, suffix = '') {
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
        
        element.textContent = displayValue + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('filter-btn--active'));
            
            // Add active class to clicked button
            button.classList.add('filter-btn--active');
            
            // Add a subtle animation to the button
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

function showFinalValues() {
    // For users who prefer reduced motion, just show the final values immediately
    const statValues = document.querySelectorAll('.leaderboard-stats .stat-card__value');
    const podiumXP = document.querySelectorAll('.podium__xp');
    const podiumPlaces = document.querySelectorAll('.podium__place');
    
    // Show final stat values
    statValues.forEach(element => {
        // Values are already correct in HTML, no need to change
    });
    
    // Show final podium XP values
    podiumXP.forEach(element => {
        // Values are already correct in HTML, no need to change
    });
    
    // Show podium places
    podiumPlaces.forEach(place => {
        place.style.opacity = '1';
        place.style.transform = 'translateY(0) scale(1)';
    });
}