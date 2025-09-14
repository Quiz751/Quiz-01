// js/pages/chapters.js

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject') || 'algorithms';

    // ======== Put your subjects and their chapters here ========
    const subjectsData = {
        "algorithms": {
            name: "Algorithms & Data Structures",
            chapters: [
                { name: "Sorting Algorithms", description: "Bubble, Merge, Quick and more." },
                { name: "Searching Algorithms", description: "Binary search, linear search." },
                { name: "Dynamic Programming", description: "DP patterns and examples." },
                { name: "Graph Algorithms", description: "BFS, DFS, shortest paths." }
            ]
        },
        "databases": {
            name: "Database Systems",
            chapters: [
                { name: "SQL Basics", description: "SELECT, INSERT, UPDATE, DELETE." },
                { name: "Joins & Queries", description: "Inner, Left, Right, Full joins." },
                { name: "Normalization", description: "1NF, 2NF, 3NF concepts." },
                { name: "Indexing & Optimization", description: "Indexes, EXPLAIN." }
            ]
        },
        "operating-systems": {
            name: "Operating Systems",
            chapters: [
                { name: "Process Management", description: "Processes, threads, context switch." },
                { name: "Memory Management", description: "Paging, segmentation, virtual memory." },
                { name: "Scheduling", description: "FCFS, SJF, Round Robin." },
                { name: "File Systems", description: "FS basics, permissions." }
            ]
        },
        "cybersecurity": {
            name: "Cybersecurity",
            chapters: [
                { name: "Cryptography", description: "Symmetric/asymmetric encryption basics." },
                { name: "Network Security", description: "Firewalls, VPNs, secure protocols." },
                { name: "Web Security", description: "XSS, CSRF, SQLi prevention." },
                { name: "Ethical Hacking", description: "Pentesting intro and tools." }
            ]
        },
        "machine-learning": {
            name: "Machine Learning",
            chapters: [
                { name: "Supervised Learning", description: "Regression and classification." },
                { name: "Unsupervised Learning", description: "Clustering, dimensionality reduction." },
                { name: "Neural Networks", description: "Perceptron, forward/backprop." },
                { name: "Model Evaluation", description: "Metrics, cross-validation." }
            ]
        },
        "web-development": {
            name: "Web Development",
            chapters: [
                { name: "HTML & CSS", description: "Structure and styling web pages." },
                { name: "JavaScript Basics", description: "DOM, events, JS fundamentals." },
                { name: "Frontend Frameworks", description: "React, Vue, Angular overview." },
                { name: "Backend Development", description: "APIs, server, databases." }
            ]
        },
        // optional: AI Quiz subject (if you included it)
        "ai-quiz": {
            name: "AI Adaptive Quiz",
            chapters: [
                { name: "Adaptive Quiz", description: "AI generates personalized questions." }
            ]
        }
    };
    // ======== end subjectsData ========

    showLoadingState();

    setTimeout(() => {
        loadChapters(subject, subjectsData);
        setupChapterNavigation();
    }, 250);
});

function loadChapters(subject, subjectsData) {
    const subjectData = subjectsData[subject];

    if (!subjectData) {
        showErrorState("Subject not found. Please go back to Subjects.");
        return;
    }

    // Update page title and breadcrumb
    const subjectNameEl = document.getElementById('subjectName');
    const pageTitleEl = document.getElementById('pageTitle');
    if (subjectNameEl) subjectNameEl.textContent = subjectData.name;
    if (pageTitleEl) pageTitleEl.textContent = `${subjectData.name} Chapters`;

    // Generate chapter cards
    const chaptersGrid = document.getElementById('chaptersGrid');
    if (!chaptersGrid) return;
    chaptersGrid.innerHTML = '';

    subjectData.chapters.forEach((chapter, index) => {
        const chapterCard = createChapterCard(chapter, subject, index);
        chaptersGrid.appendChild(chapterCard);
    });
}

function createChapterCard(chapter, subject, index) {
    const card = document.createElement('a');
    card.className = 'chapter-card';

    // create safe chapter slug (kebab-case)
    const slug = chapter.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    card.href = `quiz.html?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(slug)}`;
    card.setAttribute('data-chapter', slug);

    card.innerHTML = `
        <div class="chapter-card__content">
            <h3 class="chapter-card__title">${chapter.name}</h3>
            <p class="chapter-card__description">${chapter.description}</p>
        </div>
    `;
    return card;
}

function setupChapterNavigation() {
    const chapterCards = document.querySelectorAll('.chapter-card');
    chapterCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            this.style.transform = 'scale(0.97)';
            setTimeout(() => {
                this.style.transform = '';
                window.location.href = this.href;
            }, 120);
        });
    });
}

window.addEventListener('popstate', function() {
    window.location.reload();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        window.location.href = 'subjects.html';
    }
});

// Loading UI
function showLoadingState() {
    const chaptersGrid = document.getElementById('chaptersGrid');
    if (!chaptersGrid) return;
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

// Error UI
function showErrorState(message) {
    const chaptersGrid = document.getElementById('chaptersGrid');
    if (!chaptersGrid) return;
    chaptersGrid.innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Oops! Something went wrong</h3>
            <p>${message}</p>
            <a href="subjects.html" class="btn btn--primary">Back to Subjects</a>
        </div>
    `;
}
