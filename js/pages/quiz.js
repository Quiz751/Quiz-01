// Quiz Page JavaScript
class QuizManager {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.startTime = null;
        this.endTime = null;
        this.timerInterval = null;
        this.timeLimit = 15 * 60; // 15 minutes in seconds
        this.timeRemaining = this.timeLimit;
        this.subjectId = null; // To store the context
        this.currentReviewQuestionIndex = 0;

        this.initializeQuiz();
    }

    async initializeQuiz() {
        const allowed = await this.ensureLoggedIn();
        if (!allowed) {
            window.location.href = 'auth.html';
            return;
        }
        await this.loadQuestions();
        this.setupEventListeners();
        this.animateQuizContainer();
        // Hide timer and question counter UI per requirements
        const quizInfo = document.querySelector('.quiz-info');
        if (quizInfo) {
            quizInfo.style.display = 'none';
        }
    }

    async ensureLoggedIn() {
        try {
            const res = await fetch('api/routes/auth.php?action=check_session', { credentials: 'include' });
            const data = await res.json().catch(() => ({}));
            return res.ok && data && data.logged_in === true;
        } catch (_) {
            return false;
        }
    }

    async loadQuestions() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const chapterId = urlParams.get('chapter_id');
        this.subjectId = urlParams.get('subject_id'); // Get subject_id if available (for complete mode)


        if (mode === 'ai') {
            const storedQuizData = sessionStorage.getItem('quizai_generated_quiz');
            if (storedQuizData) {
                sessionStorage.removeItem('quizai_generated_quiz'); // Clean up immediately to prevent reuse
                try {
                    const data = JSON.parse(storedQuizData);
                    const quizTitle = document.getElementById('quizTitle');
                    if (quizTitle) {
                        quizTitle.textContent = data.title || 'AI Generated Quiz';
                    }

                    const normalized = (Array.isArray(data.questions) ? data.questions : []).map(q => ({
                        id: q.id,
                        question: q.question_text,
                        options: [q.option_a, q.option_b, q.option_c, q.option_d],
                        correct: this.mapCorrectOptionToIndex(q.correct_option),
                        explanation: q.explanation || ''
                    }));
                    this.questions = normalized;
                    this.userAnswers = new Array(this.questions.length).fill(null);
                    this.updateResultPageLinks();
                    return; // Exit the function to prevent API call
                } catch (e) {
                    console.error("Failed to parse AI quiz data from sessionStorage", e);
                }
            }
            // If AI mode is set but no data is found, show an error.
            const quizContainer = document.querySelector('.quiz-container');
            if (quizContainer) {
                quizContainer.innerHTML = '<h1>Error</h1><p>Could not load the AI-generated quiz. Please go back and try again.</p><a href="ai/index.html" class="btn btn--primary">Go Back</a>';
            }
            return;
        }

        let endpoint = '';
        if (mode === 'complete') {
            endpoint = `api/routes/quizzes.php?action=get_complete_quiz&subject_id=${encodeURIComponent(this.subjectId)}`;
        } else if (chapterId) {
            endpoint = `api/routes/quizzes.php?action=get_quiz&chapter_id=${encodeURIComponent(chapterId)}`;
        }

        if (!endpoint) {
            this.questions = [];
            this.userAnswers = [];
            return;
        }

        try {
            const res = await fetch(endpoint);
            const data = await res.json();

            const quizTitle = document.getElementById('quizTitle');
            if (quizTitle) {
                quizTitle.textContent = data.title || 'Quiz';
            }
            if (data.subject_id) { // Store subject_id from the API response
                this.subjectId = data.subject_id;
            }

            const normalized = (Array.isArray(data.questions) ? data.questions : []).map(q => ({
                id: q.id,
                question: q.question_text,
                options: [q.option_a, q.option_b, q.option_c, q.option_d],
                correct: this.mapCorrectOptionToIndex(q.correct_option),
                explanation: q.explanation || ''
            }));
            this.questions = normalized;
        } catch (e) {
            this.questions = [];
        }

        this.userAnswers = new Array(this.questions.length).fill(null);
        this.updateResultPageLinks();
    }

    updateResultPageLinks() {
        const chaptersBtn = document.getElementById('goToChaptersBtn');
        if (!chaptersBtn) return;

        if (this.subjectId) {
            chaptersBtn.href = `chapters.html?subject_id=${this.subjectId}`;
        } else {
            // Fallback for AI quizzes or other cases without a subject context
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('mode') === 'ai') {
                chaptersBtn.href = 'subjects.html'; // Go to all subjects instead
                // Update button text, keeping the SVG icon
                const textNode = Array.from(chaptersBtn.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                if (textNode) textNode.textContent = ' All Subjects';
            }
        }
    }

    mapCorrectOptionToIndex(correctOption) {
        switch (correctOption) {
            case 'option_a': return 0;
            case 'option_b': return 1;
            case 'option_c': return 2;
            case 'option_d': return 3;
            default: return null;
        }
    }

    setupEventListeners() {
        // Start quiz button
        const startBtn = document.getElementById('startQuizBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startQuiz());
        }

        // Navigation buttons
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const submitBtn = document.getElementById('submitQuizBtn');

        if (prevBtn) prevBtn.addEventListener('click', () => this.previousQuestion());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitQuiz());

        // Result page buttons
        const retakeBtn = document.getElementById('retakeQuizBtn');
        if (retakeBtn) {
            retakeBtn.addEventListener('click', () => this.retakeQuiz());
        }
        const reviewQuizBtn = document.getElementById('reviewQuizBtn');
        if (reviewQuizBtn) {
            reviewQuizBtn.addEventListener('click', () => this.reviewQuiz());
        }
    }

    animateQuizContainer() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const quizContainer = document.querySelector('.quiz-container');

        if (!prefersReducedMotion && quizContainer) {
            quizContainer.style.opacity = '0';
            quizContainer.style.transform = 'scale(0.95) translateY(20px)';

            setTimeout(() => {
                quizContainer.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                quizContainer.style.opacity = '1';
                quizContainer.style.transform = 'scale(1) translateY(0)';
            }, 100);
        } else if (quizContainer) {
            quizContainer.style.opacity = '1';
            quizContainer.style.transform = 'scale(1) translateY(0)';
        }
    }

    startQuiz() {
        this.startTime = new Date();
        this.timeRemaining = this.timeLimit;

        // Update quiz stats based on number of questions
        this.updateQuizStats();

        // Smooth transition from start screen to question screen
        this.transitionToQuestionScreen();

        // Timer disabled per requirements (hidden and not used)

        // Load first question
        this.loadQuestion(0);

        // Update progress
        this.updateProgress();
    }

    transitionToQuestionScreen() {
        const startScreen = document.getElementById('quizStartScreen');
        const questionScreen = document.getElementById('quizQuestionScreen');

        // Fade out start screen
        startScreen.style.transition = 'all 0.4s ease-out';
        startScreen.style.opacity = '0';
        startScreen.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            startScreen.style.display = 'none';
            questionScreen.style.display = 'block';
            questionScreen.style.opacity = '0';
            questionScreen.style.transform = 'translateY(30px)';

            // Fade in question screen
            setTimeout(() => {
                questionScreen.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                questionScreen.style.opacity = '1';
                questionScreen.style.transform = 'translateY(0)';
            }, 100);
        }, 400);
    }

    updateQuizStats() {
        const totalQuestions = this.questions.length;
        const quizStatsContainer = document.querySelector('.quiz-stats');
        if (quizStatsContainer) {
            quizStatsContainer.innerHTML = `
                <div class="quiz-stat">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                    </svg>
                    <span>15 minutes</span>
                </div>
                <div class="quiz-stat">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                    </svg>
                    <span>${totalQuestions} questions</span>
                </div>
            `;
        }

        // Update instructions
        const instructionsList = document.querySelector('.quiz-instructions ul');
        if (instructionsList) {
            instructionsList.innerHTML = `
                <li>You have 15 minutes to complete ${totalQuestions} questions</li>
                <li>Each question is worth ${totalQuestions > 0 ? Math.round(100 / totalQuestions) : 0} points</li>
                <li>You can review and change answers before submitting</li>
            `;
        }
    }

    loadQuestion(index) {
        if (index < 0 || index >= this.questions.length) return;

        this.currentQuestionIndex = index;
        const question = this.questions[index];

        // Animate question transition
        this.animateQuestionTransition(() => {
            // Update question text
            const questionTextEl = document.getElementById('questionText');
            if (questionTextEl) {
                questionTextEl.textContent = `${index + 1}. ${question.question}`;
            }

            // Generate options
            this.generateOptions(question);

            // Update navigation buttons
            this.updateNavigationButtons();

            // Update progress
            this.updateProgress();
        });
    }

    animateQuestionTransition(callback) {
        const questionCard = document.querySelector('.question-card');
        const optionsContainer = document.getElementById('questionOptions');

        // Fade out current question
        questionCard.style.transition = 'all 0.3s ease-out';
        questionCard.style.opacity = '0.6';
        questionCard.style.transform = 'translateX(-15px)';

        setTimeout(() => {
            // Execute callback (update content)
            callback();

            // Fade in new question
            questionCard.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            questionCard.style.opacity = '1';
            questionCard.style.transform = 'translateX(0)';

            // Animate options entrance
            const options = optionsContainer.querySelectorAll('.option-item');
            options.forEach((option, index) => {
                option.style.opacity = '0';
                option.style.transform = 'translateY(25px)';

                setTimeout(() => {
                    option.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    option.style.opacity = '1';
                    option.style.transform = 'translateY(0)';
                }, index * 120);
            });
        }, 300);
    }

    generateOptions(question) {
        const optionsContainer = document.getElementById('questionOptions');
        optionsContainer.innerHTML = '';

        // Ensure exactly 4 options are rendered
        const fourOptions = (question.options || []).slice(0, 4);
        fourOptions.forEach((option, index) => {
            const optionElement = document.createElement('button');
            optionElement.className = 'option-item';
            optionElement.innerHTML = `
                <span class="option-label">${String.fromCharCode(65 + index)}.</span>
                ${option}
            `;

            // Check if this option was previously selected
            if (this.userAnswers[this.currentQuestionIndex] === index) {
                optionElement.classList.add('selected');
            }

            optionElement.addEventListener('click', () => this.selectOption(index));
            optionsContainer.appendChild(optionElement);
        });
    }

    selectOption(optionIndex) {
        // Remove previous selection with animation
        const options = document.querySelectorAll('.option-item');
        options.forEach(option => {
            option.classList.remove('selected');
            option.style.transform = 'translateY(-3px) scale(1)';
        });

        // Add selection to clicked option with enhanced animation
        const selectedOption = options[optionIndex];
        selectedOption.classList.add('selected');
        selectedOption.style.transform = 'translateY(-3px) scale(1.02)';

        // Add ripple effect
        this.addRippleEffect(selectedOption);

        // Save answer
        this.userAnswers[this.currentQuestionIndex] = optionIndex;

        // Enable next button
        document.getElementById('nextQuestionBtn').disabled = false;
    }

    addRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.marginLeft = '-10px';
        ripple.style.marginTop = '-10px';
        ripple.style.pointerEvents = 'none';

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        const submitBtn = document.getElementById('submitQuizBtn');

        // Previous button
        prevBtn.disabled = this.currentQuestionIndex === 0;

        // Next/Submit button
        if (this.currentQuestionIndex === this.questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }

        // Enable next if current question is answered
        nextBtn.disabled = this.userAnswers[this.currentQuestionIndex] === null;
    }

    updateProgress() {
        // Progress bar removed per requirements
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.loadQuestion(this.currentQuestionIndex - 1);
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.loadQuestion(this.currentQuestionIndex + 1);
        }
    }

    submitQuiz() {
        this.showConfirmationModal('Are you sure you want to submit the quiz? You cannot change your answers after submission.', () => {
            clearInterval(this.timerInterval);
            this.endTime = new Date();
            const results = this.calculateResults();
            const urlParams = new URLSearchParams(window.location.search);
            const chapterId = urlParams.get('chapter_id');
            const mode = urlParams.get('mode');

            // For AI quizzes, don't submit to the backend. Just show results.
            if (mode === 'ai') {
                this.showResults();
                return;
            }

            // Default chapterId for complete subject mode: 0
            const payload = {
                chapter_id: chapterId ? parseInt(chapterId, 10) : 0,
                score: results.score
            };
            fetch('api/routes/quizzes.php?action=submit_quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            }).then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    // Still show results, but optionally alert the error
                    if (data && data.error) {
                        console.warn('Quiz submit error:', data.error);
                    }
                }
                this.showResults();
                // Broadcast updated stats across tabs/pages via localStorage to force reactive updates
                try {
                    const payload = {
                        type: 'stats_update',
                        at: Date.now(),
                        xp_delta: data && typeof data.xp_delta === 'number' ? data.xp_delta : 0,
                        stats: data && data.stats ? data.stats : null
                    };
                    localStorage.setItem('quizai:lastStatsUpdate', JSON.stringify(payload));
                } catch (_) { }
            }).catch(() => {
                this.showResults();
            });
        });
    }

    showResults() {
        // Smooth transition from question screen to result screen
        this.transitionToResultScreen();

        // Calculate results
        const results = this.calculateResults();
        this.displayResults(results);
    }

    transitionToResultScreen() {
        const questionScreen = document.getElementById('quizQuestionScreen');
        const resultScreen = document.getElementById('quizResultScreen');

        // Fade out question screen
        questionScreen.style.opacity = '0';
        questionScreen.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            questionScreen.style.display = 'none';
            resultScreen.style.display = 'block';
            resultScreen.style.opacity = '0';
            resultScreen.style.transform = 'translateY(20px)';

            // Fade in result screen
            setTimeout(() => {
                resultScreen.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                resultScreen.style.opacity = '1';
                resultScreen.style.transform = 'translateY(0)';
            }, 50);
        }, 300);
    }

    calculateResults() {
        let correctAnswers = 0;
        const totalQuestions = this.questions.length;

        this.userAnswers.forEach((answer, index) => {
            if (answer === this.questions[index].correct) {
                correctAnswers++;
            }
        });

        const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        const timeTaken = this.endTime ? Math.floor((this.endTime - this.startTime) / 1000) : 0;

        return {
            correct: correctAnswers,
            total: totalQuestions,
            score: Math.round(score),
            percentage: Math.round(score),
            timeTaken: this.formatTime(timeTaken)
        };
    }

    displayResults(results) {
        // Update result elements with animation
        this.animateStatValue('finalScore', results.score);
        document.getElementById('correctAnswers').textContent = `${results.correct}/${results.total}`;
        this.animateStatValue('percentage', `${results.percentage}%`);

        // Hide XP delta for AI quizzes as they are not saved to the backend
        const xpDeltaEl = document.getElementById('xpDelta');
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'ai') {
            if (xpDeltaEl) xpDeltaEl.style.display = 'none';
        } else if (xpDeltaEl) {
            try {
                const raw = localStorage.getItem('quizai:lastStatsUpdate');
                const parsed = raw ? JSON.parse(raw) : null;
                const xpDelta = parsed && typeof parsed.xp_delta === 'number' ? parsed.xp_delta : null;
                if (xpDelta != null) {
                    xpDeltaEl.textContent = (xpDelta >= 0 ? `+${xpDelta}` : `${xpDelta}`) + ' XP';
                    xpDeltaEl.className = 'xp-delta ' + (xpDelta >= 0 ? 'good' : 'bad');
                }
            } catch (_) { }
        }

        // Update result title based on performance
        const resultTitle = document.getElementById('resultTitle');
        const resultSubtitle = document.getElementById('resultSubtitle');
        const resultIcon = document.querySelector('.result-icon svg');

        if (results.percentage >= 90) {
            resultTitle.textContent = 'Excellent Work!';
            resultSubtitle.textContent = 'Outstanding performance! You\'re a quiz master!';
            resultIcon.style.color = 'var(--success)';
        } else if (results.percentage >= 80) {
            resultTitle.textContent = 'Great Job!';
            resultSubtitle.textContent = 'Well done! You have a solid understanding.';
            resultIcon.style.color = 'var(--success)';
        } else if (results.percentage >= 70) {
            resultTitle.textContent = 'Good Effort!';
            resultSubtitle.textContent = 'Not bad! Keep practicing to improve.';
            resultIcon.style.color = 'var(--warning)';
        } else if (results.percentage >= 60) {
            resultTitle.textContent = 'Keep Learning!';
            resultSubtitle.textContent = 'You\'re on the right track. Study more and try again.';
            resultIcon.style.color = 'var(--warning)';
        } else {
            resultTitle.textContent = 'Try Again!';
            resultSubtitle.textContent = 'Don\'t give up! Review the material and retake the quiz.';
            resultIcon.style.color = 'var(--danger)';
        }
    }

    animateStatValue(elementId, finalValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        const isPercentage = typeof finalValue === 'string' && finalValue.includes('%');
        const numericValue = isPercentage ? parseInt(finalValue) : finalValue;

        let currentValue = 0;
        const increment = numericValue / 50;
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= numericValue) {
                currentValue = numericValue;
                clearInterval(timer);
            }

            if (isPercentage) {
                element.textContent = Math.round(currentValue) + '%';
            } else {
                element.textContent = Math.round(currentValue);
            }
        }, 30);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    retakeQuiz() {
        // For AI quizzes, retaking should lead back to the generation page
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'ai') {
            window.location.href = 'ai/index.html';
            return;
        }

        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.questions.length).fill(null);
        this.timeRemaining = this.timeLimit;
        this.startTime = null;
        this.endTime = null;

        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Smooth transition back to start screen
        this.transitionToStartScreen();

        // Reset timer display
        const timerElement = document.getElementById('quizTimer');
        if (timerElement) {
            timerElement.textContent = '15:00';
            timerElement.style.color = 'var(--primary)';
        }
    }

    transitionToStartScreen() {
        const resultScreen = document.getElementById('quizResultScreen');
        const startScreen = document.getElementById('quizStartScreen');

        // Fade out result screen
        resultScreen.style.opacity = '0';
        resultScreen.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            resultScreen.style.display = 'none';
            startScreen.style.display = 'block';
            startScreen.style.opacity = '0';
            startScreen.style.transform = 'translateY(20px)';

            // Fade in start screen
            setTimeout(() => {
                startScreen.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                startScreen.style.opacity = '1';
                startScreen.style.transform = 'translateY(0)';
            }, 50);
        }, 300);
    }

    showConfirmationModal(message, onConfirm) {
        const modalHtml = `
            <div class="confirmation-modal-overlay">
                <div class="confirmation-modal">
                    <p>${message}</p>
                    <div class="modal-buttons">
                        <button id="confirmBtn" class="btn btn--primary">Confirm</button>
                        <button id="cancelBtn" class="btn btn--secondary">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        const body = document.querySelector('body');
        body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('confirmBtn').addEventListener('click', () => {
            onConfirm();
            this.removeConfirmationModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.removeConfirmationModal();
        });
    }

    removeConfirmationModal() {
        const modal = document.querySelector('.confirmation-modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    reviewQuiz() {
        const resultScreen = document.getElementById('quizResultScreen');
        const reviewScreen = document.getElementById('quizReviewScreen');

        // Hide result screen and show review screen
        resultScreen.style.display = 'none';
        reviewScreen.style.display = 'block';

        // Set up the review screen structure
        reviewScreen.innerHTML = `<div id="reviewQuestionContainer"></div>`;

        this.currentReviewQuestionIndex = 0;
        this.loadReviewQuestion(this.currentReviewQuestionIndex);
    }

    loadReviewQuestion(index) {
        const reviewQuestionContainer = document.getElementById('reviewQuestionContainer');
        const question = this.questions[index];
        const userAnswer = this.userAnswers[index];
        const correctAnswer = question.correct;
        const isCorrect = userAnswer === correctAnswer;

        let reviewHtml = `<div class="review-question">`;
        reviewHtml += `<h4>${index + 1}. ${question.question}</h4>`;
        reviewHtml += `<div class="review-options">`;

        question.options.forEach((option, optionIndex) => {
            let optionClass = '';
            if (optionIndex === correctAnswer) {
                optionClass = 'correct';
            } else if (optionIndex === userAnswer && !isCorrect) {
                optionClass = 'incorrect';
            }

            reviewHtml += `<div class="review-option ${optionClass}"><strong>${String.fromCharCode(65 + optionIndex)}.</strong> ${option}</div>`;
        });

        reviewHtml += `</div>`; // close review-options

        if (question.explanation) {
            reviewHtml += `<div class="review-explanation"><strong>Explanation:</strong> ${question.explanation}</div>`;
        }

        reviewHtml += `</div>`; // close review-question

        // Navigation
        reviewHtml += `<div class="review-navigation">`;
        reviewHtml += `<button id="prevReviewBtn" class="btn btn--secondary" ${index === 0 ? 'disabled' : ''}>Previous</button>`;

        if (index === this.questions.length - 1) {
            reviewHtml += `<button id="finishReviewBtn" class="btn btn--primary">Result</button>`;
        } else {
            reviewHtml += `<button id="nextReviewBtn" class="btn btn--primary">Next</button>`;
        }

        reviewHtml += `</div>`;

        reviewQuestionContainer.innerHTML = reviewHtml;

        // Add event listeners for navigation
        if (index > 0) {
            document.getElementById('prevReviewBtn').addEventListener('click', () => {
                this.loadReviewQuestion(index - 1);
            });
        }

        if (index < this.questions.length - 1) {
            document.getElementById('nextReviewBtn').addEventListener('click', () => {
                this.loadReviewQuestion(index + 1);
            });
        } else {
            document.getElementById('finishReviewBtn').addEventListener('click', () => {
                document.getElementById('quizReviewScreen').style.display = 'none';
                document.getElementById('quizResultScreen').style.display = 'block';
            });
        }
    }


}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', function () {
    new QuizManager();
});