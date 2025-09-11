import { appData } from '../state.js';
import { getDifficultyColor } from '../utils.js';

export function renderSubjectsPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="subjects-page">
      <div class="container">
        <div class="subjects-header">
          <h1 class="page-title">Choose Your Subject</h1>
          <p class="page-subtitle">Select from our comprehensive catalog of technical subjects</p>
        </div>
        <div class="subjects-grid">
          ${appData.subjects.map(subject => `
            <div class="subject-card" data-subject="${subject.id}">
              <div class="subject-card__inner">
                <div class="subject-card__icon" style="color: ${subject.color}">${subject.icon}</div>
                <h3 class="subject-card__title">${subject.title}</h3>
                <p class="subject-card__description">${subject.description}</p>
                <div class="subject-card__stats">
                  <div class="stat"><span class="stat__label">Quizzes</span><span class="stat__value">${subject.quizzes}</span></div>
                  <div class="stat"><span class="stat__label">Difficulty</span><span class="stat__value stat__value--difficulty" style="color: ${getDifficultyColor(subject.difficulty)}">${subject.difficulty}</span></div>
                </div>
                <div class="subject-card__progress">
                  <div class="progress-label"><span>Progress</span><span>${subject.progress}%</span></div>
                  <div class="progress-bar"><div class="progress-bar__fill subject-progress" style="background: ${subject.color}; width: ${subject.progress}%"></div></div>
                </div>
                <a href="#" class="btn btn--primary btn--full btn--3d" data-route="/quiz" data-subject="${subject.id}">Start Learning</a>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;

  setTimeout(() => {
    document.querySelectorAll('.subject-progress').forEach((bar, index) => {
      setTimeout(() => { bar.style.width = bar.style.width; }, index * 200);
    });
  }, 500);
}

