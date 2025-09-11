import { createIcon } from '../utils.js';
import { appData } from '../state.js';

export function renderQuizPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('subject') || 'general';
  const subject = appData.subjects.find(s => s.id === subjectId) || { title: 'General Knowledge' };
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="quiz-page">
      <div class="container">
        <div class="quiz-container">
          <div class="quiz-header">
            <h1>${subject.title} Quiz</h1>
            <div class="quiz-stats">
              <div class="quiz-stat">${createIcon('clock', 20)}<span>15 minutes</span></div>
              <div class="quiz-stat">${createIcon('target', 20)}<span>20 questions</span></div>
            </div>
          </div>
          <div class="quiz-content">
            <div class="quiz-instructions">
              <h3>Quiz Instructions</h3>
              <ul>
                <li>You have 15 minutes to complete 20 questions</li>
                <li>Each question is worth 5 points</li>
                <li>You can review and change answers before submitting</li>
                <li>Partial credit is awarded for multiple-choice questions</li>
              </ul>
            </div>
            <div class="quiz-start-btn">
              <button class="btn btn--primary btn--lg btn--3d">${createIcon('play', 20)}Start Quiz</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

