import { createIcon } from '../utils.js';

export function renderHomePage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="home">
      <div class="floating-orbs">
        <div class="orb orb--1"></div>
        <div class="orb orb--2"></div>
        <div class="orb orb--3"></div>
      </div>
      <section class="hero">
        <div class="container">
          <div class="hero__content">
            <h1 class="hero__title">
              Unlock Your Potential,
              <span class="hero__title-highlight"> One Question</span> at a Time
            </h1>
            <p class="hero__subtitle">Experience the future of learning with AI-powered quizzes that adapt to your unique learning style and accelerate your academic success.</p>
            <div class="hero__cta">
              <a href="#" class="btn btn--primary btn--lg btn--glow" data-route="/subjects">
                <span>Start Your Journey</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      <section class="features">
        <div class="container">
          <div class="features__grid">
            <div class="feature-card" tabindex="0">
              <div class="feature-card__inner">
                <div class="feature-card__front">
                  <div class="feature-card__icon">${createIcon('brain', 48)}</div>
                  <h3>AI-Powered Learning</h3>
                  <p>Smart algorithms that understand you</p>
                </div>
                <div class="feature-card__back">
                  <h3>AI-Powered Learning</h3>
                  <p>Our advanced AI analyzes your learning patterns, identifies knowledge gaps, and creates customized question sets that challenge you at the perfect difficulty level.</p>
                </div>
              </div>
            </div>
            <div class="feature-card" tabindex="0">
              <div class="feature-card__inner">
                <div class="feature-card__front">
                  <div class="feature-card__icon">${createIcon('zap', 48)}</div>
                  <h3>Instant Feedback</h3>
                  <p>Real-time explanations and insights</p>
                </div>
                <div class="feature-card__back">
                  <h3>Instant Feedback</h3>
                  <p>Get comprehensive explanations instantly, with detailed breakdowns of concepts, common mistakes, and connections to related topics for deeper learning.</p>
                </div>
              </div>
            </div>
            <div class="feature-card" tabindex="0">
              <div class="feature-card__inner">
                <div class="feature-card__front">
                  <div class="feature-card__icon">${createIcon('rocket', 48)}</div>
                  <h3>Accelerated Growth</h3>
                  <p>Track progress and achieve goals faster</p>
                </div>
                <div class="feature-card__back">
                  <h3>Accelerated Growth</h3>
                  <p>Monitor your improvement with detailed analytics, celebrate milestones, and stay motivated with gamified learning experiences that make studying enjoyable.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

